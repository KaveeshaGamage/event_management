const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

module.exports = (db) => {

    const router = express.Router();


    // ==========================================
    // REGISTER FOR EVENT
    // ==========================================
    // POST /api/registrations/:eventId
    // ==========================================

    router.post(
        "/:eventId",
        authenticateToken,

        async (req, res) => {

            try {

                const eventId =
                    req.params.eventId;

                const attendeeId =
                    req.user.id ||
                    req.user.userId;


                // --------------------------------
                // Check logged-in user
                // --------------------------------

                if (!attendeeId) {

                    return res.status(401).json({
                        message:
                            "User ID not found in token"
                    });
                }


                // --------------------------------
                // Check user
                // --------------------------------

                const [users] =
                    await db.execute(
                        `SELECT
                            id,
                            full_name,
                            email,
                            role
                         FROM users
                         WHERE id = ?`,
                        [attendeeId]
                    );


                if (users.length === 0) {

                    return res.status(404).json({
                        message:
                            "User not found"
                    });
                }


                const user = users[0];


                // --------------------------------
                // Only attendee can register
                // --------------------------------

                if (user.role !== "attendee") {

                    return res.status(403).json({
                        message:
                            "Only attendees can register for events"
                    });
                }


                // --------------------------------
                // Check event
                // --------------------------------

                const [events] =
                    await db.execute(
                        `SELECT
                            id,
                            title,
                            capacity
                         FROM events
                         WHERE id = ?`,
                        [eventId]
                    );


                if (events.length === 0) {

                    return res.status(404).json({
                        message:
                            "Event not found"
                    });
                }


                const event = events[0];


                // --------------------------------
                // Check duplicate registration
                // --------------------------------

                const [existing] =
                    await db.execute(
                        `SELECT
                            id
                         FROM event_registrations
                         WHERE event_id = ?
                         AND attendee_id = ?`,
                        [
                            eventId,
                            attendeeId
                        ]
                    );


                if (existing.length > 0) {

                    return res.status(400).json({
                        message:
                            "You are already registered for this event"
                    });
                }


                // --------------------------------
                // Count registrations
                // --------------------------------

                const [countResult] =
                    await db.execute(
                        `SELECT
                            COUNT(*) AS registered_count
                         FROM event_registrations
                         WHERE event_id = ?`,
                        [eventId]
                    );


                const registeredCount =
                    Number(
                        countResult[0]
                            .registered_count
                    );


                // --------------------------------
                // Check capacity
                // --------------------------------

                if (
                    registeredCount >=
                    Number(event.capacity)
                ) {

                    return res.status(400).json({
                        message:
                            "This event is full"
                    });
                }


                // --------------------------------
                // INSERT REGISTRATION
                // --------------------------------

                const [result] =
                    await db.execute(
                        `INSERT INTO event_registrations
                        (
                            event_id,
                            attendee_id
                        )
                        VALUES (?, ?)`,
                        [
                            eventId,
                            attendeeId
                        ]
                    );


                // --------------------------------
                // SUCCESS
                // --------------------------------

                res.status(201).json({

                    message:
                        "Successfully registered for the event",

                    registrationId:
                        result.insertId,

                    eventId:
                        Number(eventId),

                    attendeeId:
                        Number(attendeeId)
                });


            } catch (error) {

                console.error(
                    "Event registration error:",
                    error
                );


                // Duplicate protection
                if (
                    error.code ===
                    "ER_DUP_ENTRY"
                ) {

                    return res.status(400).json({
                        message:
                            "You are already registered for this event"
                    });
                }


                res.status(500).json({
                    message:
                        "Failed to register for event"
                });
            }
        }
    );


    // ==========================================
    // GET MY REGISTRATIONS
    // ==========================================
    // GET /api/registrations/my-registrations
    // ==========================================

    router.get(
        "/my-registrations",
        authenticateToken,

        async (req, res) => {

            try {

                const attendeeId =
                    req.user.id ||
                    req.user.userId;


                if (!attendeeId) {

                    return res.status(401).json({
                        message:
                            "User ID not found in token"
                    });
                }


                const [registrations] =
                    await db.execute(
                        `SELECT
                            er.id,
                            er.event_id,
                            er.attendee_id,
                            er.registered_at,

                            e.title,
                            e.description,
                            e.event_date,
                            e.event_time,
                            e.location,
                            e.capacity,
                            e.category,
                            e.image,
                            e.document

                         FROM event_registrations er

                         INNER JOIN events e
                         ON er.event_id = e.id

                         WHERE er.attendee_id = ?

                         ORDER BY
                            e.event_date ASC,
                            e.event_time ASC`,
                        [attendeeId]
                    );


                res.status(200).json(
                    registrations
                );


            } catch (error) {

                console.error(
                    "Get my registrations error:",
                    error
                );


                res.status(500).json({
                    message:
                        "Failed to fetch registrations"
                });
            }
        }
    );


    // ==========================================
    // CANCEL REGISTRATION
    // ==========================================
    // DELETE /api/registrations/:eventId
    // ==========================================

    router.delete(
        "/:eventId",
        authenticateToken,

        async (req, res) => {

            try {

                const eventId =
                    req.params.eventId;

                const attendeeId =
                    req.user.id ||
                    req.user.userId;


                if (!attendeeId) {

                    return res.status(401).json({
                        message:
                            "User ID not found in token"
                    });
                }


                const [result] =
                    await db.execute(
                        `DELETE FROM event_registrations
                         WHERE event_id = ?
                         AND attendee_id = ?`,
                        [
                            eventId,
                            attendeeId
                        ]
                    );


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Registration not found"
                    });
                }


                res.status(200).json({
                    message:
                        "Registration cancelled successfully"
                });


            } catch (error) {

                console.error(
                    "Cancel registration error:",
                    error
                );


                res.status(500).json({
                    message:
                        "Failed to cancel registration"
                });
            }
        }
    );


  // ==========================================
// GET REGISTERED MEMBERS FOR ORGANIZER
// ==========================================
// GET /api/registrations/event/:eventId
// ==========================================

router.get(
    "/event/:eventId",
    authenticateToken,

    async (req, res) => {

        try {

            const eventId = Number(req.params.eventId);

            const organizerId =
                req.user.id ||
                req.user.userId;

            console.log("=================================");
            console.log("REGISTERED ATTENDEES REQUEST");
            console.log("Event ID:", eventId);
            console.log("Organizer ID:", organizerId);
            console.log("User Role:", req.user.role);
            console.log("=================================");


            // --------------------------------
            // Validate user
            // --------------------------------

            if (!organizerId) {

                return res.status(401).json({
                    message:
                        "User ID not found in token"
                });
            }


            // --------------------------------
            // Only organizer can view attendees
            // --------------------------------

            if (req.user.role !== "organizer") {

                return res.status(403).json({
                    message:
                        "Only organizers can view registered attendees"
                });
            }


            // --------------------------------
            // Check event exists
            // --------------------------------

            const [eventRows] =
                await db.execute(
                    `SELECT
                        id,
                        organizer_id,
                        title,
                        description,
                        event_date,
                        event_time,
                        location,
                        capacity,
                        category,
                        image,
                        document
                     FROM events
                     WHERE id = ?`,
                    [eventId]
                );


            if (eventRows.length === 0) {

                return res.status(404).json({
                    message:
                        "Event does not exist"
                });
            }


            const event = eventRows[0];


            // --------------------------------
            // Check event belongs to organizer
            // --------------------------------

            if (
                Number(event.organizer_id) !==
                Number(organizerId)
            ) {

                console.log(
                    "Ownership check failed:",
                    {
                        eventOrganizer:
                            event.organizer_id,

                        loggedInOrganizer:
                            organizerId
                    }
                );

                return res.status(403).json({
                    message:
                        "You are not the organizer of this event"
                });
            }


            // --------------------------------
            // Get registered attendees
            // --------------------------------

            const [members] =
                await db.execute(
                    `SELECT
                        er.id AS registration_id,
                        er.event_id,
                        er.attendee_id,
                        er.registered_at,

                        u.full_name AS attendee_name,
                        u.email AS attendee_email

                     FROM event_registrations er

                     INNER JOIN users u
                     ON er.attendee_id = u.id

                     WHERE er.event_id = ?

                     ORDER BY
                        er.registered_at ASC`,
                    [eventId]
                );


            // --------------------------------
            // SUCCESS
            // --------------------------------

            console.log(
                "Registered attendees:",
                members
            );


            res.status(200).json({

                event: event,

                registeredCount:
                    members.length,

                members: members

            });


        } catch (error) {

            console.error(
                "Get event members error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch registered members"
            });
        }
    }
);
    return router;
};
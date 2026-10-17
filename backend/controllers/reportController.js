const db = require("../db");


// ========================================
// GET EVENT REPORT
// ========================================

exports.getEventReport = async (req, res) => {

    try {

        const { eventId } = req.params;

        if (!eventId) {
            return res.status(400).json({
                message: "Event ID is required"
            });
        }


        // ========================================
        // EVENT INFORMATION
        // ========================================

        const [eventRows] = await db.query(
            `
            SELECT
                e.id,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.capacity,
                e.category,
                e.created_at,

                u.id AS organizer_id,
                u.full_name AS organizer_name,
                u.email AS organizer_email

            FROM events e

            INNER JOIN users u
                ON e.organizer_id = u.id

            WHERE e.id = ?
            `,
            [eventId]
        );


        if (eventRows.length === 0) {

            return res.status(404).json({
                message: "Event not found"
            });

        }


        const event = eventRows[0];


        // ========================================
        // REGISTRATIONS
        // ========================================

        const [registrationRows] = await db.query(
            `
            SELECT
                er.id,
                er.attendee_id,
                u.full_name,
                u.email,
                er.registered_at

            FROM event_registrations er

            INNER JOIN users u
                ON er.attendee_id = u.id

            WHERE er.event_id = ?

            ORDER BY er.registered_at ASC
            `,
            [eventId]
        );


        // ========================================
        // COMMITTEE MEMBERS
        // ========================================

        const [committeeRows] = await db.query(
            `
            SELECT
                ecm.id,
                u.id AS user_id,
                u.full_name,
                u.email,

                cp.id AS position_id,
                cp.position_name,
                cp.description AS position_description,

                ecm.assigned_at

            FROM event_committee_members ecm

            INNER JOIN users u
                ON ecm.user_id = u.id

            INNER JOIN committee_positions cp
                ON ecm.position_id = cp.id

            WHERE ecm.event_id = ?

            ORDER BY cp.position_name ASC
            `,
            [eventId]
        );


        // ========================================
        // TASKS
        // ========================================

        const [taskRows] = await db.query(
            `
            SELECT
                t.id,
                t.title,
                t.description,
                t.due_date,
                t.category,
                t.priority,
                t.status,

                t.assigned_to,
                u.full_name AS assigned_user

            FROM event_tasks t

            LEFT JOIN users u
                ON t.assigned_to = u.id

            WHERE t.event_id = ?

            ORDER BY t.due_date ASC
            `,
            [eventId]
        );


        // ========================================
        // RESOURCE BOOKINGS
        // ========================================

        const [resourceRows] = await db.query(
            `
            SELECT
                b.id,
                b.resource_id,

                r.name AS resource_name,
                r.type AS resource_type,
                r.description AS resource_description,

                b.start_datetime,
                b.end_datetime

            FROM event_resource_bookings b

            INNER JOIN event_resources r
                ON b.resource_id = r.id

            WHERE b.event_id = ?

            ORDER BY b.start_datetime ASC
            `,
            [eventId]
        );


        // ========================================
        // TASK STATISTICS
        // ========================================

        const taskSummary = {
            total: taskRows.length,

            pending: taskRows.filter(
                task => task.status === "Pending"
            ).length,

            inProgress: taskRows.filter(
                task => task.status === "In Progress"
            ).length,

            completed: taskRows.filter(
                task => task.status === "Completed"
            ).length
        };


        // ========================================
        // REGISTRATION STATISTICS
        // ========================================

        const registrationSummary = {

            total: registrationRows.length,

            capacity: event.capacity,

            available:
                Math.max(
                    event.capacity -
                    registrationRows.length,
                    0
                ),

            percentage:
                event.capacity > 0
                    ? Math.round(
                        (
                            registrationRows.length /
                            event.capacity
                        ) * 100
                    )
                    : 0
        };


        // ========================================
        // RESOURCE SUMMARY
        // ========================================

        const resourceSummary = {

            total: resourceRows.length,

            uniqueResources:
                new Set(
                    resourceRows.map(
                        booking => booking.resource_id
                    )
                ).size
        };


        // ========================================
        // FINAL REPORT
        // ========================================

        const report = {

            event: event,

            summary: {

                registrations:
                    registrationSummary,

                committee:
                    committeeRows.length,

                tasks:
                    taskSummary,

                resources:
                    resourceSummary
            },

            registrations:
                registrationRows,

            committeeMembers:
                committeeRows,

            tasks:
                taskRows,

            resourceBookings:
                resourceRows

        };


        res.status(200).json(report);


    } catch (error) {

        console.error(
            "Get event report error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to generate event report",

            error:
                error.message

        });

    }

};

// ======================================================
// GET ALL EVENTS FOR LOGGED-IN ORGANIZER
// ======================================================

exports.getOrganizerEvents = async (req, res) => {

    try {

        // authenticateToken should put the logged-in
        // user's information inside req.user

        const organizerId =
            req.user.id;

        console.log(
            "Loading events for organizer:",
            organizerId
        );


        const [events] = await db.query(
            `
            SELECT
                e.id,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.capacity,
                e.category,
                e.image,
                e.document,
                e.created_at,

                u.full_name AS organizer_name,

                (
                    SELECT COUNT(*)
                    FROM event_registrations er
                    WHERE er.event_id = e.id
                ) AS registration_count,

                (
                    SELECT COUNT(*)
                    FROM event_tasks t
                    WHERE t.event_id = e.id
                ) AS task_count,

                (
                    SELECT COUNT(*)
                    FROM event_committee_members ecm
                    WHERE ecm.event_id = e.id
                ) AS committee_count,

                (
                    SELECT COUNT(*)
                    FROM event_resource_bookings erb
                    WHERE erb.event_id = e.id
                ) AS resource_booking_count

            FROM events e

            INNER JOIN users u
                ON e.organizer_id = u.id

            WHERE e.organizer_id = ?

            ORDER BY
                e.event_date ASC,
                e.event_time ASC
            `,
            [organizerId]
        );


        res.status(200).json(events);

    } catch (error) {

        console.error(
            "Get organizer events error:",
            error
        );

        res.status(500).json({
            message: "Failed to load organizer events",
            error: error.message
        });

    }

};
const db = require("../db");


// ==========================================
// FORMAT DATETIME FOR MYSQL
// ==========================================

const formatMySQLDateTime = (value) => {

    if (!value) {
        return null;
    }

    let formatted = String(value).trim();

    // Convert T to space
    formatted = formatted.replace("T", " ");

    // Remove milliseconds
    formatted = formatted.split(".")[0];

    // Add seconds if missing
    if (formatted.length === 16) {
        formatted += ":00";
    }

    // Keep only YYYY-MM-DD HH:mm:ss
    if (formatted.length > 19) {
        formatted = formatted.substring(0, 19);
    }

    return formatted;
};


// ==========================================
// GET ALL RESOURCES
// ==========================================

exports.getResources = async (req, res) => {

    try {

        const [resources] = await db.query(`
            SELECT
                id,
                name,
                type,
                description,
                created_at
            FROM event_resources
            ORDER BY name ASC
        `);

        res.status(200).json(resources);

    } catch (error) {

        console.error("Get resources error:", error);

        res.status(500).json({
            message: "Failed to fetch resources",
            error: error.message
        });
    }
};


// ==========================================
// CREATE RESOURCE
// ==========================================

exports.createResource = async (req, res) => {

    try {

        const {
            name,
            type,
            description
        } = req.body || {};


        if (!name || !name.trim()) {

            return res.status(400).json({
                message: "Resource name is required"
            });
        }


        const resourceType = type || "Other";


        const [result] = await db.query(`
            INSERT INTO event_resources
            (
                name,
                type,
                description
            )
            VALUES (?, ?, ?)
        `, [
            name.trim(),
            resourceType,
            description || null
        ]);


        res.status(201).json({

            message: "Resource created successfully",

            resource: {
                id: result.insertId,
                name: name.trim(),
                type: resourceType,
                description: description || null
            }

        });

    } catch (error) {

        console.error("Create resource error:", error);

        res.status(500).json({
            message: "Failed to create resource",
            error: error.message
        });
    }
};


// ==========================================
// CHECK RESOURCE AVAILABILITY
// ==========================================

exports.checkAvailability = async (req, res) => {

    try {

        const {
            resource_id,
            start_datetime,
            end_datetime
        } = req.query;


        if (
            !resource_id ||
            !start_datetime ||
            !end_datetime
        ) {

            return res.status(400).json({
                message:
                    "resource_id, start_datetime and end_datetime are required"
            });
        }


        const mysqlStart =
            formatMySQLDateTime(start_datetime);

        const mysqlEnd =
            formatMySQLDateTime(end_datetime);


        if (!mysqlStart || !mysqlEnd) {

            return res.status(400).json({
                message: "Invalid date/time format"
            });
        }


        const [bookings] = await db.query(`
            SELECT

                b.id,

                b.event_id,

                b.resource_id,

                b.start_datetime,

                b.end_datetime,

                e.title AS event_title

            FROM event_resource_bookings b

            LEFT JOIN events e
                ON b.event_id = e.id

            WHERE b.resource_id = ?

            AND b.start_datetime < ?

            AND b.end_datetime > ?

            ORDER BY b.start_datetime ASC
        `, [
            resource_id,
            mysqlEnd,
            mysqlStart
        ]);


        res.status(200).json({

            available:
                bookings.length === 0,

            conflicts:
                bookings

        });

    } catch (error) {

        console.error("Availability error:", error);

        res.status(500).json({

            message:
                "Failed to check availability",

            error:
                error.message

        });
    }
};


// ==========================================
// BOOK RESOURCE
// ==========================================

exports.bookResource = async (req, res) => {

    try {

        console.log("=================================");
        console.log("BOOK RESOURCE REQUEST");
        console.log("Request body:", req.body);
        console.log("=================================");


        // IMPORTANT:
        // Use req.body || {} so the server does not crash
        // if the frontend sends no body.

        const {
            event_id,
            resource_id,
            start_datetime,
            end_datetime
        } = req.body || {};


        // ==========================================
        // VALIDATE REQUEST BODY
        // ==========================================

        if (!req.body) {

            return res.status(400).json({

                message:
                    "Request body is missing"

            });
        }


        // ==========================================
        // VALIDATE FIELDS
        // ==========================================

        if (
            !event_id ||
            !resource_id ||
            !start_datetime ||
            !end_datetime
        ) {

            return res.status(400).json({

                message:
                    "All booking fields are required",

                received: {
                    event_id,
                    resource_id,
                    start_datetime,
                    end_datetime
                }

            });
        }


        // ==========================================
        // FORMAT DATETIME
        // ==========================================

        const mysqlStart =
            formatMySQLDateTime(start_datetime);

        const mysqlEnd =
            formatMySQLDateTime(end_datetime);


        console.log("Start datetime:", mysqlStart);
        console.log("End datetime:", mysqlEnd);


        if (!mysqlStart || !mysqlEnd) {

            return res.status(400).json({

                message:
                    "Invalid date/time format"

            });
        }


        // ==========================================
        // CHECK START < END
        // ==========================================

        const startDate =
            new Date(start_datetime);

        const endDate =
            new Date(end_datetime);


        if (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime())
        ) {

            return res.status(400).json({

                message:
                    "Invalid date/time format"

            });
        }


        if (startDate >= endDate) {

            return res.status(400).json({

                message:
                    "End datetime must be after start datetime"

            });
        }


        // ==========================================
        // CHECK EVENT EXISTS
        // ==========================================

        const [eventRows] = await db.query(`
            SELECT
                id,
                title
            FROM events
            WHERE id = ?
        `, [event_id]);


        if (eventRows.length === 0) {

            return res.status(404).json({

                message:
                    "Event not found"

            });
        }


        // ==========================================
        // CHECK RESOURCE EXISTS
        // ==========================================

        const [resourceRows] = await db.query(`
            SELECT
                id,
                name,
                type
            FROM event_resources
            WHERE id = ?
        `, [resource_id]);


        if (resourceRows.length === 0) {

            return res.status(404).json({

                message:
                    "Resource not found"

            });
        }


        // ==========================================
        // CHECK RESOURCE CONFLICT
        // ==========================================

        const [conflicts] = await db.query(`
            SELECT

                b.id,

                b.event_id,

                b.resource_id,

                b.start_datetime,

                b.end_datetime,

                e.title AS event_title

            FROM event_resource_bookings b

            LEFT JOIN events e
                ON b.event_id = e.id

            WHERE b.resource_id = ?

            AND b.start_datetime < ?

            AND b.end_datetime > ?

            ORDER BY b.start_datetime ASC
        `, [
            resource_id,
            mysqlEnd,
            mysqlStart
        ]);


        // ==========================================
        // CONFLICT FOUND
        // ==========================================

        if (conflicts.length > 0) {

            return res.status(409).json({

                message:
                    "Resource is already booked during this period",

                conflict: true,

                conflicts

            });
        }


        // ==========================================
        // CREATE BOOKING
        // ==========================================

        const [result] = await db.query(`
            INSERT INTO event_resource_bookings
            (
                event_id,
                resource_id,
                start_datetime,
                end_datetime
            )
            VALUES (?, ?, ?, ?)
        `, [
            event_id,
            resource_id,
            mysqlStart,
            mysqlEnd
        ]);


        // ==========================================
        // SUCCESS
        // ==========================================

        console.log(
            "Resource booking created:",
            result.insertId
        );


        res.status(201).json({

            message:
                "Resource booked successfully",

            booking_id:
                result.insertId,

            booking: {

                id:
                    result.insertId,

                event_id:
                    Number(event_id),

                resource_id:
                    Number(resource_id),

                start_datetime:
                    mysqlStart,

                end_datetime:
                    mysqlEnd

            }

        });

    } catch (error) {

        // ==========================================
        // DATABASE ERROR
        // ==========================================

        console.error("=================================");
        console.error("BOOK RESOURCE ERROR");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("SQL:", error.sql);
        console.error("=================================");


        res.status(500).json({

            message:
                "Failed to book resource",

            error:
                error.message,

            code:
                error.code

        });
    }
};


// ==========================================
// GET RESOURCE BOOKINGS FOR EVENT
// ==========================================

exports.getResourceBookings = async (req, res) => {

    try {

        const {
            eventId
        } = req.params;


        if (!eventId) {

            return res.status(400).json({

                message:
                    "Event ID is required"

            });
        }


        // ==========================================
        // CHECK EVENT
        // ==========================================

        const [eventRows] = await db.query(`
            SELECT
                id,
                title
            FROM events
            WHERE id = ?
        `, [eventId]);


        if (eventRows.length === 0) {

            return res.status(404).json({

                message:
                    "Event not found"

            });
        }


        // ==========================================
        // GET BOOKINGS
        // ==========================================

        const [bookings] = await db.query(`
            SELECT

                b.id,

                b.event_id,

                b.resource_id,

                r.name AS resource_name,

                r.type AS resource_type,

                r.description AS resource_description,

                b.start_datetime,

                b.end_datetime,

                e.title AS event_title

            FROM event_resource_bookings b

            INNER JOIN event_resources r
                ON b.resource_id = r.id

            INNER JOIN events e
                ON b.event_id = e.id

            WHERE b.event_id = ?

            ORDER BY b.start_datetime ASC
        `, [eventId]);


        res.status(200).json(bookings);

    } catch (error) {

        console.error(
            "Get resource bookings error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch resource bookings",

            error:
                error.message

        });
    }
};


// ==========================================
// DELETE BOOKING
// ==========================================

exports.deleteBooking = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        if (!id) {

            return res.status(400).json({

                message:
                    "Booking ID is required"

            });
        }


        // ==========================================
        // CHECK BOOKING EXISTS
        // ==========================================

        const [bookingRows] = await db.query(`
            SELECT
                id
            FROM event_resource_bookings
            WHERE id = ?
        `, [id]);


        if (bookingRows.length === 0) {

            return res.status(404).json({

                message:
                    "Booking not found"

            });
        }


        // ==========================================
        // DELETE BOOKING
        // ==========================================

        await db.query(`
            DELETE FROM event_resource_bookings
            WHERE id = ?
        `, [id]);


        res.status(200).json({

            message:
                "Booking deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete booking error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to delete booking",

            error:
                error.message

        });
    }
};

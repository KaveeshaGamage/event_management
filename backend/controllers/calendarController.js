const db = require("../db");

// ==========================================
// GET CALENDAR
// ==========================================

exports.getCalendar = async (req, res) => {
    try {
        const { start, end } = req.query;

        // ==========================================
        // GET EVENTS
        // ==========================================

        let eventQuery = `
            SELECT
                e.id,
                e.title AS name,
                e.description,
                e.event_date AS start_date,
                e.event_date AS end_date,
                e.event_date,
                e.event_time,
                e.location,
                e.capacity,
                e.category,
                'event' AS item_type

            FROM events e
        `;

        let eventParams = [];

        // Filter events by date range
        if (start && end) {
            eventQuery += `
                WHERE e.event_date <= ?
                AND e.event_date >= ?
            `;

            eventParams = [
                end,
                start
            ];
        }

        eventQuery += `
            ORDER BY e.event_date ASC, e.event_time ASC
        `;

        const [events] = await db.query(
            eventQuery,
            eventParams
        );


        // ==========================================
        // GET TASKS
        // ==========================================

        let taskQuery = `
            SELECT
                t.id,
                t.event_id,

                -- Task information
                t.title AS name,
                t.title,
                t.description,
                t.due_date AS start_date,
                t.due_date AS end_date,
                t.due_date,

                t.category,
                t.priority,
                t.status,
                t.assigned_to,

                -- Assigned committee member
                u.full_name AS assigned_user,

                -- Event this task belongs to
                e.title AS event_title,

                'task' AS item_type

            FROM event_tasks t

            LEFT JOIN users u
                ON t.assigned_to = u.id

            INNER JOIN events e
                ON t.event_id = e.id
        `;

        let taskParams = [];

        // Filter tasks by date range
        if (start && end) {
            taskQuery += `
                WHERE t.due_date BETWEEN ? AND ?
            `;

            taskParams = [
                start,
                end
            ];
        }

        taskQuery += `
            ORDER BY t.due_date ASC
        `;

        const [tasks] = await db.query(
            taskQuery,
            taskParams
        );


        // ==========================================
        // COMBINE EVENTS + TASKS
        // ==========================================

        const calendarItems = [
            ...events,
            ...tasks
        ];

        console.log(
            "Calendar items:",
            calendarItems
        );

        res.json(calendarItems);

    } catch (error) {

        console.error(
            "Calendar error:",
            error
        );

        res.status(500).json({
            message: "Failed to load calendar",
            error: error.message
        });
    }
};

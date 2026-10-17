const db = require("../db");


// ==========================================
// HELPER FUNCTION
// Convert JavaScript ISO date to MySQL DATETIME
// ==========================================

const formatMySQLDateTime = (dateValue) => {

    if (!dateValue) {
        return null;
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
};


// ==========================================
// GET TASKS FOR EVENT
// ==========================================

exports.getEventTasks = async (req, res) => {

    try {

        const { eventId } = req.params;

        const [tasks] = await db.query(
            `
            SELECT
                t.id,
                t.event_id,
                t.assigned_to,
                t.title,
                t.description,
                t.due_date,
                t.category,
                t.priority,
                t.status,
                t.created_at,

                u.full_name AS assigned_user

            FROM event_tasks t

            LEFT JOIN users u
                ON t.assigned_to = u.id

            WHERE t.event_id = ?

            ORDER BY t.due_date ASC
            `,
            [eventId]
        );

        res.json(tasks);

    } catch (error) {

        console.error(
            "Get event tasks error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};


// ==========================================
// CREATE TASK
// ==========================================

exports.createTask = async (req, res) => {

    try {

        const { eventId } = req.params;

        const {
            title,
            description,
            due_date,
            assigned_to,
            category,
            priority
        } = req.body;


        // Validate required fields
        if (!title || !due_date) {

            return res.status(400).json({
                message: "Title and due date are required"
            });
        }


        // Convert ISO date to MySQL DATETIME
        const formattedDueDate =
            formatMySQLDateTime(due_date);


        if (!formattedDueDate) {

            return res.status(400).json({
                message: "Invalid due date"
            });
        }


        // Insert task
        const [result] = await db.query(
            `
            INSERT INTO event_tasks
            (
                event_id,
                assigned_to,
                title,
                description,
                due_date,
                category,
                priority
            )

            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                eventId,
                assigned_to || null,
                title,
                description || null,
                formattedDueDate,
                category || "Other",
                priority || "Medium"
            ]
        );


        res.status(201).json({

            message: "Task created successfully",

            task: {

                id: result.insertId,

                event_id: eventId,

                assigned_to:
                    assigned_to || null,

                title,

                description:
                    description || null,

                due_date:
                    formattedDueDate,

                category:
                    category || "Other",

                priority:
                    priority || "Medium",

                status:
                    "Pending"
            }
        });

    } catch (error) {

        console.error(
            "Create task error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to create task",

            error:
                error.message
        });
    }
};


// ==========================================
// UPDATE TASK
// ==========================================

exports.updateTask = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            description,
            due_date,
            assigned_to,
            category,
            priority,
            status
        } = req.body;


        // Convert ISO date to MySQL DATETIME
        const formattedDueDate =
            formatMySQLDateTime(due_date);


        if (!formattedDueDate) {

            return res.status(400).json({
                message: "Invalid due date"
            });
        }


        // Update task
        await db.query(
            `
            UPDATE event_tasks

            SET
                title = ?,
                description = ?,
                due_date = ?,
                assigned_to = ?,
                category = ?,
                priority = ?,
                status = ?

            WHERE id = ?
            `,
            [
                title,
                description || null,
                formattedDueDate,
                assigned_to || null,
                category,
                priority,
                status,
                id
            ]
        );


        res.json({

            message:
                "Task updated successfully"
        });

    } catch (error) {

        console.error(
            "Update task error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update task",

            error:
                error.message
        });
    }
};


// ==========================================
// DELETE TASK
// ==========================================

exports.deleteTask = async (req, res) => {

    try {

        const { id } = req.params;


        await db.query(
            `
            DELETE FROM event_tasks

            WHERE id = ?
            `,
            [id]
        );


        res.json({

            message:
                "Task deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to delete task",

            error:
                error.message
        });
    }
};
const db = require("../db");

// ======================================================
// GET ORGANIZER DASHBOARD
// ======================================================

exports.getDashboard = async (req, res) => {
    try {

        // ------------------------------------------------
        // GET LOGGED-IN USER
        // ------------------------------------------------

        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({
                message: "User ID not found"
            });
        }

        console.log(
            "Loading dashboard for user:",
            userId
        );


        // =================================================
        // 1. TOTAL EVENTS CREATED BY USER
        // =================================================

        const [eventCountRows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM events
            WHERE organizer_id = ?
            `,
            [userId]
        );

        const totalEvents =
            Number(eventCountRows[0].total);


        // =================================================
        // 2. UPCOMING EVENTS CREATED BY USER
        // =================================================

        const [upcomingEventCountRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM events
                WHERE organizer_id = ?
                AND event_date >= CURDATE()
                `,
                [userId]
            );

        const upcomingEvents =
            Number(upcomingEventCountRows[0].total);


        // =================================================
        // 3. TOTAL REGISTRATIONS
        // =================================================

        const [registrationRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM event_registrations er

                INNER JOIN events e
                    ON er.event_id = e.id

                WHERE e.organizer_id = ?
                `,
                [userId]
            );

        const totalRegistrations =
            Number(registrationRows[0].total);


        // =================================================
        // 4. TOTAL TASKS
        // =================================================

        const [taskRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM event_tasks t

                INNER JOIN events e
                    ON t.event_id = e.id

                WHERE e.organizer_id = ?
                `,
                [userId]
            );

        const totalTasks =
            Number(taskRows[0].total);


        // =================================================
        // 5. PENDING TASKS
        // =================================================

        const [pendingTaskRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM event_tasks t

                INNER JOIN events e
                    ON t.event_id = e.id

                WHERE e.organizer_id = ?
                AND t.status = 'Pending'
                `,
                [userId]
            );

        const pendingTasks =
            Number(pendingTaskRows[0].total);


        // =================================================
        // 6. IN PROGRESS TASKS
        // =================================================

        const [inProgressTaskRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM event_tasks t

                INNER JOIN events e
                    ON t.event_id = e.id

                WHERE e.organizer_id = ?
                AND t.status = 'In Progress'
                `,
                [userId]
            );

        const inProgressTasks =
            Number(inProgressTaskRows[0].total);


        // =================================================
        // 7. COMPLETED TASKS
        // =================================================

        const [completedTaskRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM event_tasks t

                INNER JOIN events e
                    ON t.event_id = e.id

                WHERE e.organizer_id = ?
                AND t.status = 'Completed'
                `,
                [userId]
            );

        const completedTasks =
            Number(completedTaskRows[0].total);


        // =================================================
        // 8. COMMITTEE MEMBERS
        // =================================================

        const [committeeRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM event_committee_members ecm

                INNER JOIN events e
                    ON ecm.event_id = e.id

                WHERE e.organizer_id = ?
                `,
                [userId]
            );

        const committeeMembers =
            Number(committeeRows[0].total);


        // =================================================
        // 9. RESOURCE BOOKINGS
        // =================================================

        const [resourceRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM event_resource_bookings erb

                INNER JOIN events e
                    ON erb.event_id = e.id

                WHERE e.organizer_id = ?
                `,
                [userId]
            );

        const resourceBookings =
            Number(resourceRows[0].total);


        // =================================================
        // 10. TOTAL CAPACITY
        // =================================================

        const [capacityRows] =
            await db.query(
                `
                SELECT
                    COALESCE(SUM(capacity), 0) AS total
                FROM events
                WHERE organizer_id = ?
                `,
                [userId]
            );

        const totalCapacity =
            Number(capacityRows[0].total);


        // =================================================
        // 11. EVENT REGISTRATION OVERVIEW
        // =================================================

        const [eventOverviewRows] =
            await db.query(
                `
                SELECT

                    e.id,

                    e.title,

                    e.event_date,

                    e.event_time,

                    e.location,

                    e.capacity,

                    e.category,

                    COUNT(er.id)
                        AS registration_count

                FROM events e

                LEFT JOIN event_registrations er
                    ON e.id = er.event_id

                WHERE e.organizer_id = ?

                GROUP BY
                    e.id,
                    e.title,
                    e.event_date,
                    e.event_time,
                    e.location,
                    e.capacity,
                    e.category

                ORDER BY
                    e.event_date ASC,
                    e.event_time ASC
                `,
                [userId]
            );


        // =================================================
        // 12. UPCOMING EVENTS CREATED BY ORGANIZER
        // =================================================

        const [upcomingEventRows] =
            await db.query(
                `
                SELECT

                    e.id,

                    e.title,

                    e.event_date,

                    e.event_time,

                    e.location,

                    e.capacity,

                    e.category,

                    COUNT(er.id)
                        AS registration_count

                FROM events e

                LEFT JOIN event_registrations er
                    ON e.id = er.event_id

                WHERE e.organizer_id = ?

                AND e.event_date >= CURDATE()

                GROUP BY
                    e.id,
                    e.title,
                    e.event_date,
                    e.event_time,
                    e.location,
                    e.capacity,
                    e.category

                ORDER BY
                    e.event_date ASC,
                    e.event_time ASC

                LIMIT 5
                `,
                [userId]
            );


        // =================================================
        // 13. RECENT TASKS
        // =================================================

        const [recentTaskRows] =
            await db.query(
                `
                SELECT

                    t.id,

                    t.title,

                    t.description,

                    t.due_date,

                    t.category,

                    t.priority,

                    t.status,

                    e.id AS event_id,

                    e.title AS event_title,

                    u.full_name AS assigned_user

                FROM event_tasks t

                INNER JOIN events e
                    ON t.event_id = e.id

                LEFT JOIN users u
                    ON t.assigned_to = u.id

                WHERE e.organizer_id = ?

                ORDER BY
                    t.due_date ASC

                LIMIT 8
                `,
                [userId]
            );


        // =================================================
        // 14. TASK DISTRIBUTION
        // =================================================

        const [taskCategoryRows] =
            await db.query(
                `
                SELECT

                    t.category,

                    COUNT(*) AS total

                FROM event_tasks t

                INNER JOIN events e
                    ON t.event_id = e.id

                WHERE e.organizer_id = ?

                GROUP BY t.category

                ORDER BY total DESC
                `,
                [userId]
            );


        // =================================================
        // 15. COMMITTEE MEMBERS LIST
        // =================================================

        const [committeeMembersList] =
            await db.query(
                `
                SELECT

                    ecm.id,

                    ecm.event_id,

                    e.title AS event_title,

                    u.id AS user_id,

                    u.full_name AS member_name,

                    u.email,

                    cp.position_name,

                    e.event_date

                FROM event_committee_members ecm

                INNER JOIN events e
                    ON ecm.event_id = e.id

                INNER JOIN users u
                    ON ecm.user_id = u.id

                INNER JOIN committee_positions cp
                    ON ecm.position_id = cp.id

                WHERE e.organizer_id = ?

                ORDER BY
                    e.event_date ASC,
                    e.title ASC,
                    cp.position_name ASC
                `,
                [userId]
            );


        // =================================================
        // 16. EVENTS WHERE CURRENT USER IS COMMITTEE MEMBER
        // =================================================
        //
        // This is separate from My Events.
        //
        // My Events = events created by organizer
        //
        // Dashboard = can also show events where the
        // current user is a committee member.
        //
        // =================================================

        const [committeeEventRows] =
            await db.query(
                `
                SELECT

                    e.id,

                    e.title,

                    e.event_date,

                    e.event_time,

                    e.location,

                    e.category,

                    e.organizer_id,

                    organizer.full_name
                        AS organizer_name,

                    cp.position_name
                        AS committee_position

                FROM event_committee_members ecm

                INNER JOIN events e
                    ON ecm.event_id = e.id

                INNER JOIN users organizer
                    ON e.organizer_id = organizer.id

                INNER JOIN committee_positions cp
                    ON ecm.position_id = cp.id

                WHERE ecm.user_id = ?

                ORDER BY
                    e.event_date ASC,
                    e.event_time ASC
                `,
                [userId]
            );


        // =================================================
        // 17. EVENTS AVAILABLE FOR CHAT
        // =================================================
        //
        // Includes:
        //
        // 1. Events created by the current user
        // 2. Events where current user is committee member
        //
        // =================================================

        const [chatEventRows] =
            await db.query(
                `
                SELECT DISTINCT

                    e.id,

                    e.title,

                    e.event_date,

                    e.event_time,

                    e.location,

                    e.category,

                    CASE
                        WHEN e.organizer_id = ?
                            THEN 'Organizer'

                        ELSE 'Committee Member'
                    END AS user_role

                FROM events e

                LEFT JOIN event_committee_members ecm
                    ON e.id = ecm.event_id

                WHERE
                    e.organizer_id = ?

                    OR

                    ecm.user_id = ?

                ORDER BY
                    e.event_date ASC,
                    e.event_time ASC
                `,
                [
                    userId,
                    userId,
                    userId
                ]
            );


        // =================================================
        // 18. REGISTRATION PERCENTAGE
        // =================================================

        const registrationPercentage =
            totalCapacity > 0
                ? Math.round(
                    (totalRegistrations /
                        totalCapacity) * 100
                )
                : 0;


        // =================================================
        // RESPONSE
        // =================================================

        res.status(200).json({

            success: true,

            summary: {

                totalEvents,

                upcomingEvents,

                totalRegistrations,

                totalCapacity,

                registrationPercentage,

                totalTasks,

                pendingTasks,

                inProgressTasks,

                completedTasks,

                committeeMembers,

                resourceBookings

            },

            events:
                eventOverviewRows,

            upcomingEventsList:
                upcomingEventRows,

            recentTasks:
                recentTaskRows,

            taskCategories:
                taskCategoryRows,

            committeeMembersList:
                committeeMembersList,

            committeeEventList:
                committeeEventRows,

            chatEvents:
                chatEventRows

        });


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load dashboard",

            error:
                error.message

        });

    }
};
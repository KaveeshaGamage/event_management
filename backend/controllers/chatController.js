const db = require("../db");


// ======================================================
// CHECK WHETHER USER CAN ACCESS EVENT CHAT
// ======================================================

const checkEventChatAccess = async (
    eventId,
    userId
) => {

    // ----------------------------------------------
    // Check whether user is the event organizer
    // ----------------------------------------------

    const [organizerRows] = await db.query(
        `
        SELECT id
        FROM events
        WHERE id = ?
        AND organizer_id = ?
        `,
        [
            eventId,
            userId
        ]
    );


    if (organizerRows.length > 0) {

        return true;

    }


    // ----------------------------------------------
    // Check whether user is committee member
    // ----------------------------------------------

    const [committeeRows] = await db.query(
        `
        SELECT id
        FROM event_committee_members
        WHERE event_id = ?
        AND user_id = ?
        `,
        [
            eventId,
            userId
        ]
    );


    if (committeeRows.length > 0) {

        return true;

    }


    return false;
};


// ======================================================
// GET EVENT CHAT MESSAGES
// ======================================================

exports.getMessages = async (
    req,
    res
) => {

    try {

        const {
            eventId
        } = req.params;

        const userId =
            req.user.id;


        // ----------------------------------------------
        // Check access
        // ----------------------------------------------

        const hasAccess =
            await checkEventChatAccess(
                eventId,
                userId
            );


        if (!hasAccess) {

            return res.status(403).json({

                success: false,

                message:
                    "You do not have permission to access this event chat."

            });

        }


        // ----------------------------------------------
        // Get messages
        // ----------------------------------------------

        const [messages] =
            await db.query(
                `
                SELECT
                    m.id,
                    m.event_id,
                    m.sender_id,
                    m.message,
                    m.created_at,
                    u.full_name AS sender_name

                FROM event_chat_messages m

                INNER JOIN users u
                    ON m.sender_id = u.id

                WHERE m.event_id = ?

                ORDER BY m.created_at ASC
                `,
                [
                    eventId
                ]
            );


        res.status(200).json({

            success: true,

            messages

        });


    } catch (error) {

        console.error(
            "GET CHAT MESSAGES ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load chat messages."

        });

    }

};


// ======================================================
// SEND MESSAGE
// ======================================================

exports.sendMessage = async (
    req,
    res
) => {

    try {

        const {
            eventId
        } = req.params;

        const {
            message
        } = req.body;

        const userId =
            req.user.id;


        // ----------------------------------------------
        // Validate message
        // ----------------------------------------------

        if (
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Message cannot be empty."

            });

        }


        // ----------------------------------------------
        // Check access
        // ----------------------------------------------

        const hasAccess =
            await checkEventChatAccess(
                eventId,
                userId
            );


        if (!hasAccess) {

            return res.status(403).json({

                success: false,

                message:
                    "You do not have permission to send messages in this event chat."

            });

        }


        // ----------------------------------------------
        // Insert message
        // ----------------------------------------------

        const [result] =
            await db.query(
                `
                INSERT INTO event_chat_messages
                (
                    event_id,
                    sender_id,
                    message
                )
                VALUES (?, ?, ?)
                `,
                [
                    eventId,
                    userId,
                    message.trim()
                ]
            );


        // ----------------------------------------------
        // Get created message
        // ----------------------------------------------

        const [messages] =
            await db.query(
                `
                SELECT
                    m.id,
                    m.event_id,
                    m.sender_id,
                    m.message,
                    m.created_at,
                    u.full_name AS sender_name

                FROM event_chat_messages m

                INNER JOIN users u
                    ON m.sender_id = u.id

                WHERE m.id = ?
                `,
                [
                    result.insertId
                ]
            );


        res.status(201).json({

            success: true,

            message:
                messages[0]

        });


    } catch (error) {

        console.error(
            "SEND CHAT MESSAGE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to send message."

        });

    }

};


// ======================================================
// EXPORT ACCESS CHECK
// ======================================================

exports.checkEventChatAccess =
    checkEventChatAccess;
const db = require("../db");

// Get all committee positions
exports.getPositions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT *
            FROM committee_positions
            ORDER BY position_name
        `);

        res.json(rows);
    } catch (error) {
        console.error("Get positions error:", error);

        res.status(500).json({
            message: "Failed to fetch committee positions"
        });
    }
};


// Get committee members for an event
exports.getEventCommittee = async (req, res) => {
    try {
        const { eventId } = req.params;

        const [rows] = await db.query(`
            SELECT
                ecm.id,
                ecm.event_id,
                ecm.user_id,
                u.full_name,
                u.email,
                cp.id AS position_id,
                cp.position_name,
                cp.description,
                ecm.assigned_at
            FROM event_committee_members ecm
            JOIN users u
                ON ecm.user_id = u.id
            JOIN committee_positions cp
                ON ecm.position_id = cp.id
            WHERE ecm.event_id = ?
            ORDER BY cp.id
        `, [eventId]);

        res.json(rows);

    } catch (error) {
        console.error("Get committee members error:", error);

        res.status(500).json({
            message: "Failed to fetch committee members"
        });
    }
};


// Add committee member
exports.addCommitteeMember = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { user_id, position_id } = req.body;

        if (!user_id || !position_id) {
            return res.status(400).json({
                message: "User and position are required"
            });
        }

        const [result] = await db.query(`
            INSERT INTO event_committee_members
            (event_id, user_id, position_id)
            VALUES (?, ?, ?)
        `, [
            eventId,
            user_id,
            position_id
        ]);

        res.status(201).json({
            message: "Committee member added successfully",
            id: result.insertId
        });

    } catch (error) {
        console.error("Add committee member error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message:
                    "This user or position is already assigned to this event"
            });
        }

        res.status(500).json({
            message: "Failed to add committee member"
        });
    }
};


// Update committee member
exports.updateCommitteeMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { position_id } = req.body;

        if (!position_id) {
            return res.status(400).json({
                message: "Position is required"
            });
        }

        const [result] = await db.query(`
            UPDATE event_committee_members
            SET position_id = ?
            WHERE id = ?
        `, [
            position_id,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Committee member not found"
            });
        }

        res.json({
            message: "Committee member updated successfully"
        });

    } catch (error) {
        console.error("Update committee member error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message:
                    "This position is already assigned to another member"
            });
        }

        res.status(500).json({
            message: "Failed to update committee member"
        });
    }
};


// Remove committee member
exports.removeCommitteeMember = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(`
            DELETE FROM event_committee_members
            WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Committee member not found"
            });
        }

        res.json({
            message: "Committee member removed successfully"
        });

    } catch (error) {
        console.error("Remove committee member error:", error);

        res.status(500).json({
            message: "Failed to remove committee member"
        });
    }
};
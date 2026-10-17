const db = require("../db");

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                full_name,
                email
            FROM users
            ORDER BY full_name
        `);

        res.json(rows);

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};
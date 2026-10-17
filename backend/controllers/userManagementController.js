const db = require("../db");
const bcrypt = require("bcryptjs");


// ==========================================
// GET ALL USERS
// ==========================================
exports.getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;

        let query = `
            SELECT
                id,
                full_name,
                email,
                role,
                created_at
            FROM users
            WHERE 1 = 1
        `;

        const params = [];

        // Search by name or email
        if (search && search.trim()) {
            query += `
                AND (
                    full_name LIKE ?
                    OR email LIKE ?
                )
            `;

            const searchValue = `%${search.trim()}%`;

            params.push(searchValue, searchValue);
        }

        // Filter by role
        if (
            role &&
            (role === "attendee" || role === "organizer")
        ) {
            query += ` AND role = ?`;
            params.push(role);
        }

        query += `
            ORDER BY created_at DESC
        `;

        const [users] = await db.query(
            query,
            params
        );

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error(
            "Get users error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load users",
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE USER
// ==========================================
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `
            SELECT
                id,
                full_name,
                email,
                role,
                created_at
            FROM users
            WHERE id = ?
            `,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error(
            "Get user error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load user",
            error: error.message
        });
    }
};


// ==========================================
// ADD NEW MEMBER
// ==========================================
exports.createUser = async (req, res) => {
    try {

        const {
            full_name,
            email,
            password,
            role
        } = req.body;

        // Validate required fields
        if (
            !full_name ||
            !email ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, email, password and role are required"
            });
        }

        // Validate role
        if (
            role !== "attendee" &&
            role !== "organizer"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters"
            });
        }

        const cleanName =
            full_name.trim();

        const cleanEmail =
            email.trim().toLowerCase();

        // Check duplicate email
        const [existingUsers] =
            await db.query(
                `
                SELECT id
                FROM users
                WHERE email = ?
                `,
                [cleanEmail]
            );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "A user with this email already exists"
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // Insert user
        const [result] =
            await db.query(
                `
                INSERT INTO users
                (
                    full_name,
                    email,
                    password,
                    role
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    cleanName,
                    cleanEmail,
                    hashedPassword,
                    role
                ]
            );

        // Get created user
        const [users] =
            await db.query(
                `
                SELECT
                    id,
                    full_name,
                    email,
                    role,
                    created_at
                FROM users
                WHERE id = ?
                `,
                [result.insertId]
            );

        res.status(201).json({
            success: true,
            message:
                "Member added successfully",
            user: users[0]
        });

    } catch (error) {

        console.error(
            "Create user error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to add member",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE USER
// ==========================================
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            full_name,
            email,
            role
        } = req.body;

        if (
            !full_name ||
            !email ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, email and role are required"
            });
        }

        if (
            role !== "attendee" &&
            role !== "organizer"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user role"
            });
        }

        const cleanName =
            full_name.trim();

        const cleanEmail =
            email.trim().toLowerCase();

        // Check duplicate email
        const [existingUsers] =
            await db.query(
                `
                SELECT id
                FROM users
                WHERE email = ?
                AND id != ?
                `,
                [
                    cleanEmail,
                    id
                ]
            );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Email is already being used"
            });
        }

        await db.query(
            `
            UPDATE users
            SET
                full_name = ?,
                email = ?,
                role = ?
            WHERE id = ?
            `,
            [
                cleanName,
                cleanEmail,
                role,
                id
            ]
        );

        const [users] =
            await db.query(
                `
                SELECT
                    id,
                    full_name,
                    email,
                    role,
                    created_at
                FROM users
                WHERE id = ?
                `,
                [id]
            );

        res.status(200).json({
            success: true,
            message:
                "User updated successfully",
            user: users[0]
        });

    } catch (error) {
        console.error(
            "Update user error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update user",
            error: error.message
        });
    }
};


// ==========================================
// DELETE USER
// ==========================================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting own account
        if (
            Number(id) ===
            Number(req.user.id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot delete your own account"
            });
        }

        // Check user exists
        const [users] =
            await db.query(
                `
                SELECT id
                FROM users
                WHERE id = ?
                `,
                [id]
            );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        // Delete user
        await db.query(
            `
            DELETE FROM users
            WHERE id = ?
            `,
            [id]
        );

        res.status(200).json({
            success: true,
            message:
                "User deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete user",
            error: error.message
        });
    }
};
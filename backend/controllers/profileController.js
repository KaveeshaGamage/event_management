const db = require("../db");
const bcrypt = require("bcryptjs");


// ==================================================
// GET PROFILE
// ==================================================

exports.getProfile = async (req, res) => {

    try {

        console.log("GET PROFILE REQUEST");

        console.log("User from token:", req.user);


        const userId = req.user.id;


        if (!userId) {

            return res.status(401).json({
                message: "User ID not found in token"
            });

        }


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
            [userId]
        );


        if (users.length === 0) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        console.log(
            "Profile found:",
            users[0]
        );


        res.status(200).json({

            success: true,

            user: users[0]

        });


    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load profile",

            error:
                error.message

        });

    }

};



// ==================================================
// UPDATE PROFILE
// ==================================================

exports.updateProfile = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            full_name,
            email
        } = req.body;


        if (!full_name || !email) {

            return res.status(400).json({
                message:
                    "Full name and email are required"
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
                    userId
                ]
            );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                message:
                    "Email is already being used"
            });

        }


        await db.query(
            `
            UPDATE users
            SET
                full_name = ?,
                email = ?
            WHERE id = ?
            `,
            [
                cleanName,
                cleanEmail,
                userId
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
                [userId]
            );


        res.status(200).json({

            success: true,

            message:
                "Profile updated successfully",

            user:
                users[0]

        });


    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update profile",

            error:
                error.message

        });

    }

};



// ==================================================
// CHANGE PASSWORD
// ==================================================

exports.changePassword = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            current_password,
            new_password
        } = req.body;


        if (
            !current_password ||
            !new_password
        ) {

            return res.status(400).json({

                message:
                    "Current password and new password are required"

            });

        }


        if (
            new_password.length < 6
        ) {

            return res.status(400).json({

                message:
                    "New password must contain at least 6 characters"

            });

        }


        const [users] =
            await db.query(
                `
                SELECT password
                FROM users
                WHERE id = ?
                `,
                [userId]
            );


        if (users.length === 0) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        const passwordMatch =
            await bcrypt.compare(
                current_password,
                users[0].password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Current password is incorrect"

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                new_password,
                10
            );


        await db.query(
            `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
            [
                hashedPassword,
                userId
            ]
        );


        res.status(200).json({

            success: true,

            message:
                "Password changed successfully"

        });


    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to change password",

            error:
                error.message

        });

    }

};
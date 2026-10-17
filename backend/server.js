const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");

const { Server } = require("socket.io");

// ===============================
// ROUTES
// ===============================

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const committeeRoutes = require("./routes/committeeRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const resourceRoutes = require("./routes/resourceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userManagementRoutes = require("./routes/userManagementRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();

// ===============================
// EXPRESS APP
// ===============================

const app = express();

// ===============================
// HTTP SERVER
// ===============================

const server = http.createServer(app);

// ===============================
// SOCKET.IO SERVER
// ===============================

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        methods: [
            "GET",
            "POST"
        ]
    }
});

// ===============================
// SOCKET.IO EVENT HANDLING
// ===============================

io.on(
    "connection",
    (socket) => {

        console.log(
            "Socket connected:",
            socket.id
        );


        // ==========================================
        // JOIN EVENT CHAT
        // ==========================================

        socket.on(
            "join_event_chat",
            (eventId) => {

                const room =
                    `event_${eventId}`;

                socket.join(room);

                console.log(
                    `${socket.id} joined ${room}`
                );

            }
        );


        // ==========================================
        // BROADCAST EVENT MESSAGE
        // ==========================================

        socket.on(
            "broadcast_event_message",
            ({
                eventId,
                message
            }) => {

                const room =
                    `event_${eventId}`;

                console.log(
                    `Broadcasting message to ${room}`
                );

                socket
                    .to(room)
                    .emit(
                        "new_event_message",
                        message
                    );

            }
        );


        // ==========================================
        // LEAVE EVENT CHAT
        // ==========================================

        socket.on(
            "leave_event_chat",
            (eventId) => {

                const room =
                    `event_${eventId}`;

                socket.leave(room);

                console.log(
                    `${socket.id} left ${room}`
                );

            }
        );


        // ==========================================
        // DISCONNECT
        // ==========================================

        socket.on(
            "disconnect",
            () => {

                console.log(
                    `Socket disconnected: ${socket.id}`
                );

            }
        );

    }
);

// ===============================
// MIDDLEWARE
// ===============================

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174"
        ],

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(
    express.json()
);

// ===============================
// MYSQL CONNECTION
// ===============================

const pool = mysql.createPool({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10

});

// ===============================
// TEST DATABASE CONNECTION
// ===============================

pool.getConnection()

    .then(
        connection => {

            console.log(
                "Database Connected"
            );

            connection.release();

        }
    )

    .catch(
        error => {

            console.error(
                "Database connection failed:",
                error.message
            );

        }
    );

// ===============================
// STATIC UPLOADS
// ===============================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);

// ===============================
// API ROUTES
// ===============================

// Authentication
app.use(
    "/api/auth",
    authRoutes
);


// Events
app.use(
    "/api/events",
    eventRoutes(pool)
);


// Registrations
app.use(
    "/api/registrations",
    registrationRoutes(pool)
);


// Users
app.use(
    "/api/users",
    userRoutes
);


// Committee
app.use(
    "/api/committee",
    committeeRoutes
);


// Tasks
app.use(
    "/api/tasks",
    taskRoutes
);


// Resources
app.use(
    "/api/resources",
    resourceRoutes
);


// Calendar
app.use(
    "/api/calendar",
    calendarRoutes
);


// Reports
app.use(
    "/api/reports",
    reportRoutes
);


// Dashboard
app.use(
    "/api/dashboard",
    dashboardRoutes
);


// Profile
app.use(
    "/api/profile",
    profileRoutes
);


// User Management
app.use(
    "/api/user-management",
    userManagementRoutes
);


// Chat
app.use(
    "/api/chat",
    chatRoutes
);

// ===============================
// TEST ROUTE
// ===============================

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            message:
                "EVENTORA backend is running"

        });

    }
);

// ===============================
// 404 HANDLER
// ===============================

app.use(
    (req, res) => {

        res.status(404).json({

            message:
                `Route not found: ${req.method} ${req.originalUrl}`

        });

    }
);

// ===============================
// ERROR HANDLER
// ===============================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server error:",
            err
        );

        res.status(500).json({

            message:
                "Internal server error"

        });

    }
);

// ===============================
// START SERVER
// ===============================

const PORT =
    process.env.PORT || 5000;

server.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
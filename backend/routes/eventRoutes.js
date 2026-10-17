const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authenticateToken = require("../middleware/authMiddleware");

module.exports = (db) => {

    const router = express.Router();

    // ==========================================
    // UPLOAD DIRECTORIES
    // ==========================================

    const imageDirectory = path.join(
        __dirname,
        "../uploads/images"
    );

    const documentDirectory = path.join(
        __dirname,
        "../uploads/documents"
    );

    if (!fs.existsSync(imageDirectory)) {
        fs.mkdirSync(imageDirectory, {
            recursive: true
        });
    }

    if (!fs.existsSync(documentDirectory)) {
        fs.mkdirSync(documentDirectory, {
            recursive: true
        });
    }


    // ==========================================
    // MULTER STORAGE
    // ==========================================

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {

            if (file.fieldname === "image") {
                cb(null, imageDirectory);
            } else if (file.fieldname === "document") {
                cb(null, documentDirectory);
            } else {
                cb(new Error("Invalid file field"));
            }
        },

        filename: (req, file, cb) => {

            const extension =
                path.extname(file.originalname);

            const prefix =
                file.fieldname === "image"
                    ? "image"
                    : "document";

            cb(
                null,
                `${prefix}-${Date.now()}${extension}`
            );
        }
    });


    const upload = multer({

        storage,

        limits: {
            fileSize: 10 * 1024 * 1024
        },

        fileFilter: (req, file, cb) => {

            if (file.fieldname === "image") {

                const allowedImages = [
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "image/webp"
                ];

                if (
                    allowedImages.includes(
                        file.mimetype
                    )
                ) {
                    cb(null, true);
                } else {
                    cb(
                        new Error(
                            "Only JPG, JPEG, PNG and WEBP images are allowed"
                        )
                    );
                }

            } else if (file.fieldname === "document") {

                const allowedDocuments = [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ];

                if (
                    allowedDocuments.includes(
                        file.mimetype
                    )
                ) {
                    cb(null, true);
                } else {
                    cb(
                        new Error(
                            "Only PDF, DOC and DOCX files are allowed"
                        )
                    );
                }

            } else {

                cb(
                    new Error(
                        "Invalid file field"
                    )
                );
            }
        }
    });


    // ==========================================
    // GET ALL EVENTS
    // ==========================================
    // Used by attendees to browse events
    //
    // GET /api/events
    // ==========================================

    router.get(
        "/",
        async (req, res) => {

            try {

                const [events] = await db.execute(
                    `SELECT
                        id,
                        organizer_id,
                        title,
                        description,
                        event_date,
                        event_time,
                        location,
                        capacity,
                        category,
                        image,
                        document,
                        created_at,
                        updated_at
                     FROM events
                     ORDER BY event_date ASC, event_time ASC`
                );

                res.status(200).json(events);

            } catch (error) {

                console.error(
                    "Get all events error:",
                    error
                );

                res.status(500).json({
                    message:
                        "Failed to fetch events"
                });
            }
        }
    );


    // ==========================================
    // GET MY EVENTS
    // ==========================================
    // Organizer only
    //
    // GET /api/events/my-events
    // ==========================================

    router.get(
        "/my-events",
        authenticateToken,

        async (req, res) => {

            try {

                const organizerId =
                    req.user.id ||
                    req.user.userId;

                if (!organizerId) {
                    return res.status(401).json({
                        message:
                            "Organizer ID not found"
                    });
                }

                const [events] = await db.execute(
                    `SELECT
                        id,
                        organizer_id,
                        title,
                        description,
                        event_date,
                        event_time,
                        location,
                        capacity,
                        category,
                        image,
                        document,
                        created_at,
                        updated_at
                     FROM events
                     WHERE organizer_id = ?
                     ORDER BY event_date ASC, event_time ASC`,
                    [organizerId]
                );

                res.status(200).json(events);

            } catch (error) {

                console.error(
                    "Get my events error:",
                    error
                );

                res.status(500).json({
                    message:
                        "Failed to fetch events"
                });
            }
        }
    );


    // ==========================================
    // GET SINGLE EVENT
    // ==========================================
    // Attendees and organizers can view it
    //
    // GET /api/events/:id
    // ==========================================

    router.get(
        "/:id",
        authenticateToken,

        async (req, res) => {

            try {

                const eventId =
                    req.params.id;

                const [events] = await db.execute(
                    `SELECT
                        id,
                        organizer_id,
                        title,
                        description,
                        event_date,
                        event_time,
                        location,
                        capacity,
                        category,
                        image,
                        document,
                        created_at,
                        updated_at
                     FROM events
                     WHERE id = ?`,
                    [eventId]
                );

                if (events.length === 0) {

                    return res.status(404).json({
                        message:
                            "Event not found"
                    });
                }

                res.status(200).json(
                    events[0]
                );

            } catch (error) {

                console.error(
                    "Get event error:",
                    error
                );

                res.status(500).json({
                    message:
                        "Failed to fetch event"
                });
            }
        }
    );


    // ==========================================
    // CREATE EVENT
    // ==========================================
    // Organizer only
    //
    // POST /api/events
    // ==========================================

    router.post(
        "/",
        authenticateToken,

        upload.fields([
            {
                name: "image",
                maxCount: 1
            },
            {
                name: "document",
                maxCount: 1
            }
        ]),

        async (req, res) => {

            try {

                const {
                    title,
                    description,
                    eventDate,
                    eventTime,
                    location,
                    capacity,
                    category
                } = req.body;


                // Validate required fields

                if (
                    !title ||
                    !eventDate ||
                    !eventTime ||
                    !location ||
                    !capacity
                ) {

                    return res.status(400).json({
                        message:
                            "Please fill all required fields"
                    });
                }


                // Get organizer ID

                const organizerId =
                    req.user.id ||
                    req.user.userId;


                if (!organizerId) {

                    return res.status(401).json({
                        message:
                            "Organizer ID not found in token"
                    });
                }


                // Check role

                if (
                    req.user.role &&
                    req.user.role !== "organizer"
                ) {

                    return res.status(403).json({
                        message:
                            "Only organizers can create events"
                    });
                }


                // Uploaded files

                const image =
                    req.files?.image?.[0]?.filename ||
                    null;

                const document =
                    req.files?.document?.[0]?.filename ||
                    null;


                // Insert event

                const [result] =
                    await db.execute(
                        `INSERT INTO events
                        (
                            organizer_id,
                            title,
                            description,
                            event_date,
                            event_time,
                            location,
                            capacity,
                            category,
                            image,
                            document
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            organizerId,
                            title,
                            description || null,
                            eventDate,
                            eventTime,
                            location,
                            capacity,
                            category || null,
                            image,
                            document
                        ]
                    );


                res.status(201).json({
                    message:
                        "Event created successfully",

                    eventId:
                        result.insertId
                });

            } catch (error) {

                console.error(
                    "Create event error:",
                    error
                );

                res.status(500).json({
                    message:
                        "Failed to create event"
                });
            }
        }
    );


    // ==========================================
    // UPDATE EVENT
    // ==========================================
    // Organizer can update only their own event
    //
    // PUT /api/events/:id
    // ==========================================

    router.put(
        "/:id",
        authenticateToken,

        upload.fields([
            {
                name: "image",
                maxCount: 1
            },
            {
                name: "document",
                maxCount: 1
            }
        ]),

        async (req, res) => {

            try {

                const eventId =
                    req.params.id;

                const organizerId =
                    req.user.id ||
                    req.user.userId;


                if (!organizerId) {

                    return res.status(401).json({
                        message:
                            "Organizer ID not found"
                    });
                }


                if (
                    req.user.role &&
                    req.user.role !== "organizer"
                ) {

                    return res.status(403).json({
                        message:
                            "Only organizers can update events"
                    });
                }


                // Get existing event

                const [existingEvents] =
                    await db.execute(
                        `SELECT
                            image,
                            document
                         FROM events
                         WHERE id = ?
                         AND organizer_id = ?`,
                        [
                            eventId,
                            organizerId
                        ]
                    );


                if (
                    existingEvents.length === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Event not found"
                    });
                }


                const existingEvent =
                    existingEvents[0];


                const {
                    title,
                    description,
                    eventDate,
                    eventTime,
                    location,
                    capacity,
                    category
                } = req.body;


                // New files

                const newImage =
                    req.files?.image?.[0]?.filename;

                const newDocument =
                    req.files?.document?.[0]?.filename;


                const image =
                    newImage ||
                    existingEvent.image ||
                    null;

                const document =
                    newDocument ||
                    existingEvent.document ||
                    null;


                // Update database

                const [result] =
                    await db.execute(
                        `UPDATE events
                         SET
                            title = ?,
                            description = ?,
                            event_date = ?,
                            event_time = ?,
                            location = ?,
                            capacity = ?,
                            category = ?,
                            image = ?,
                            document = ?
                         WHERE id = ?
                         AND organizer_id = ?`,
                        [
                            title,
                            description || null,
                            eventDate,
                            eventTime,
                            location,
                            capacity,
                            category || null,
                            image,
                            document,
                            eventId,
                            organizerId
                        ]
                    );


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Event not found"
                    });
                }


                // Delete old image

                if (
                    newImage &&
                    existingEvent.image
                ) {

                    const oldImagePath =
                        path.join(
                            imageDirectory,
                            existingEvent.image
                        );

                    if (
                        fs.existsSync(
                            oldImagePath
                        )
                    ) {

                        fs.unlinkSync(
                            oldImagePath
                        );
                    }
                }


                // Delete old document

                if (
                    newDocument &&
                    existingEvent.document
                ) {

                    const oldDocumentPath =
                        path.join(
                            documentDirectory,
                            existingEvent.document
                        );

                    if (
                        fs.existsSync(
                            oldDocumentPath
                        )
                    ) {

                        fs.unlinkSync(
                            oldDocumentPath
                        );
                    }
                }


                res.status(200).json({
                    message:
                        "Event updated successfully"
                });

            } catch (error) {

                console.error(
                    "Update event error:",
                    error
                );

                res.status(500).json({
                    message:
                        "Failed to update event"
                });
            }
        }
    );


    // ==========================================
    // DELETE EVENT
    // ==========================================
    // Organizer can delete only their own event
    //
    // DELETE /api/events/:id
    // ==========================================

    router.delete(
        "/:id",
        authenticateToken,

        async (req, res) => {

            try {

                const eventId =
                    req.params.id;

                const organizerId =
                    req.user.id ||
                    req.user.userId;


                if (!organizerId) {

                    return res.status(401).json({
                        message:
                            "Organizer ID not found"
                    });
                }


                if (
                    req.user.role &&
                    req.user.role !== "organizer"
                ) {

                    return res.status(403).json({
                        message:
                            "Only organizers can delete events"
                    });
                }


                // Get event files first

                const [events] =
                    await db.execute(
                        `SELECT
                            image,
                            document
                         FROM events
                         WHERE id = ?
                         AND organizer_id = ?`,
                        [
                            eventId,
                            organizerId
                        ]
                    );


                if (
                    events.length === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Event not found"
                    });
                }


                const event =
                    events[0];


                // Delete event

                const [result] =
                    await db.execute(
                        `DELETE FROM events
                         WHERE id = ?
                         AND organizer_id = ?`,
                        [
                            eventId,
                            organizerId
                        ]
                    );


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Event not found"
                    });
                }


                // Delete image file

                if (event.image) {

                    const imagePath =
                        path.join(
                            imageDirectory,
                            event.image
                        );

                    if (
                        fs.existsSync(
                            imagePath
                        )
                    ) {

                        fs.unlinkSync(
                            imagePath
                        );
                    }
                }


                // Delete document file

                if (event.document) {

                    const documentPath =
                        path.join(
                            documentDirectory,
                            event.document
                        );

                    if (
                        fs.existsSync(
                            documentPath
                        )
                    ) {

                        fs.unlinkSync(
                            documentPath
                        );
                    }
                }


                res.status(200).json({
                    message:
                        "Event deleted successfully"
                });

            } catch (error) {

                console.error(
                    "Delete event error:",
                    error
                );

                res.status(500).json({
                    message:
                        "Failed to delete event"
                });
            }
        }
    );


    // ==========================================
    // MULTER / UPLOAD ERROR HANDLER
    // ==========================================

    router.use(
        (error, req, res, next) => {

            if (
                error instanceof multer.MulterError
            ) {

                if (
                    error.code ===
                    "LIMIT_FILE_SIZE"
                ) {

                    return res.status(400).json({
                        message:
                            "File size is too large"
                    });
                }

                return res.status(400).json({
                    message:
                        error.message
                });
            }


            if (error) {

                console.error(
                    "Upload error:",
                    error
                );

                return res.status(400).json({
                    message:
                        error.message ||
                        "File upload error"
                });
            }

            next();
        }
    );


    return router;
};
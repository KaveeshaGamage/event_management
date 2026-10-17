const db = require("../db");

// Create Event
const createEvent = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const {
      title,
      description,
      eventDate,
      eventTime,
      location,
      capacity,
      category,
    } = req.body;

    // Required fields
    if (
      !title ||
      !eventDate ||
      !eventTime ||
      !location ||
      !capacity
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    // Get uploaded files
    let imageUrl = null;
    let documentUrl = null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        imageUrl = `/uploads/images/${req.files.image[0].filename}`;
      }

      if (req.files.document && req.files.document[0]) {
        documentUrl = `/uploads/documents/${req.files.document[0].filename}`;
      }
    }

    // Insert event
    const [result] = await db.execute(
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
        image_url,
        document_url
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
        imageUrl,
        documentUrl,
      ]
    );

    res.status(201).json({
      message: "Event created successfully.",
      eventId: result.insertId,
      imageUrl,
      documentUrl,
    });

  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      message: "Failed to create event.",
    });
  }
};


// Get Organizer's Events
const getMyEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const [events] = await db.execute(
      `SELECT *
       FROM events
       WHERE organizer_id = ?
       ORDER BY event_date ASC, event_time ASC`,
      [organizerId]
    );

    res.json(events);

  } catch (error) {
    console.error("Get my events error:", error);

    res.status(500).json({
      message: "Failed to fetch events.",
    });
  }
};


// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const eventId = req.params.id;

    const [result] = await db.execute(
      `DELETE FROM events
       WHERE id = ?
       AND organizer_id = ?`,
      [eventId, organizerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Event not found or you are not authorized.",
      });
    }

    res.json({
      message: "Event deleted successfully.",
    });

  } catch (error) {
    console.error("Delete event error:", error);

    res.status(500).json({
      message: "Failed to delete event.",
    });
  }
};


module.exports = {
  createEvent,
  getMyEvents,
  deleteEvent,
};
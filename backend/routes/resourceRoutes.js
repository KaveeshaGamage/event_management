const express = require("express");

const router = express.Router();

const resourceController =
    require("../controllers/resourceController");

const authenticateToken =
    require("../middleware/authenticateToken");


// ===============================
// GET RESOURCES
// ===============================

router.get(
    "/",
    authenticateToken,
    resourceController.getResources
);


// ===============================
// CREATE RESOURCE
// ===============================

router.post(
    "/",
    authenticateToken,
    resourceController.createResource
);


// ===============================
// CHECK AVAILABILITY
// ===============================

router.get(
    "/availability",
    authenticateToken,
    resourceController.checkAvailability
);


// ===============================
// BOOK RESOURCE
// ===============================

router.post(
    "/book",
    authenticateToken,
    resourceController.bookResource
);


// ===============================
// GET BOOKINGS FOR EVENT
// ===============================

router.get(
    "/bookings/event/:eventId",
    authenticateToken,
    resourceController.getResourceBookings
);


// ===============================
// DELETE BOOKING
// ===============================

router.delete(
    "/bookings/:id",
    authenticateToken,
    resourceController.deleteBooking
);


module.exports = router;
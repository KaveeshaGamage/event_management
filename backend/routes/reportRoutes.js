const express = require("express");

const router = express.Router();

const reportController =
    require("../controllers/reportController");

const authenticateToken =
    require("../middleware/authenticateToken");


// ======================================================
// GET ALL EVENTS OF LOGGED-IN ORGANIZER
// ======================================================

router.get(
    "/events",
    authenticateToken,
    reportController.getOrganizerEvents
);


// ======================================================
// GET REPORT FOR ONE EVENT
// ======================================================

router.get(
    "/event/:eventId",
    authenticateToken,
    reportController.getEventReport
);


module.exports = router;
const express = require("express");

const router = express.Router();

const calendarController =
    require("../controllers/calendarController");

const authenticateToken =
    require("../middleware/authenticateToken");


router.get(
    "/",
    authenticateToken,
    calendarController.getCalendar
);


module.exports = router;
const express = require("express");

const router =
    express.Router();


const chatController =
    require("../controllers/chatController");


const authenticateToken =
    require("../middleware/authenticateToken");


// ======================================================
// GET CHAT MESSAGES
// ======================================================

router.get(
    "/events/:eventId/messages",
    authenticateToken,
    chatController.getMessages
);


// ======================================================
// SEND MESSAGE
// ======================================================

router.post(
    "/events/:eventId/messages",
    authenticateToken,
    chatController.sendMessage
);


module.exports = router;
const express = require("express");

const router = express.Router();

const taskController =
    require("../controllers/taskController");

const authenticateToken =
    require("../middleware/authenticateToken");


// Get tasks for event

router.get(
    "/event/:eventId",
    authenticateToken,
    taskController.getEventTasks
);


// Create task

router.post(
    "/event/:eventId",
    authenticateToken,
    taskController.createTask
);


// Update task

router.put(
    "/:id",
    authenticateToken,
    taskController.updateTask
);


// Delete task

router.delete(
    "/:id",
    authenticateToken,
    taskController.deleteTask
);


module.exports = router;
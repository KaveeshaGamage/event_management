const express = require("express");

const router = express.Router();

const userManagementController =
    require("../controllers/userManagementController");

const authenticateToken =
    require("../middleware/authenticateToken");

const requireOrganizer =
    require("../middleware/requireOrganizer");


// GET ALL USERS
router.get(
    "/",
    authenticateToken,
    requireOrganizer,
    userManagementController.getAllUsers
);


// GET SINGLE USER
router.get(
    "/:id",
    authenticateToken,
    requireOrganizer,
    userManagementController.getUserById
);


// UPDATE USER
router.put(
    "/:id",
    authenticateToken,
    requireOrganizer,
    userManagementController.updateUser
);


// DELETE USER
router.delete(
    "/:id",
    authenticateToken,
    requireOrganizer,
    userManagementController.deleteUser
);


// CREATE NEW USER / MEMBER
router.post(
    "/",
    authenticateToken,
    requireOrganizer,
    userManagementController.createUser
);


module.exports = router;
const express = require("express");

const router = express.Router();

const profileController =
    require("../controllers/profileController");

const authenticateToken =
    require("../middleware/authenticateToken");


// GET PROFILE
router.get(
    "/",
    authenticateToken,
    profileController.getProfile
);


// UPDATE PROFILE
router.put(
    "/",
    authenticateToken,
    profileController.updateProfile
);


// CHANGE PASSWORD
router.put(
    "/password",
    authenticateToken,
    profileController.changePassword
);


module.exports = router;
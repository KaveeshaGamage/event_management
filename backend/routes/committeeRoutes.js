const express = require("express");

const router = express.Router();

const {
    getPositions,
    getEventCommittee,
    addCommitteeMember,
    updateCommitteeMember,
    removeCommitteeMember
} = require("../controllers/committeeController");

router.get("/positions", getPositions);

router.get(
    "/events/:eventId/members",
    getEventCommittee
);

router.post(
    "/events/:eventId/members",
    addCommitteeMember
);

router.put(
    "/members/:id",
    updateCommitteeMember
);

router.delete(
    "/members/:id",
    removeCommitteeMember
);

module.exports = router;
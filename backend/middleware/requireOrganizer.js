const requireOrganizer = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (req.user.role !== "organizer") {
        return res.status(403).json({
            message: "Access denied. Organizer privileges required."
        });
    }

    next();
};

module.exports = requireOrganizer;
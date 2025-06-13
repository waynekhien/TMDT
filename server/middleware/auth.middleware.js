const { verify } = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "importantsecure";

const validateToken = (req, res, next) => {
    // Try to get token from accessToken header first (for compatibility)
    let accessToken = req.header("accessToken");

    // If not found, try Authorization header
    if (!accessToken) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }
    }

    if (!accessToken) {
        return res.status(401).json({ error: "User not logged in" });
    }

    try {
        const validToken = verify(accessToken, JWT_SECRET);
        req.user = validToken;
        return next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = { validateToken };

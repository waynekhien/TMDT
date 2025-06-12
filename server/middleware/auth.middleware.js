const { verify } = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "importantsecure";

const validateToken = (req, res, next) => {
    const accessToken = req.header("accessToken");
    
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

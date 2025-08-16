const { verifyJWT } = require('../utils/jwtUtils');

const authenticateJWT = (req, res, next) => {
    // Extract token from headers
    const token = req.headers['authorization']?.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    // Verify the token
    const decoded = verifyJWT(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach the decoded token (guest session data) to the request object
    req.guest = decoded;
    next();
};

module.exports = authenticateJWT;

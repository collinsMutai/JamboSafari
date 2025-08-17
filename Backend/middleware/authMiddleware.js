const { verifyJWT } = require('../utils/jwtUtils');

const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    verifyJWT(token, (err, decoded) => {
        if (err) {
            if (err.type === 'expired') {
                return res.status(401).json({ error: 'Token expired' });
            } else if (err.type === 'invalid') {
                return res.status(401).json({ error: 'Invalid token' });
            } else {
                return res.status(401).json({ error: 'Token verification failed' });
            }
        }

        req.guest = decoded;
        next();
    });
};

module.exports = authenticateJWT;

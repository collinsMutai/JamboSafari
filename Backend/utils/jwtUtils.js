const jwt = require('jsonwebtoken');

// Ensure JWT secret is defined
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const secret = process.env.JWT_SECRET;

// Create JWT
const createJWT = (payload) => {
    const options = { expiresIn: '1h' }; // Token expires in 1 hour
    return jwt.sign(payload, secret, options);
};

// Verify JWT with error differentiation
const verifyJWT = (token, callback) => {
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return callback({ type: 'expired', message: 'Token has expired' }, null);
            } else if (err.name === 'JsonWebTokenError') {
                return callback({ type: 'invalid', message: 'Invalid token' }, null);
            } else {
                return callback({ type: 'unknown', message: 'Token verification failed' }, null);
            }
        }
        return callback(null, decoded);
    });
};

module.exports = { createJWT, verifyJWT };

const jwt = require('jsonwebtoken');

// Create JWT
const createJWT = (payload) => {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Ensure to set this in your .env
    const options = { expiresIn: '1h' }; // Token expires in 1 hour
    return jwt.sign(payload, secret, options);
};

// Verify JWT
const verifyJWT = (token) => {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

module.exports = { createJWT, verifyJWT };

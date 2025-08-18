const rateLimit = require('express-rate-limit');

// Create a rate limiting rule for payment requests
const paymentRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // Limit each IP to 3 payment requests per windowMs
    message: 'Too many payment requests from this IP, please try again after 10 minutes.',
    statusCode: 429, // HTTP status code for too many requests
    headers: true, // Send rate limit info in headers
});

module.exports = { paymentRateLimiter };

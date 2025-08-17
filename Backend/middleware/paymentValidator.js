const { body } = require('express-validator');

// Middleware to validate and sanitize payment request data
const validatePaymentData = [
    body('amount')
        .isNumeric().withMessage('Amount must be a numeric value')
        .custom(value => value > 0).withMessage('Amount must be greater than zero')
        .toFloat(), // Sanitizing to ensure it's a number

    body('description')
        .isLength({ min: 5 }).withMessage('Description must be at least 5 characters long')
        .trim() // Remove any leading/trailing whitespaces
        .escape(), // Escape special characters to prevent XSS

    body('reference')
        .notEmpty().withMessage('Transaction reference is required')
        .trim() // Remove any leading/trailing whitespaces
        .escape(), // Escape special characters to prevent XSS

    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail() // Normalize the email to prevent weird variations
        .trim() // Remove any leading/trailing whitespaces
        .escape(), // Escape special characters to prevent XSS

    body('phone')
        .isMobilePhone('en-US', { strictMode: false }).withMessage('Invalid US phone number format')
        .isMobilePhone('en-KE', { strictMode: false }).withMessage('Invalid Kenyan phone number format')
        .trim() // Remove any leading/trailing whitespaces
        .escape(), // Escape special characters to prevent XSS

    body('redirectUrl')
        .isURL().withMessage('Invalid redirect URL')
        .custom(value => {
            // Fetch allowed domains from env variable and convert to an array
            const allowedDomains = process.env.FRONTEND_ORIGINS.split(',');

            const url = new URL(value);
            if (!allowedDomains.includes(url.origin)) {
                throw new Error('Redirect URL is not allowed');
            }
            return true;
        })
        .trim() // Remove any leading/trailing whitespaces
        .escape(), // Escape special characters to prevent XSS

    body('paymentMethod')
        .isIn(['Pesapal', 'MPesa']).withMessage('Payment method must be either Pesapal or MPesa')
        .trim() // Remove any leading/trailing whitespaces
        .escape(), // Escape special characters to prevent XSS
];

module.exports = {
    validatePaymentData,
};

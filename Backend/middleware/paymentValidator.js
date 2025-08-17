const { body, validationResult } = require('express-validator');

// Payment request validation (Improved)
const validatePaymentData = [
    // Amount: Ensure it's numeric, greater than zero, and sanitize
    body('amount')
        .isFloat({ min: 0.01 }).withMessage('Amount must be a number greater than zero')
        .toFloat(), // Convert to float
    
    // Description: Validate length, sanitize, and prevent XSS
    body('description')
        .isLength({ min: 5 }).withMessage('Description must be at least 5 characters long')
        .trim() // Remove leading/trailing whitespaces
        .escape(), // Escape special characters to prevent XSS
    
    // Reference: Ensure it's non-empty, sanitize, and escape
    body('reference')
        .notEmpty().withMessage('Transaction reference is required')
        .trim()
        .escape(), 
    
    // Email: Validate email format, sanitize, and ensure proper domain
    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail() // Normalize the email to prevent weird variations
        .trim() // Remove leading/trailing whitespaces
        .escape(), 
    
    // Phone: Ensure it's a valid phone number format for multiple countries
    body('phone')
        .isMobilePhone('any', { strictMode: false }).withMessage('Invalid phone number format')
        .trim()
        .escape(), 
    
    // Redirect URL: Ensure it's a valid URL and belongs to allowed domains
    body('redirectUrl')
        .isURL().withMessage('Invalid redirect URL')
        .custom(value => {
            const allowedDomains = process.env.FRONTEND_ORIGINS.split(',');
            const url = new URL(value);
            if (!allowedDomains.includes(url.origin)) {
                throw new Error('Redirect URL is not allowed');
            }
            return true;
        })
        .trim() // Remove leading/trailing whitespaces
        .escape(),
    
    // Payment Method: Ensure it's either Pesapal or MPesa
    body('paymentMethod')
        .isIn(['Pesapal', 'MPesa']).withMessage('Payment method must be either Pesapal or MPesa')
        .trim()
        .escape(),
];



module.exports = {
    validatePaymentData,
};

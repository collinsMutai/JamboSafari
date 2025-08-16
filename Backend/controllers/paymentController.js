const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

// Pesapal API credentials (from .env)
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_URL = process.env.PESAPAL_URL;

// Middleware to validate request data
const validatePaymentData = [
    body('amount')
        .isNumeric().withMessage('Amount must be a numeric value')
        .custom(value => value > 0).withMessage('Amount must be greater than zero'),
    body('description')
        .isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),
    body('reference')
        .notEmpty().withMessage('Transaction reference is required'),
    body('email')
        .isEmail().withMessage('Invalid email format'),
    body('phone')
        .isMobilePhone('en-US', { strictMode: false }).withMessage('Invalid US phone number format')
        .isMobilePhone('en-KE', { strictMode: false }).withMessage('Invalid Kenyan phone number format'),
    body('redirectUrl')
        .isURL().withMessage('Invalid redirect URL')
        .custom(value => {
            const allowedDomains = ['https://www.jambosafariafrica.com', 'http://localhost:4200'];
            const url = new URL(value);
            if (!allowedDomains.includes(url.origin)) {
                throw new Error('Redirect URL is not allowed');
            }
            return true;
        })
];

// Payment request function to initiate the payment
exports.requestPayment = async (req, res) => {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, reference, email, phone, redirectUrl } = req.body;

    // Create a new transaction record
    const newTransaction = new Transaction({
        reference,
        amount,
        description,
        email,
        phone,
        status: 'PENDING', // Set the initial status to 'PENDING'
    });

    try {
        // Save the transaction to MongoDB
        await newTransaction.save();

        // Construct the payment payload
        const paymentRequest = {
            amount,
            description,
            reference,
            email,
            phone,
            redirectUrl,
        };

        // Send payment request to Pesapal API
        const response = await axios.post(PESAPAL_URL, paymentRequest, {
            auth: {
                username: PESAPAL_CONSUMER_KEY, // Fetching from .env
                password: PESAPAL_CONSUMER_SECRET, // Fetching from .env
            },
        });

        // Check if the response contains the expected URL
        if (!response.data.paymentUrl) {
            throw new Error('Payment URL not returned from Pesapal');
        }

        const paymentUrl = response.data.paymentUrl;

        // Send the payment URL back to the frontend for redirect
        res.json({ paymentUrl });

    } catch (error) {
        console.error('Error initiating payment:', error);

        // If an error occurred while processing the payment, mark the transaction as failed
        await newTransaction.updateOne({ status: 'FAILED' });

        // Handle different types of errors more gracefully
        if (error.response) {
            res.status(error.response.status).json({
                error: `Pesapal API error: ${error.response.data.message || 'Unknown error'}`,
            });
        } else if (error.request) {
            res.status(500).json({ error: 'No response from Pesapal API' });
        } else {
            res.status(500).json({ error: `Internal server error: ${error.message}` });
        }
    }
};

// Payment callback function to handle the callback from Pesapal
exports.paymentCallback = async (req, res) => {
    const paymentData = req.body; // Pesapal sends data to this endpoint
    const { reference, status } = paymentData;

    // Validate incoming callback data
    if (!reference || !status) {
        return res.status(400).json({ error: 'Invalid callback data' });
    }

    try {
        // Find the transaction by reference
        const transaction = await Transaction.findOne({ reference });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Update the transaction status based on the callback
        transaction.status = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
        await transaction.save();

        // Respond with the appropriate message based on the payment status
        if (status === 'SUCCESS') {
            console.log(`Payment successful for reference: ${reference}`);
            res.json({ status: 'success', message: 'Payment successful' });
        } else {
            console.log(`Payment failed for reference: ${reference}`);
            res.json({ status: 'failed', message: 'Payment failed' });
        }

    } catch (error) {
        console.error('Error processing payment callback:', error);
        res.status(500).json({ error: 'Error processing payment callback' });
    }
};

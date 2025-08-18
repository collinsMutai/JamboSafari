const express = require('express');
const paymentController = require('../controllers/paymentController');
const { validatePaymentData } = require('../middleware/paymentValidator'); // Import the validation middleware
const csrf = require('csurf');
const Transaction = require('../models/Transaction'); // Import Transaction model if needed
const { createJWT, verifyJWT } = require('../utils/jwtUtils');
const { paymentRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

// 🔹 Route to start a guest session and issue a JWT
router.post('/auth/guest', (req, res) => {
    try {
        const guestId = uuidv4(); // Generate unique guest session ID

        // 🔐 Access Token (short-lived, e.g. 1h)
        const accessToken = createJWT({
            guestId,
            sessionStart: Date.now(),
        });

        // 🔐 Refresh Token (longer-lived, e.g. 7d)
        const refreshToken = createJWT({
            guestId,
            type: 'refresh',
        }, '7d'); // '7d' = 7 days

        // 🧁 Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        });

        // 🎁 Send access token to frontend
        res.status(200).json({ token: accessToken });
    } catch (error) {
        console.error('Error generating guest token:', error);
        res.status(500).json({ error: 'Failed to start guest session' });
    }
});

// 🔹 Route to refresh a guest token
router.post('/auth/refresh', paymentRateLimiter, (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ error: 'Refresh token missing' });
    }

    verifyJWT(token, (err, decoded) => {
        if (err || decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        // 🔁 Create a new short-lived access token
        const newAccessToken = createJWT({
            guestId: decoded.guestId,
            sessionStart: Date.now(),
        });

        res.status(200).json({ token: newAccessToken });
    });
});


// Route to handle payment request with validation middleware
router.post('/payment/request', csrfProtection, validatePaymentData, paymentController.requestPayment);

// Route to handle payment callback from Pesapal
router.post('/payment/callback', paymentController.paymentCallback);

// Route to handle M-Pesa callback (if applicable)
router.post('/payment/mpesa-callback', paymentController.mpesaCallback);

// Route to fetch transaction details (optional)
router.get('/payment/transaction/:reference', async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ reference: req.params.reference });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Error fetching transaction' });
    }
});

// Route to fetch CSRF token (useful for frontend)
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;

const express = require('express');
const paymentController = require('../controllers/paymentController');
const { validatePaymentData } = require('../middlewares/paymentValidator'); // Import the validation middleware
const csrf = require('csurf');
const Transaction = require('../models/Transaction'); // Import Transaction model if needed

const router = express.Router();

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

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

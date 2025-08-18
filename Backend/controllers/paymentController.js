const axios = require('axios');
const Transaction = require('../models/Transaction');
const qs = require('querystring');
const { verifyJWT } = require('../utils/jwtUtils');

// 🔐 Environment variables
const {
    PESAPAL_CONSUMER_KEY,
    PESAPAL_CONSUMER_SECRET,
    PESAPAL_URL,
    M_PESA_LIPA_NA_MPESA_SHORTCODE,
    M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET,
    M_PESA_LIPA_NA_MPESA_LIPA_URL,
    M_PESA_OAUTH_URL,
} = process.env;

// 📡 Get M-Pesa OAuth token
const getMpesOauthToken = async () => {
    try {
        const response = await axios.get(M_PESA_OAUTH_URL, {
            auth: {
                username: M_PESA_LIPA_NA_MPESA_SHORTCODE,
                password: M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET,
            },
        });
        return response.data.access_token;
    } catch (error) {
        throw new Error('Failed to get M-Pesa OAuth token');
    }
};

// 💳 Payment request handler
exports.requestPayment = async (req, res) => {
    try {
        // 🔐 Validate CSRF token
        if (req.csrfToken() !== req.headers['csrf-token']) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }

        // 🔐 Validate JWT
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Missing Authorization token' });
        }

        const decoded = await new Promise((resolve) => {
            verifyJWT(token, (err, decoded) => {
                if (err) {
                    const msg =
                        err.type === 'expired'
                            ? 'Session expired'
                            : err.type === 'invalid'
                            ? 'Invalid token'
                            : 'Token verification failed';
                    console.error('JWT Error:', msg);
                    return resolve(null);
                }
                return resolve(decoded);
            });
        });

        if (!decoded || !decoded.guestId) {
            return res.status(401).json({ error: 'Invalid or expired session token' });
        }

        const guestId = decoded.guestId;

        // Extract payment data
        const { amount, description, reference, email, phone, redirectUrl, paymentMethod } = req.body;

        // Check if transaction already exists
        const existingTransaction = await Transaction.findOne({ reference });

        if (existingTransaction && existingTransaction.status === 'PENDING') {
            return res.status(400).json({ error: 'Payment with this reference is already in progress' });
        }

        // Save new transaction with PENDING status
        const newTransaction = new Transaction({
            reference,
            amount,
            description,
            email,
            phone,
            guestId,
            status: 'PENDING',
            paymentMethod,
        });

        await newTransaction.save();

        // 🔁 Handle Pesapal
        if (paymentMethod === 'Pesapal') {
            const paymentRequest = {
                amount,
                description,
                reference,
                email,
                phone,
                redirectUrl,
            };

            const response = await axios.post(PESAPAL_URL, paymentRequest, {
                auth: {
                    username: PESAPAL_CONSUMER_KEY,
                    password: PESAPAL_CONSUMER_SECRET,
                },
            });

            if (!response.data.paymentUrl) {
                throw new Error('Payment URL not returned from Pesapal');
            }

            return res.json({ paymentUrl: response.data.paymentUrl });
        }

        // 🔁 Handle M-Pesa
        if (paymentMethod === 'MPesa') {
            const token = await getMpesOauthToken();

            const lipaNaMpesaPayload = {
                BusinessShortcode: M_PESA_LIPA_NA_MPESA_SHORTCODE,
                LipaNaMpesaOnlineShortcode: M_PESA_LIPA_NA_MPESA_SHORTCODE,
                LipaNaMpesaOnlineShortcodeSecret: M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET,
                PhoneNumber: phone,
                Amount: amount,
                AccountReference: reference,
                TransactionDesc: description,
            };

            const response = await axios.post(M_PESA_LIPA_NA_MPESA_LIPA_URL, qs.stringify(lipaNaMpesaPayload), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.ResponseCode !== '0') {
                throw new Error('M-Pesa payment initiation failed');
            }

            return res.json({ paymentUrl: response.data.LipaNaMpesaOnlinePaymentUrl });
        }

        throw new Error('Unsupported payment method');
    } catch (error) {
        console.error('Error initiating payment:', error);

        // Mark transaction as failed if payment initiation fails
        if (req.body?.reference) {
            await Transaction.updateOne({ reference: req.body.reference }, { status: 'FAILED' });
        }

        res.status(500).json({ error: `Error initiating payment: ${error.message}` });
    }
};


// ✅ Pesapal callback handler
exports.paymentCallback = async (req, res) => {
    const { reference, status } = req.body;

    if (!reference || !status) {
        return res.status(400).json({ error: 'Invalid callback data' });
    }

    try {
        const transaction = await Transaction.findOne({ reference });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transaction.status = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
        await transaction.save();

        console.log(`Pesapal callback: ${reference} -> ${transaction.status}`);
        return res.json({
            status: transaction.status.toLowerCase(),
            message: `Payment ${transaction.status.toLowerCase()}`,
        });
    } catch (error) {
        console.error('Error processing Pesapal callback:', error);
        return res.status(500).json({ error: 'Error processing callback' });
    }
};

// ✅ M-Pesa callback handler
exports.mpesaCallback = async (req, res) => {
    const { reference, status } = req.body;

    if (!reference || !status) {
        return res.status(400).json({ error: 'Invalid callback data' });
    }

    try {
        const transaction = await Transaction.findOne({ reference });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transaction.status = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
        await transaction.save();

        console.log(`M-Pesa callback: ${reference} -> ${transaction.status}`);
        return res.json({
            status: transaction.status.toLowerCase(),
            message: `Payment ${transaction.status.toLowerCase()}`,
        });
    } catch (error) {
        console.error('Error processing M-Pesa callback:', error);
        return res.status(500).json({ error: 'Error processing callback' });
    }
};

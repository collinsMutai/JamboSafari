const axios = require('axios');
const Transaction = require('../models/Transaction');
const qs = require('querystring');

// Pesapal API credentials (from .env)
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_URL = process.env.PESAPAL_URL;

// M-Pesa API credentials (from .env)
const M_PESA_LIPA_NA_MPESA_SHORTCODE = process.env.M_PESA_LIPA_NA_MPESA_SHORTCODE;
const M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET = process.env.M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET;
const M_PESA_LIPA_NA_MPESA_LIPA_URL = process.env.M_PESA_LIPA_NA_MPESA_LIPA_URL;
const M_PESA_OAUTH_URL = process.env.M_PESA_OAUTH_URL; // Token URL for M-Pesa

// Function to request an OAuth token for M-Pesa
const getMpesOauthToken = async () => {
    try {
        const response = await axios.get(M_PESA_OAUTH_URL, {
            auth: {
                username: M_PESA_LIPA_NA_MPESA_SHORTCODE,
                password: M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET
            }
        });
        return response.data.access_token;
    } catch (error) {
        throw new Error('Failed to get M-Pesa OAuth token');
    }
};

// Payment request function to initiate the payment
exports.requestPayment = async (req, res) => {
    // CSRF Token validation
    if (req.csrfToken() !== req.headers['csrf-token']) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    const { amount, description, reference, email, phone, redirectUrl, paymentMethod } = req.body;

    // Create a new transaction record
    const newTransaction = new Transaction({
        reference,
        amount,
        description,
        email,
        phone,
        status: 'PENDING', // Set the initial status to 'PENDING'
        paymentMethod,
    });

    try {
        // Save the transaction to MongoDB
        await newTransaction.save();

        if (paymentMethod === 'Pesapal') {
            // Construct the payment payload for Pesapal
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
                    username: PESAPAL_CONSUMER_KEY,
                    password: PESAPAL_CONSUMER_SECRET,
                },
            });

            // Check if the response contains the expected URL
            if (!response.data.paymentUrl) {
                throw new Error('Payment URL not returned from Pesapal');
            }

            const paymentUrl = response.data.paymentUrl;

            // Send the payment URL back to the frontend for redirect
            return res.json({ paymentUrl });
        }

        if (paymentMethod === 'MPesa') {
            // Prepare payment request for M-Pesa Lipa Na M-Pesa
            const token = await getMpesOauthToken();

            const lipaNaMpesaPayload = {
                BusinessShortcode: M_PESA_LIPA_NA_MPESA_SHORTCODE,
                LipaNaMpesaOnlineShortcode: M_PESA_LIPA_NA_MPESA_SHORTCODE,
                LipaNaMpesaOnlineShortcodeSecret: M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET,
                PhoneNumber: phone, // Phone number for M-Pesa
                Amount: amount,
                AccountReference: reference,
                TransactionDesc: description
            };

            const response = await axios.post(M_PESA_LIPA_NA_MPESA_LIPA_URL, qs.stringify(lipaNaMpesaPayload), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.ResponseCode !== '0') {
                throw new Error('M-Pesa payment initiation failed');
            }

            const paymentUrl = response.data.LipaNaMpesaOnlinePaymentUrl;

            // Send the payment URL to the frontend
            return res.json({ paymentUrl });
        }

        throw new Error('Unsupported payment method');

    } catch (error) {
        console.error('Error initiating payment:', error);

        // If an error occurred while processing the payment, mark the transaction as failed
        await newTransaction.updateOne({ status: 'FAILED' });

        res.status(500).json({ error: `Error initiating payment: ${error.message}` });
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

// Payment callback function to handle M-Pesa callback
exports.mpesaCallback = async (req, res) => {
    const paymentData = req.body; // Data returned by M-Pesa

    const { reference, status } = paymentData; // Check response structure of M-Pesa callback

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

        // Update the transaction status based on M-Pesa callback
        transaction.status = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
        await transaction.save();

        // Respond with the appropriate message based on the payment status
        if (status === 'SUCCESS') {
            console.log(`M-Pesa payment successful for reference: ${reference}`);
            res.json({ status: 'success', message: 'Payment successful' });
        } else {
            console.log(`M-Pesa payment failed for reference: ${reference}`);
            res.json({ status: 'failed', message: 'Payment failed' });
        }

    } catch (error) {
        console.error('Error processing M-Pesa payment callback:', error);
        res.status(500).json({ error: 'Error processing payment callback' });
    }
};

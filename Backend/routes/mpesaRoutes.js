const express = require('express');
const mpesaController = require('../controllers/mpesaController');

const router = express.Router();

// Route to initiate M-Pesa payment request
router.post('/payment/request', mpesaController.requestPayment);

// Route to handle M-Pesa callback
router.post('/payment/mpesa-callback', mpesaController.mpesaCallback);

module.exports = router;

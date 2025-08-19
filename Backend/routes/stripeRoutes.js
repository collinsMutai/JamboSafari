const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');

// Route to create a Stripe checkout session
router.post('/checkout', stripeController.createCheckoutSession);

// Stripe webhook for payment events (e.g., success or failure)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.webhook);

module.exports = router;

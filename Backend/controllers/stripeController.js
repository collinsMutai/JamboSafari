const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Load Stripe with your secret key from environment variables

// Create a payment session (for checkout)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency, description, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd', // Default to USD
            product_data: {
              name: description || 'Product',
            },
            unit_amount: amount, // Amount in the smallest currency unit (e.g., cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/success`, // Redirect URL after success
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/cancel`, // Redirect URL after cancellation
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: error.message });
  }
};

// Handle the Stripe webhook (for payment events like success or failure)
exports.webhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent was successful!`);
      // Handle successful payment here (e.g., update database or send email)
      break;
    case 'payment_intent.payment_failed':
      const paymentFailedIntent = event.data.object;
      console.log(`PaymentIntent failed: ${paymentFailedIntent.last_payment_error.message}`);
      // Handle failed payment here (e.g., notify the user or retry)
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

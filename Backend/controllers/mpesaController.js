const axios = require("axios");
const qs = require("querystring");

// M-Pesa API configurations
const shortcode = process.env.MPESA_SHORTCODE;  // Replace with your shortcode from environment variables
const lipaNaMpesaShortcode = process.env.MPESA_LIPA_NA_SHORTCODE;  // Replace with Lipa Na Mpesa shortcode
const lipaNaMpesaShortcodeSecret = process.env.MPESA_LIPA_NA_SECRET;  // Replace with your secret
const accessToken = process.env.MPESA_ACCESS_TOKEN; // Generated access token

const mpesaUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"; // Use production URL in production

// Function to get access token
const getAccessToken = async () => {
  const apiUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth = {
    username: process.env.MPESA_API_KEY, // Consumer key
    password: process.env.MPESA_API_SECRET, // Consumer secret
  };

  try {
    const response = await axios.get(apiUrl, {
      auth,
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token", error.message);
    throw new Error("Unable to get access token");
  }
};

// M-Pesa Payment Request
exports.requestPayment = async (req, res) => {
  const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

  if (!phoneNumber || !amount || !accountReference || !transactionDesc) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Get the access token dynamically
    const accessToken = await getAccessToken();
    
    // Prepare the payload for M-Pesa payment request
    const payload = {
      BusinessShortcode: lipaNaMpesaShortcode,
      LipaNaMpesaOnlineShortcode: lipaNaMpesaShortcode,
      LipaNaMpesaOnlineShortcodeSecret: lipaNaMpesaShortcodeSecret,
      PhoneNumber: phoneNumber,
      Amount: amount,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
      // Optional: you can include other fields here like CallBackURL if needed
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(mpesaUrl, payload, { headers });

    if (response.data.ResponseCode === "0") {
      return res.status(200).json({
        message: "Payment initiated successfully",
        data: response.data,
      });
    } else {
      return res.status(400).json({
        error: "Payment request failed",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("Error processing payment", error);
    return res.status(500).json({
      error: "Error processing M-Pesa payment request",
    });
  }
};

// M-Pesa Callback to process the response after payment is completed
exports.mpesaCallback = (req, res) => {
  const paymentResponse = req.body;

  console.log("M-Pesa Callback Response:", paymentResponse);

  // Process payment response (you can save this information to the database or trigger other processes)
  const status = paymentResponse.ResponseCode === "0" ? "SUCCESS" : "FAILED";

  // Update the payment status or handle business logic
  console.log(`Transaction status: ${status}`);

  // Respond to M-Pesa
  return res.status(200).json({
    message: "Payment status processed",
    status,
  });
};

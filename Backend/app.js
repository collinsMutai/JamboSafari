require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const csrf = require('csurf');  // Import CSRF protection
const fs = require('fs');
const https = require('https');
const paymentRoutes = require('./routes/paymentRoutes');  // Import the payment routes

const app = express();

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1); // Exit the process if MongoDB connection fails
    }
};

// Connect to MongoDB before starting the server
connectDB();

// CSRF Protection Middleware
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,  // The cookie cannot be accessed via JavaScript (recommended for security)
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'Strict' // CSRF token cookie is sent with requests to the same site
    }
});

// Middleware to parse incoming JSON data
app.use(express.json());

// Use cookie-parser before CSRF middleware
app.use(cookieParser());  // Ensure this comes before csrfProtection

// Only apply CSRF protection to routes that require it
app.use('/api', csrfProtection, paymentRoutes); // Apply CSRF protection to payment routes

// Default route (doesn't need CSRF protection)
app.get('/', (req, res) => {
    res.send('Pesapal Payment Integration Server');
});

// CSRF token header middleware (After CSRF middleware setup, only for /api routes)
app.use((req, res, next) => {
    if (req.csrfToken) {
        res.setHeader('X-CSRF-Token', req.csrfToken()); // Add CSRF token to response headers
    }
    next();
});

// 404 handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Invalid or missing CSRF token' });
    }
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});

// SSL Configuration
const sslOptions = {
    key: fs.readFileSync('ssl/private.key'),
    cert: fs.readFileSync('ssl/certificate.pem'),
    ca: fs.readFileSync('ssl/csr.pem'),
};

// Start the HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});

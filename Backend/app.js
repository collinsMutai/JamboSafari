require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet'); // Import Helmet
const csrf = require('csurf'); // Import CSRF protection
const paymentRoutes = require('./routes/paymentRoutes'); // Import the payment routes

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

// Set up CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

// Parse the FRONTEND_ORIGINS environment variable
const allowedOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(',')
  : []; // Default to an empty array if no environment variable is set

// CORS configuration to allow specific origins
const corsOptions = {
    origin: allowedOrigins, // Allow origins specified in .env file
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies and credentials if needed
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));

// Use Helmet for HTTP Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], // Only allow loading content from the same origin
            scriptSrc: ["'self'", 'trusted-cdn.com'], // Allow scripts from trusted sources
            styleSrc: ["'self'", 'trusted-cdn.com'], // Allow styles from trusted sources
            imgSrc: ["'self'", 'trusted-image-source.com'], // Allow images from specific sources
            connectSrc: ["'self'", 'trusted-api.com'], // Allow connections to trusted API sources
            objectSrc: ["'none'"], // Prevent loading of any plugins (e.g., Flash)
            frameSrc: ["'none'"], // Disallow embedding the site in an iframe
            fontSrc: ["'self'", 'trusted-font-source.com'], // Allow fonts from specific sources
        },
    },
    hsts: {
        maxAge: 31536000, // Enforce HTTPS for 1 year
        includeSubDomains: true, // Apply HSTS to subdomains as well
        preload: true, // Preload the domain in the HSTS preload list (optional but recommended)
    },
}));

// Middleware to parse incoming JSON data
app.use(express.json());

// Send CSRF token in the response headers
app.use((req, res, next) => {
    res.setHeader('X-CSRF-Token', req.csrfToken());
    next();
});

// Use the payment routes with /api prefix
app.use('/api', csrfProtection, paymentRoutes); // Apply CSRF protection to the payment routes

// Default route for testing
app.get('/', (req, res) => {
    res.send('Pesapal Payment Integration Server');
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

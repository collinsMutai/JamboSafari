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

// CORS Configuration (with methods and allowed headers)
const allowedOrigins = process.env.FRONTEND_ORIGINS.split(',');
app.use(cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies to be sent across origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Limit allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'], // Allowed headers
    preflightContinue: false, // Handle preflight requests automatically
}));

// Middleware to apply security headers
app.use(helmet());

// Helmet CSP Configuration
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://api.example.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],  // Automatically upgrade HTTP requests to HTTPS
    },
}));

// Helmet HSTS Configuration
app.use(helmet.hsts({
    maxAge: 31536000,  // One year
    includeSubDomains: true,
    preload: true,
}));

// Helmet Frameguard
app.use(helmet.frameguard({ action: 'deny' }));  // Prevent clickjacking

// Helmet XSS Protection
app.use(helmet.xssFilter());  // Enable XSS protection

// Helmet NoSniff
app.use(helmet.noSniff());  // Prevent MIME sniffing

// Helmet Referrer Policy
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));  // Control referrer information

// Helmet Permissions Policy
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'fullscreen=(self), geolocation=(self)');
    next();
});



// Helmet No Cache
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});


// Only apply CSRF protection to routes that require it
app.use('/api', csrfProtection, paymentRoutes); // Apply CSRF protection to payment routes

// Default route (doesn't need CSRF protection)
app.get('/', (req, res) => {
    res.send('Server is running...');
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

// Redirect HTTP requests to HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        // Ensure HTTPS only for production
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    });

    // SSL Configuration (for HTTPS)
    const sslOptions = {
        key: fs.readFileSync('ssl/private.key'),
        cert: fs.readFileSync('ssl/certificate.pem'),
        ca: fs.readFileSync('ssl/csr.pem'),
    };

    // Start the HTTPS server (Only in production, HTTPS)
    const PORT = process.env.PORT || 3000;
    https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`HTTPS server running on https://localhost:${PORT}`);
    });
} else {
    // In development, run using HTTP
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`HTTP server running on http://localhost:${PORT}`);
    });
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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

// Middleware to parse incoming JSON data
app.use(express.json());

// Use the payment routes with /api prefix
app.use('/api', paymentRoutes);

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
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

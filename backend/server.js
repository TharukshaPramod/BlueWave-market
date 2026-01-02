const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Serve uploaded files statically (for viewing payment slips)
app.use('/uploads', express.static('uploads'));

// Admin Routes
app.use('/api/fleet', require('./routes/fleetRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));

// Customer Routes
app.use('/api/fish-items', require('./routes/fishItemRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Try different ports if the default one is in use
const tryPort = (port) => {
  const server = app.listen(port)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        tryPort(port + 1);
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      console.log(`Server running on port ${port}`);
    });
};

const PORT = process.env.PORT || 5000;
tryPort(PORT);
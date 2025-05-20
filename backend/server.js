/**
 * Enigma HR Solutions - Backend Server
 * 
 * This is the main entry point for the Enigma HR Solutions backend API.
 * It sets up the Express server, middleware, and routes for the HR management system.
 * 
 * @author Ramanavenky22
 * @version 1.0.0
 */

const express = require('express');
require('dotenv').config();
require('./config/db'); // Initialize MySQL database connection

const cors = require('cors');
const { checkJwt, syncUser } = require('./middleware/auth');

// Initialize Express application
const app = express();

// Middleware Configuration
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

/**
 * Global Authentication Middleware
 * 
 * This middleware checks for valid JWT tokens on all routes.
 * It ensures that only authenticated users can access the API.
 */
app.use((req, res, next) => {
  checkJwt(req, res, (err) => {
    if (err) {
      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Invalid or missing token' });
      }
      return res.status(500).json({ message: 'Internal error' });
    }
    next();
  });
});

/**
 * User Synchronization Middleware
 * 
 * This middleware ensures user data is synchronized with the database
 * on each request. It maintains user session consistency.
 */
app.use((req, res, next) => {
  syncUser(req, res, (err) => {
    if (err) {
      console.error('Error syncing user:', err);
      return res.status(500).json({ message: 'Error syncing user' });
    }
    next();
  });
});

// Import Route Modules
const teamRoutes = require('./routes/teamsRoutes');
const profileRoutes = require('./routes/profileRoutes.js');
const employeeRoutes = require('./routes/employeeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const activitiesRouter = require('./routes/activitiesRoutes');

// API Routes Registration
app.use('/api/employees', employeeRoutes);      // Employee management endpoints
app.use('/api/notifications', notificationRoutes); // Notification system endpoints
app.use('/api/activities', activitiesRouter);   // Activity tracking endpoints
app.use('/', teamRoutes);                      // Team management endpoints
app.use('/api', profileRoutes);                // User profile endpoints
app.use('/api/statistics', statisticsRoutes);   // Analytics and statistics endpoints

// Health Check Endpoint
app.get('/', (req, res) => {
  res.send('HR Portal Backend is running');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
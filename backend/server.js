const express = require('express');
require('dotenv').config();
require('./config/db'); // Your MySQL connection

const cors = require('cors');
const { checkJwt, syncUser } = require('./middleware/auth'); // Import checkJwt and syncUser middleware

const app = express();
app.use(cors());
app.use(express.json());

// Apply checkJwt and syncUser globally to all routes
app.use(checkJwt);
app.use(syncUser);

const teamRoutes = require('./routes/teamsRoutes');
const profileRoutes = require('./routes/profileRoutes.js');
const employeeRoutes = require('./routes/employeeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// Register routes
app.use('/api/employees', employeeRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/', (req, res) => {
  res.send('HR Portal Backend is running');
});

// Team and profile routes
app.use('/', teamRoutes);
app.use('/api', profileRoutes);
app.use('/api/statistics', statisticsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
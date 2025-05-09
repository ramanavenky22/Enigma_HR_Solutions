const express = require('express');
require('dotenv').config();
require('./config/db'); // Your MySQL connection

const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const teamRoutes = require('./routes/teamsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Register routes
app.use('/api/employees', employeeRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/', (req, res) => {
  res.send('HR Portal Backend is running');
});

// Team and profile routes
app.use('/', teamRoutes);
app.use('/api', profileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

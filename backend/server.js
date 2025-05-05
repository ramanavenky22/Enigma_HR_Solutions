const express = require('express');
require('dotenv').config();
require('./config/db'); // Your MySQL connection

const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const teamRoutes = require('./routes/teamsRoutes');
const profileRoutes = require('./routes/profileRoutes'); 

// Base route
// Import routes
const employeeRoutes = require('./routes/employeeRoutes');

// Register routes
app.use('/api/employees', employeeRoutes);
app.get('/', (req, res) => {
  res.send('HR Portal Backend is running');
});

// 👇 use team routes
app.use('/', teamRoutes);
app.use('/', profileRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// server.js
const express = require('express');
require('dotenv').config();
require('./config/db'); // Your MySQL connection

const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const employeeRoutes = require('./routes/employeeRoutes');

// Register routes
app.use('/api/employees', employeeRoutes);

app.get('/', (req, res) => {
  res.send('HR Portal Backend is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

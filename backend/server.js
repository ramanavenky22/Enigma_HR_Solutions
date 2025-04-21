// server.js
const express = require('express');
require('./config/db');

const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/employees', employeeRoutes);

app.get('/', (req, res) => {
  res.send('HR Portal Backend is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

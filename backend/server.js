const express = require('express');
require('./config/db');

const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const teamRoutes = require('./routes/teamsRoutes');
const profileRoutes = require('./routes/profileRoutes'); 

// Base route
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

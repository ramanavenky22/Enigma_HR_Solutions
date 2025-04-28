const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Temporary: Use empId from query param until auth is added
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);

module.exports = router;

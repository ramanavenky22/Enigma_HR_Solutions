const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Notification routes
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;

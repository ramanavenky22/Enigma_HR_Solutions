const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Notification routes
router.get('/', checkJwt, notificationController.getNotifications);
router.get('/unread-count', checkJwt, notificationController.getUnreadCount);
router.put('/:id/read', checkJwt, notificationController.markAsRead);

module.exports = router;

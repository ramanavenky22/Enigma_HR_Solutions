const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { checkJwt } = require('../middleware/auth');
const { checkRole } = require('../middleware/roles');

// Get all activities
router.get('/', checkJwt, activityController.getActivities);

// Create activity (HR only)
router.post('/', checkJwt, checkRole('HR'), activityController.createActivity);

// Delete activity (HR only)
router.delete('/:id', checkJwt, checkRole('HR'), activityController.deleteActivity);

module.exports = router;

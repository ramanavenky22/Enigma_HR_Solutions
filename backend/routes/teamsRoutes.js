const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// No auth — managerId will come from query param or hardcoded for now
router.get('/team', teamController.getTeamMembers);
router.get('/team/search', teamController.searchTeamMembers);
router.get('/team/count', teamController.getTeamCount);


module.exports = router;

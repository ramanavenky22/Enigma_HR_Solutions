const express = require('express');
const router = express.Router();

const teamController = require('../controllers/teamController');
const { checkJwt, checkRole } = require('../middleware/auth');

// Optional: Middleware to enrich req.user with empId from Auth0 `sub`
const enrichUser = (req, res, next) => {
  try {
    const sub = req.auth?.sub || '';
    const empId = sub.split('|')[1]; // Assumes Auth0 sub format: "auth0|10001"
    req.user = { empId };
    next();
  } catch (err) {
    console.error('❌ Failed to enrich user from sub:', err);
    res.status(400).json({ error: 'Invalid token format' });
  }
};

// All team routes are manager-only
router.get('/team', checkJwt, enrichUser, checkRole('manager'), teamController.getTeamMembers);
router.get('/team/search', checkJwt, enrichUser, checkRole('manager'), teamController.searchTeamMembers);
router.get('/team/count', checkJwt, enrichUser, checkRole('manager'), teamController.getTeamCount);

module.exports = router;

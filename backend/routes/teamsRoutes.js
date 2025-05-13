const express = require('express');
const router = express.Router();

const teamController = require('../controllers/teamController');
const { checkJwt } = require('../middleware/auth');

// 🔧 Middleware: Optionally enrich user info (you may skip this if not needed)
const enrichUser = (req, res, next) => {
  const sub = req.auth?.sub;
  if (!sub) return res.status(401).json({ error: 'Unauthorized' });
  req.user = { auth0Id: sub };
  next();
};

// 📌 Routes — open to all authenticated users
router.get('/api/team', checkJwt, enrichUser, teamController.getTeamMembers);
router.get('/api/team/search', checkJwt, enrichUser, teamController.searchTeamMembers);
router.get('/api/team/count', checkJwt, enrichUser, teamController.getTeamCount);

module.exports = router;
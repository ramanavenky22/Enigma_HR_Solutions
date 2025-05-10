const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');
const {
  getEmployeeStats,
  getSalaryTrends,
  getDepartmentGrowth
} = require('../controllers/statisticsController');

// Statistics routes
router.get('/stats', checkJwt, getEmployeeStats);
router.get('/salary-trends', checkJwt, getSalaryTrends);
router.get('/department-growth', checkJwt, getDepartmentGrowth);

module.exports = router;

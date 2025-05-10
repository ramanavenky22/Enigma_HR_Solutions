const express = require('express');
const router = express.Router();
const { checkJwt, checkRole } = require('../middleware/auth');
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getProfileByAuth0Id
} = require('../controllers/employeeController');

// Employee routes
router.get('/', checkJwt, getAllEmployees);
router.get('/profile/:auth0_id', checkJwt, getProfileByAuth0Id); // Get profile by auth0_id
router.get('/:id', checkJwt, checkRole('hr'), getEmployeeById);
router.post('/', checkJwt, checkRole('hr'), createEmployee);
router.put('/:id', checkJwt, checkRole('hr'), updateEmployee); // checkRole will also allow self-updates
router.delete('/:id', checkJwt, checkRole('hr'), deleteEmployee);

module.exports = router; 
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
router.get('/',  getAllEmployees);
router.get('/profile/:auth0_id', getProfileByAuth0Id); // Get profile by auth0_id
router.get('/:id',  checkRole("hr"), getEmployeeById);
router.post('/',  checkRole("hr"), createEmployee);
router.put('/:id',  checkRole("hr"), updateEmployee);
router.delete('/:id',  checkRole("hr"), deleteEmployee);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { checkJwt, checkRole } = require('../middleware/auth');
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

// Employee routes
router.get('/',checkJwt, getAllEmployees);
router.get('/:id',checkJwt, checkRole("hr"), getEmployeeById);
router.post('/',checkJwt, checkRole("hr"), createEmployee);
router.put('/:id',checkJwt, checkRole("hr"), updateEmployee);
router.delete('/:id',checkJwt, checkRole("hr"), deleteEmployee);

module.exports = router; 
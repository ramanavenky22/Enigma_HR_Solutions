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
router.get('/', getAllEmployees);
router.get('/:id', checkRole(["hr"]), getEmployeeById);
router.post('/', checkRole(["hr"]), createEmployee);
router.put('/:id', checkRole(["hr"]), updateEmployee);
router.delete('/:id', checkRole(["hr"]), deleteEmployee);

module.exports = router; 
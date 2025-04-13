const db = require('../config/db');

// Get all employees
const getAllEmployees = (req, res) => {
  const query = 'SELECT * FROM employees';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ error: 'Error fetching employees' });
    }
    res.json(results);
  });
};

// Get employee by ID
const getEmployeeById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM employees WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching employee:', err);
      return res.status(500).json({ error: 'Error fetching employee' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(results[0]);
  });
};

// Create new employee
const createEmployee = (req, res) => {
  const { name, email, position, department, salary } = req.body;
  const query = 'INSERT INTO employees (name, email, position, department, salary) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, email, position, department, salary], (err, results) => {
    if (err) {
      console.error('Error creating employee:', err);
      return res.status(500).json({ error: 'Error creating employee' });
    }
    res.status(201).json({ id: results.insertId, message: 'Employee created successfully' });
  });
};

// Update employee
const updateEmployee = (req, res) => {
  const { id } = req.params;
  const { name, email, position, department, salary } = req.body;
  const query = 'UPDATE employees SET name = ?, email = ?, position = ?, department = ?, salary = ? WHERE id = ?';
  db.query(query, [name, email, position, department, salary, id], (err, results) => {
    if (err) {
      console.error('Error updating employee:', err);
      return res.status(500).json({ error: 'Error updating employee' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee updated successfully' });
  });
};

// Delete employee
const deleteEmployee = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM employees WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting employee:', err);
      return res.status(500).json({ error: 'Error deleting employee' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  });
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
}; 
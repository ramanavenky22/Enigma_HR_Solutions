const db = require('../config/db');

// Get all employees
const getAllEmployees = (req, res) => {
  const query = 'SELECT * FROM employees LIMIT 100';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ error: 'Error fetching employees' });
    }
    res.json(results);
  });
};

// Get employee by emp_no
const getEmployeeById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM employees WHERE emp_no = ?';
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
  const { emp_no, birth_date, first_name, last_name, gender, hire_date } = req.body;
  const query = 'INSERT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [emp_no, birth_date, first_name, last_name, gender, hire_date], (err, results) => {
    if (err) {
      console.error('Error creating employee:', err);
      return res.status(500).json({ error: 'Error creating employee' });
    }
    res.status(201).json({ emp_no: results.insertId, message: 'Employee created successfully' });
  });
};

// Update employee
const updateEmployee = (req, res) => {
  const { id } = req.params;
  const { birth_date, first_name, last_name, gender, hire_date } = req.body;
  const query = 'UPDATE employees SET birth_date = ?, first_name = ?, last_name = ?, gender = ?, hire_date = ? WHERE emp_no = ?';
  db.query(query, [birth_date, first_name, last_name, gender, hire_date, id], (err, results) => {
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
  const query = 'DELETE FROM employees WHERE emp_no = ?';
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
const { query, startTransaction, commitTransaction, rollbackTransaction } = require('../config/db');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const { title, department } = req.query;
    let queryStr = `
      SELECT 
        e.emp_no,
        e.birth_date,
        e.first_name,
        e.last_name,
        e.gender,
        e.hire_date,
        d.dept_name as department_name,
        t.title,
        s.salary,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      LEFT JOIN departments d ON de.dept_no = d.dept_no
      LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
      LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
      LEFT JOIN dept_manager dm ON de.dept_no = dm.dept_no AND dm.to_date = '9999-01-01'
      LEFT JOIN employees m ON dm.emp_no = m.emp_no
      WHERE 1=1
    `;
    
    const params = [];

    if (title) {
      queryStr += ' AND t.title = ?';
      params.push(title);
    }
    
    if (department) {
      queryStr += ' AND d.dept_name = ?';
      params.push(department);
    }

    queryStr += ' ORDER BY e.emp_no';

    const results = await query(queryStr, params);
    res.json(results);
  } catch (err) {
    console.error('Error in getAllEmployees:', err);
    res.status(500).json({ 
      error: 'Error fetching employees',
      details: err.message 
    });
  }
};

// Get employee by emp_no
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const queryStr = `
      SELECT 
        e.emp_no,
        e.birth_date,
        e.first_name,
        e.last_name,
        e.gender,
        e.hire_date,
        d.dept_name as department_name,
        t.title,
        s.salary,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      LEFT JOIN departments d ON de.dept_no = d.dept_no
      LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
      LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
      LEFT JOIN dept_manager dm ON de.dept_no = dm.dept_no AND dm.to_date = '9999-01-01'
      LEFT JOIN employees m ON dm.emp_no = m.emp_no
      WHERE e.emp_no = ?
    `;
    
    const results = await query(queryStr, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error('Error in getEmployeeById:', err);
    res.status(500).json({ 
      error: 'Error fetching employee',
      details: err.message 
    });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { emp_no, birth_date, first_name, last_name, gender, hire_date, department_no, title, salary } = req.body;
    
    // Parse dates
    const parsedBirthDate = new Date(birth_date);
    const parsedHireDate = new Date(hire_date);
    
    // Insert into employees table
    const employeeQuery = 'INSERT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date) VALUES (?, ?, ?, ?, ?, ?)';
    await query(employeeQuery, [emp_no, parsedBirthDate, first_name, last_name, gender, parsedHireDate]);

    // Insert into dept_emp table
    const deptEmpQuery = 'INSERT INTO dept_emp (emp_no, dept_no, from_date, to_date) VALUES (?, ?, ?, ?)';
    await query(deptEmpQuery, [emp_no, department_no, parsedHireDate, '9999-01-01']);

    // Insert into titles table
    const titleQuery = 'INSERT INTO titles (emp_no, title, from_date, to_date) VALUES (?, ?, ?, ?)';
    await query(titleQuery, [emp_no, title, parsedHireDate, '9999-01-01']);

    // Insert into salaries table
    const salaryQuery = 'INSERT INTO salaries (emp_no, salary, from_date, to_date) VALUES (?, ?, ?, ?)';
    await query(salaryQuery, [emp_no, salary, parsedHireDate, '9999-01-01']);
    
    res.status(201).json({ 
      message: 'Employee created successfully',
      emp_no: emp_no
    });
  } catch (err) {
    console.error('Error in createEmployee:', err);
    res.status(500).json({ 
      error: 'Error creating employee',
      details: err.message 
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { birth_date, first_name, last_name, gender, hire_date, department_no, title, salary } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    await startTransaction();

    // Update employee details
    if (first_name || last_name) {
      const updateEmployeeQuery = 'UPDATE employees SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE emp_no = ?';
      await query(updateEmployeeQuery, [first_name, last_name, id]);
    }

    // Update title
    if (title) {
      const currentDate = new Date().toISOString().slice(0, 10);
      
      // Update the current title
      const updateTitleQuery = 'UPDATE titles SET title = ? WHERE emp_no = ? AND to_date = ?';
      await query(updateTitleQuery, [title, id, '9999-01-01']);
    }

    // Update salary
    if (salary) {
      const currentDate = new Date().toISOString().slice(0, 10);
      
      // Update the current salary
      const updateSalaryQuery = 'UPDATE salaries SET salary = ? WHERE emp_no = ? AND to_date = ?';
      await query(updateSalaryQuery, [salary, id, '9999-01-01']);
    }

    // Update department
    if (department_no) {
      const currentDate = new Date().toISOString().slice(0, 10);
      
      // Set end date for current department
      const endCurrentDeptQuery = 'UPDATE dept_emp SET to_date = ? WHERE emp_no = ? AND to_date = ?';
      await query(endCurrentDeptQuery, [currentDate, id, '9999-01-01']);
      
      // Insert new department
      const insertDeptQuery = 'INSERT INTO dept_emp (emp_no, dept_no, from_date, to_date) VALUES (?, ?, ?, ?)';
      await query(insertDeptQuery, [id, department_no, currentDate, '9999-01-01']);
    }

    await commitTransaction();
    
    res.json({
      message: 'Employee updated successfully',
      emp_no: id
    });
  } catch (err) {
    await rollbackTransaction();
    console.error('Error in updateEmployee:', err);
    res.status(500).json({
      error: 'Error updating employee',
      details: err.message
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    await startTransaction();

    try {
      // End all current assignments
      const endDeptQuery = 'UPDATE dept_emp SET to_date = CURDATE() WHERE emp_no = ? AND to_date = "9999-01-01"';
      await query(endDeptQuery, [id]);
      
      const endTitleQuery = 'UPDATE titles SET to_date = CURDATE() WHERE emp_no = ? AND to_date = "9999-01-01"';
      await query(endTitleQuery, [id]);
      
      const endSalaryQuery = 'UPDATE salaries SET to_date = CURDATE() WHERE emp_no = ? AND to_date = "9999-01-01"';
      await query(endSalaryQuery, [id]);

      // Delete the employee
      const deleteEmployeeQuery = 'DELETE FROM employees WHERE emp_no = ?';
      await query(deleteEmployeeQuery, [id]);

      await commitTransaction();
      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      await rollbackTransaction();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Error deleting employee', details: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
}; 
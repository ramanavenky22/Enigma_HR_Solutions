const { db, query } = require('../config/db');

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
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Insert into employees table
      const employeeQuery = 'INSERT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date) VALUES (?, ?, ?, ?, ?, ?)';
      await query(employeeQuery, [emp_no, birth_date, first_name, last_name, gender, hire_date]);

      // Insert into dept_emp table
      const deptEmpQuery = 'INSERT INTO dept_emp (emp_no, dept_no, from_date, to_date) VALUES (?, ?, ?, ?)';
      await query(deptEmpQuery, [emp_no, department_no, hire_date, '9999-01-01']);

      // Insert into titles table
      const titleQuery = 'INSERT INTO titles (emp_no, title, from_date, to_date) VALUES (?, ?, ?, ?)';
      await query(titleQuery, [emp_no, title, hire_date, '9999-01-01']);

      // Insert into salaries table
      const salaryQuery = 'INSERT INTO salaries (emp_no, salary, from_date, to_date) VALUES (?, ?, ?, ?)';
      await query(salaryQuery, [emp_no, salary, hire_date, '9999-01-01']);

      // Commit the transaction
      await query('COMMIT');
      
      res.status(201).json({ 
        message: 'Employee created successfully',
        emp_no: emp_no
      });
    } catch (err) {
      // Rollback the transaction
      await query('ROLLBACK');
      throw err;
    }
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

    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Update employees table
      const employeeUpdates = [];
      const employeeParams = [];
      
      if (birth_date !== undefined && birth_date !== null) { 
        employeeUpdates.push('birth_date = ?'); 
        employeeParams.push(birth_date); 
      }
      if (first_name !== undefined && first_name !== null) { 
        employeeUpdates.push('first_name = ?'); 
        employeeParams.push(first_name); 
      }
      if (last_name !== undefined && last_name !== null) { 
        employeeUpdates.push('last_name = ?'); 
        employeeParams.push(last_name); 
      }
      if (gender !== undefined && gender !== null) { 
        employeeUpdates.push('gender = ?'); 
        employeeParams.push(gender); 
      }
      if (hire_date !== undefined && hire_date !== null) { 
        employeeUpdates.push('hire_date = ?'); 
        employeeParams.push(hire_date); 
      }
      
      if (employeeUpdates.length > 0) {
        employeeParams.push(id);
        const employeeQuery = `UPDATE employees SET ${employeeUpdates.join(', ')} WHERE emp_no = ?`;
        await query(employeeQuery, employeeParams);
      }

      // Update department if provided
      if (department_no !== undefined && department_no !== null) {
        const deptUpdateQuery = `
          UPDATE dept_emp 
          SET to_date = CURRENT_DATE() 
          WHERE emp_no = ? AND to_date = '9999-01-01'
        `;
        await query(deptUpdateQuery, [id]);

        const newDeptQuery = `
          INSERT INTO dept_emp (emp_no, dept_no, from_date, to_date) 
          VALUES (?, ?, CURRENT_DATE(), '9999-01-01')
        `;
        await query(newDeptQuery, [id, department_no]);
      }

      // Update title if provided
      if (title !== undefined && title !== null) {
        const titleUpdateQuery = `
          UPDATE titles 
          SET to_date = CURRENT_DATE() 
          WHERE emp_no = ? AND to_date = '9999-01-01'
        `;
        await query(titleUpdateQuery, [id]);

        const newTitleQuery = `
          INSERT INTO titles (emp_no, title, from_date, to_date) 
          VALUES (?, ?, CURRENT_DATE(), '9999-01-01')
        `;
        await query(newTitleQuery, [id, title]);
      }

      // Update salary if provided
      if (salary !== undefined && salary !== null) {
        const salaryUpdateQuery = `
          UPDATE salaries 
          SET to_date = CURRENT_DATE() 
          WHERE emp_no = ? AND to_date = '9999-01-01'
        `;
        await query(salaryUpdateQuery, [id]);

        const newSalaryQuery = `
          INSERT INTO salaries (emp_no, salary, from_date, to_date) 
          VALUES (?, ?, CURRENT_DATE(), '9999-01-01')
        `;
        await query(newSalaryQuery, [id, salary]);
      }

      // Commit the transaction
      await query('COMMIT');
      
      res.json({ message: 'Employee updated successfully' });
    } catch (err) {
      // Rollback the transaction
      await query('ROLLBACK');
      throw err;
    }
  } catch (err) {
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
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Update related records to set end dates
      const updateQueries = [
        'UPDATE dept_emp SET to_date = CURRENT_DATE() WHERE emp_no = ? AND to_date = "9999-01-01"',
        'UPDATE titles SET to_date = CURRENT_DATE() WHERE emp_no = ? AND to_date = "9999-01-01"',
        'UPDATE salaries SET to_date = CURRENT_DATE() WHERE emp_no = ? AND to_date = "9999-01-01"'
      ];

      // Execute all update queries
      for (const updateQuery of updateQueries) {
        await query(updateQuery, [id]);
      }

      // Delete the employee
      const deleteQuery = 'DELETE FROM employees WHERE emp_no = ?';
      const result = await query(deleteQuery, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Employee not found');
      }

      // Commit the transaction
      await query('COMMIT');
      
      res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
      // Rollback the transaction
      await query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error in deleteEmployee:', err);
    res.status(500).json({ 
      error: 'Error deleting employee',
      details: err.message 
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
}; 
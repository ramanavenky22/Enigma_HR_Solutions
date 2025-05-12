const { query, startTransaction, commitTransaction, rollbackTransaction } = require('../config/db');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { title, department, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // First, get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT e.emp_no) as total
      FROM employees e
      LEFT JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      LEFT JOIN departments d ON de.dept_no = d.dept_no
      LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
      WHERE 1=1
    `;

    // Main query for employee data
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
    const countParams = [];

    if (title) {
      const clause = ' AND t.title = ?';
      queryStr += clause;
      countQuery += clause;
      params.push(title);
      countParams.push(title);
    }
    
    if (department) {
      const clause = ' AND d.dept_name = ?';
      queryStr += clause;
      countQuery += clause;
      params.push(department);
      countParams.push(department);
    }

    if (search && search.length >= 3) {
      const searchTerm = search.toLowerCase();
      const clause = ` AND (LOWER(e.first_name) LIKE ? OR 
                         LOWER(e.last_name) LIKE ? OR 
                         LOWER(CONCAT(e.first_name, ' ', e.last_name)) LIKE ? OR
                         LOWER(t.title) LIKE ? OR 
                         LOWER(d.dept_name) LIKE ?)`;
      queryStr += clause;
      countQuery += clause;
      const likeSearch = `%${searchTerm}%`;
      params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
      countParams.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
    }

    queryStr += ' ORDER BY e.emp_no LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [countResult] = await query(countQuery, countParams);
    const results = await query(queryStr, params);

    res.json({
      employees: results,
      total: countResult.total,
      page: parseInt(page),
      totalPages: Math.ceil(countResult.total / limit)
    });
  } catch (err) {
    console.error('Error in getAllEmployees:', err);
    res.status(500).json({ 
      error: 'Error fetching employees',
      details: err.message 
    });
  }
};

// Get employee by emp_no
exports.getEmployeeById = async (req, res) => {
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
exports.createEmployee = async (req, res) => {
  try {
    const { emp_no, birth_date, first_name, last_name, gender, hire_date, department_no, title, salary } = req.body;
    
    // Parse dates
    const parsedBirthDate = new Date(birth_date);
    const parsedHireDate = new Date(hire_date);
    
    // Start transaction
    await startTransaction();

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
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { birth_date, first_name, last_name, gender, hire_date, department, title, salary } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    // Check if employee exists
    const employeeCheck = await query('SELECT emp_no FROM employees WHERE emp_no = ?', [id]);
    if (employeeCheck.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await startTransaction();
    try {
      // Update employee details
      if (first_name || last_name || gender || birth_date || hire_date) {
        const updateEmployeeQuery = `
          UPDATE employees 
          SET 
            first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            gender = COALESCE(?, gender),
            birth_date = COALESCE(?, birth_date),
            hire_date = COALESCE(?, hire_date)
          WHERE emp_no = ?
        `;
        await query(updateEmployeeQuery, [
          first_name,
          last_name,
          gender,
          birth_date ? new Date(birth_date).toISOString().slice(0, 10) : null,
          hire_date ? new Date(hire_date).toISOString().slice(0, 10) : null,
          id
        ]);
      }

      // Update title
      if (title) {
        const updateTitleQuery = `
          UPDATE titles 
          SET title = ? 
          WHERE emp_no = ? AND to_date = '9999-01-01'
        `;
        const result = await query(updateTitleQuery, [title, id]);
        
        // If no current title exists, insert one
        if (result.affectedRows === 0) {
          const insertTitleQuery = `
            INSERT INTO titles (emp_no, title, from_date, to_date) 
            VALUES (?, ?, CURDATE(), '9999-01-01')
          `;
          await query(insertTitleQuery, [id, title]);
        }
      }

      // Update salary
      if (salary) {
        try {
          console.log('Starting salary update for:', { emp_no: id, salary });

          // Check if there's a salary record for today
          const getTodaysSalaryQuery = `
            SELECT * FROM salaries 
            WHERE emp_no = ? AND from_date = CURDATE()
          `;
          const todaysSalary = await query(getTodaysSalaryQuery, [id]);

          if (todaysSalary.length > 0) {
            // Update today's salary record
            const updateTodaySalaryQuery = `
              UPDATE salaries 
              SET salary = ?, to_date = '9999-01-01'
              WHERE emp_no = ? AND from_date = CURDATE()
            `;
            await query(updateTodaySalaryQuery, [salary, id]);
          } else {
            // End any current salary records
            const endCurrentSalaryQuery = `
              UPDATE salaries 
              SET to_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
              WHERE emp_no = ? AND to_date = '9999-01-01'
            `;
            await query(endCurrentSalaryQuery, [id]);

            // Insert new salary record
            const insertSalaryQuery = `
              INSERT INTO salaries (emp_no, salary, from_date, to_date) 
              VALUES (?, ?, CURDATE(), '9999-01-01')
            `;
            await query(insertSalaryQuery, [id, salary]);
          }

          console.log('Salary update completed successfully');
        } catch (salaryErr) {
          console.error('Salary update error:', {
            error: salaryErr.message,
            stack: salaryErr.stack,
            emp_no: id,
            salary
          });
          throw new Error(`Salary update failed: ${salaryErr.message}`);
        }
      }

      // Update department
      if (department) {
        try {
          console.log('Starting department update for:', { emp_no: id, department });

          // Check if department exists
          const deptCheckQuery = 'SELECT dept_no FROM departments WHERE dept_no = ?';
          const deptExists = await query(deptCheckQuery, [department]);
          console.log('Department check result:', { deptExists });
          
          if (deptExists.length === 0) {
            throw new Error('Invalid department number');
          }

          // Delete any existing records for this employee-department combination
          const deleteExistingQuery = `
            DELETE FROM dept_emp 
            WHERE emp_no = ? AND dept_no = ?
          `;
          await query(deleteExistingQuery, [id, department]);
          console.log('Deleted any existing records');

          // End any current assignments in other departments
          const endCurrentAssignmentsQuery = `
            UPDATE dept_emp 
            SET to_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            WHERE emp_no = ? AND to_date = '9999-01-01'
          `;
          await query(endCurrentAssignmentsQuery, [id]);
          console.log('Ended current assignments');

          // Insert the new assignment
          const insertNewDeptQuery = `
            INSERT INTO dept_emp (emp_no, dept_no, from_date, to_date)
            VALUES (?, ?, CURDATE(), '9999-01-01')
          `;
          await query(insertNewDeptQuery, [id, department]);
          console.log('Inserted new department assignment');

        } catch (deptErr) {
          console.error('Department update error:', { 
            error: deptErr.message,
            stack: deptErr.stack,
            emp_no: id,
            department
          });
          throw new Error(`Department update failed: ${deptErr.message}`);
        }
      }

      await commitTransaction();
      res.json({ message: 'Employee updated successfully' });
    } catch (err) {
      console.error('Error in inner try block:', err);
      await rollbackTransaction();
      throw err;
    }

    try {
      // If we get here, commit the transaction
      await commitTransaction();
      return res.json({ message: 'Employee updated successfully' });
    } catch (commitErr) {
      console.error('Error committing transaction:', commitErr);
      try {
        await rollbackTransaction();
      } catch (rollbackErr) {
        console.error('Error rolling back:', rollbackErr);
      }
      return res.status(500).json({ 
        error: 'Error committing transaction',
        details: commitErr.message 
      });
    }
  } catch (err) {
    console.error('Error in updateEmployee:', err);
    try {
      await rollbackTransaction();
    } catch (rollbackErr) {
      console.error('Error rolling back:', rollbackErr);
    }
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Error updating employee',
        details: err.message 
      });
    }
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
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
    return res.status(500).json({ error: 'Error deleting employee', details: error.message });
  }
};

// Get employee profile by auth0_id
exports.getProfileByAuth0Id = async (req, res) => {
  try {
    const auth0Id = req.params.auth0_id;
    console.log('Executing query: getEmployeeByAuth0Id');
    console.log('With parameters:', [auth0Id]);

    const result = await query(
      `
      SELECT 
        e.emp_no,
        DATE_FORMAT(e.birth_date, '%Y-%m-%d') as birth_date,
        e.first_name,
        e.last_name,
        e.gender,
        DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date,
        d.dept_name as department_name,
        de.dept_no,
        t.title,
        COALESCE(s.salary, 0) as salary,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      LEFT JOIN departments d ON de.dept_no = d.dept_no
      LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
      LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
      LEFT JOIN dept_manager dm ON de.dept_no = dm.dept_no AND dm.to_date = '9999-01-01'
      LEFT JOIN employees m ON dm.emp_no = m.emp_no
      WHERE e.auth0_id = ?
    `,
      [auth0Id]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.json(result[0]);
  } catch (err) {
    console.error('Error in getEmployeeByAuth0Id:', err);
    return res.status(500).json({ 
      error: 'Error fetching employee',
      details: err.message 
    });
  }
};

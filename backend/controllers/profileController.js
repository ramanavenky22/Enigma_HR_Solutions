

exports.getProfile = async (req, res) => {
  const empId = req.query.empId;
  console.log('👉 Received empId:', req.query.empId);


  if (!empId) {
    return res.status(400).json({ message: 'Missing empId' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT 
         e.emp_no,
         e.first_name,
         e.last_name,
         e.gender,
         e.birth_date,
         e.hire_date,
         d.dept_name,
         t.title,
         s.salary,
         m.first_name AS manager_first_name,
         m.last_name AS manager_last_name
       FROM employees e
       LEFT JOIN dept_emp de ON de.emp_no = e.emp_no AND de.to_date = '9999-01-01'
       LEFT JOIN departments d ON d.dept_no = de.dept_no
       LEFT JOIN titles t ON t.emp_no = e.emp_no AND t.to_date = '9999-01-01'
       LEFT JOIN salaries s ON s.emp_no = e.emp_no AND s.to_date = '9999-01-01'
       LEFT JOIN dept_manager dm ON dm.dept_no = de.dept_no AND dm.to_date = '9999-01-01'
       LEFT JOIN employees m ON m.emp_no = dm.emp_no
       WHERE e.emp_no = ?`,
      [empId]
    );    

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error fetching profile:', err);
    res.status(500).json({ message: 'Internal error' });
  }
};



const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

exports.updateProfile = async (req, res) => {
  const empId = parseInt(req.query.empId, 10);

  if (!empId || isNaN(empId)) {
    return res.status(400).json({ message: 'Missing or invalid empId' });
  }

  const {
    first_name = null,
    last_name = null,
    birth_date = null,
    gender = null,
    dept_no = null,
    title = null,
    salary = null,
  } = req.body;

  try {
    await startTransaction();

    // ✅ Update employees table
    await db.execute(
      `UPDATE employees
       SET first_name = ?, last_name = ?, gender = ?, birth_date = ?
       WHERE emp_no = ?`,
      [first_name, last_name, gender, formatDate(birth_date), empId]
    );

    // ✅ Update department (only if record exists)
    if (dept_no) {
      const [deptRows] = await db.execute(
        `SELECT 1 FROM dept_emp WHERE emp_no = ? AND to_date = '9999-01-01'`,
        [empId]
      );
      if (deptRows.length > 0) {
        await db.execute(
          `UPDATE dept_emp
           SET dept_no = ?
           WHERE emp_no = ? AND to_date = '9999-01-01'`,
          [dept_no, empId]
        );
      }
    }

    // ✅ Update title (if record exists)
    if (title) {
      const [titleRows] = await db.execute(
        `SELECT 1 FROM titles WHERE emp_no = ? AND to_date = '9999-01-01'`,
        [empId]
      );
      if (titleRows.length > 0) {
        await db.execute(
          `UPDATE titles
           SET title = ?
           WHERE emp_no = ? AND to_date = '9999-01-01'`,
          [title, empId]
        );
      }
    }

    // ✅ Update salary (if record exists)
    if (salary !== null) {
      const [salaryRows] = await db.execute(
        `SELECT 1 FROM salaries WHERE emp_no = ? AND to_date = '9999-01-01'`,
        [empId]
      );
      if (salaryRows.length > 0) {
        await db.execute(
          `UPDATE salaries
           SET salary = ?
           WHERE emp_no = ? AND to_date = '9999-01-01'`,
          [salary, empId]
        );
      }
    }

    await commitTransaction();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    await rollbackTransaction();
    console.error('❌ Error updating profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
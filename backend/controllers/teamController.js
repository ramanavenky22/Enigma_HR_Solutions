const db = require('../config/db');

// GET /team?managerId=110183
exports.getTeamMembers = async (req, res) => {
  const managerId = req.query.managerId;

  if (!managerId) {
    return res.status(400).json({ message: 'Missing managerId' });
  }

  try {const { db } = require('../config/db');

  // GET /team → all team members under logged-in manager
  exports.getTeamMembers = async (req, res) => {
    const managerId = req.user.empId;
  
    if (!managerId) {
      return res.status(400).json({ message: 'Missing managerId from token' });
    }
  
    try {
      const [rows] = await db.execute(
        `SELECT 
           e.emp_no,
           e.first_name,
           e.last_name,
           e.gender,
           e.hire_date,
           t.title,
           s.salary
         FROM dept_manager dm
         JOIN dept_emp de ON de.dept_no = dm.dept_no AND de.to_date = '9999-01-01'
         JOIN employees e ON e.emp_no = de.emp_no
         LEFT JOIN titles t ON t.emp_no = e.emp_no AND t.to_date = '9999-01-01'
         LEFT JOIN salaries s ON s.emp_no = e.emp_no AND s.to_date = '9999-01-01'
         WHERE dm.emp_no = ? AND dm.to_date = '9999-01-01'`,
        [managerId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error('❌ Error fetching team:', err);
      res.status(500).json({ message: 'Internal error' });
    }
  };
  
  // GET /team/search?q=John
  exports.searchTeamMembers = async (req, res) => {
    const managerId = req.user.empId;
    const q = req.query.q || '';
  
    if (!managerId) {
      return res.status(400).json({ message: 'Missing managerId from token' });
    }
  
    try {
      const [rows] = await db.execute(
        `SELECT 
           e.emp_no,
           e.first_name,
           e.last_name,
           e.gender,
           e.hire_date,
           t.title,
           s.salary
         FROM dept_manager dm
         JOIN dept_emp de ON de.dept_no = dm.dept_no AND de.to_date = '9999-01-01'
         JOIN employees e ON e.emp_no = de.emp_no
         LEFT JOIN titles t ON t.emp_no = e.emp_no AND t.to_date = '9999-01-01'
         LEFT JOIN salaries s ON s.emp_no = e.emp_no AND s.to_date = '9999-01-01'
         WHERE dm.emp_no = ? AND dm.to_date = '9999-01-01'
           AND (e.first_name LIKE ? OR e.last_name LIKE ?)`,
        [managerId, `%${q}%`, `%${q}%`]
      );
  
      res.json(rows);
    } catch (err) {
      console.error('❌ Error searching team:', err);
      res.status(500).json({ message: 'Internal error' });
    }
  };
  
  // GET /team/count → count of direct reports
  exports.getTeamCount = async (req, res) => {
    const managerId = req.user.empId;
  
    if (!managerId) {
      return res.status(400).json({ message: 'Missing managerId from token' });
    }
  
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) AS team_size
         FROM (
           SELECT e.emp_no
           FROM dept_manager dm
           JOIN dept_emp de ON de.dept_no = dm.dept_no AND de.to_date = '9999-01-01'
           JOIN employees e ON e.emp_no = de.emp_no
           WHERE dm.emp_no = ? AND dm.to_date = '9999-01-01'
         ) AS team`,
        [managerId]
      );
  
      res.json({ team_size: rows[0].team_size });
    } catch (err) {
      console.error('❌ Error fetching team count:', err);
      res.status(500).json({ message: 'Internal error' });
    }
  };
  
    const [rows] = await db.execute(
        `SELECT 
           e.emp_no,
           e.first_name,
           e.last_name,
           e.gender,
           e.hire_date,
           t.title,
           s.salary
         FROM dept_manager dm
         JOIN dept_emp de ON de.dept_no = dm.dept_no AND de.to_date = '9999-01-01'
         JOIN employees e ON e.emp_no = de.emp_no
         LEFT JOIN titles t ON t.emp_no = e.emp_no AND t.to_date = '9999-01-01'
         LEFT JOIN salaries s ON s.emp_no = e.emp_no AND s.to_date = '9999-01-01'
         WHERE dm.emp_no = ? AND dm.to_date = '9999-01-01'
           AND (e.first_name LIKE ? OR e.last_name LIKE ?)`,
        [managerId, `%${q}%`, `%${q}%`]
      );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ message: 'Internal error' });
  }
};

// GET /team/search?managerId=110183&q=John
exports.searchTeamMembers = async (req, res) => {
    const managerId = req.query.managerId;
    const q = req.query.q || '';
  
    if (!managerId) {
      return res.status(400).json({ message: 'Missing managerId' });
    }
  
    try {
      const [rows] = await db.execute(
        `SELECT 
           e.emp_no,
           e.first_name,
           e.last_name,
           e.gender,
           e.hire_date
         FROM dept_manager dm
         JOIN dept_emp de ON de.dept_no = dm.dept_no AND de.to_date = '9999-01-01'
         JOIN employees e ON e.emp_no = de.emp_no
         WHERE dm.emp_no = ? AND dm.to_date = '9999-01-01'
           AND (e.first_name LIKE ? OR e.last_name LIKE ?)`,
        [managerId, `%${q}%`, `%${q}%`]
      );
  
      res.json(rows);
    } catch (err) {
      console.error('❌ Error searching team:', err);
      res.status(500).json({ message: 'Internal error' });
    }
  };
  
  

exports.getTeamCount = async (req, res) => {
    const managerId = req.query.managerId;
  
    if (!managerId) {
      return res.status(400).json({ message: 'Missing managerId' });
    }
  
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) AS team_size
         FROM (
           SELECT e.emp_no
           FROM dept_manager dm
           JOIN departments d ON dm.dept_no = d.dept_no
           JOIN dept_emp de ON de.dept_no = dm.dept_no AND de.to_date = '9999-01-01'
           JOIN employees e ON e.emp_no = de.emp_no
           LEFT JOIN titles t ON t.emp_no = e.emp_no AND t.to_date = '9999-01-01'
           LEFT JOIN salaries s ON s.emp_no = e.emp_no AND s.to_date = '9999-01-01'
           WHERE dm.emp_no = ? AND dm.to_date = '9999-01-01'
         ) AS team`,
        [managerId]
      );
  
      res.json({ team_size: rows[0].team_size });
    } catch (err) {
      console.error('❌ Error fetching team count:', err);
      res.status(500).json({ message: 'Internal error' });
    }
  };
  

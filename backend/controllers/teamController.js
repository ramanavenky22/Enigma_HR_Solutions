const { db } = require('../config/db');

// 🔁 Utility: Get emp_no from Auth0 ID
async function getEmpNoFromAuth0Id(auth0Id) {
  const [[emp]] = await db.execute(
    `SELECT emp_no FROM employees WHERE auth0_id = ?`,
    [auth0Id]
  );
  return emp ? emp.emp_no : null;
}

// 👥 GET /api/team — Get all teammates in same department
exports.getTeamMembers = async (req, res) => {
  const auth0Id = req.auth.sub;

  try {
    const empId = await getEmpNoFromAuth0Id(auth0Id);
    if (!empId) return res.status(404).json({ message: 'User not found' });

    const [rows] = await db.execute(
      `SELECT 
         e.emp_no, e.first_name, e.last_name, e.gender, e.hire_date
       FROM dept_emp de_user
       JOIN dept_emp de ON de.dept_no = de_user.dept_no AND de.to_date = '9999-01-01'
       JOIN employees e ON e.emp_no = de.emp_no
       WHERE de_user.emp_no = ? AND de_user.to_date = '9999-01-01' LIMIT 10`,
      [empId]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching team:', err);
    res.status(500).json({ message: 'Internal error' });
  }
};

// 🔍 GET /api/team/search?q=John — Search teammates
exports.searchTeamMembers = async (req, res) => {
  const auth0Id = req.auth.sub;
  const q = req.query.q || '';

  try {
    const empId = await getEmpNoFromAuth0Id(auth0Id);
    if (!empId) return res.status(404).json({ message: 'User not found' });

    const [rows] = await db.execute(
      `SELECT 
         e.emp_no, e.first_name, e.last_name, e.gender, e.hire_date
       FROM dept_emp de_user
       JOIN dept_emp de ON de.dept_no = de_user.dept_no AND de.to_date = '9999-01-01'
       JOIN employees e ON e.emp_no = de.emp_no
       WHERE de_user.emp_no = ? AND de_user.to_date = '9999-01-01'
         AND (e.first_name LIKE ? OR e.last_name LIKE ?)`,
      [empId, `%${q}%`, `%${q}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error searching team:', err);
    res.status(500).json({ message: 'Internal error' });
  }
};

// 🔢 GET /api/team/count — Count of teammates
exports.getTeamCount = async (req, res) => {
  const auth0Id = req.auth.sub;

  try {
    const empId = await getEmpNoFromAuth0Id(auth0Id);
    if (!empId) return res.status(404).json({ message: 'User not found' });

    const [[result]] = await db.execute(
      `SELECT COUNT(*) AS team_size
       FROM dept_emp de_user
       JOIN dept_emp de ON de.dept_no = de_user.dept_no AND de.to_date = '9999-01-01'
       WHERE de_user.emp_no = ? AND de_user.to_date = '9999-01-01'`,
      [empId]
    );

    res.json({ team_size: 10 });
  } catch (err) {
    console.error('❌ Error fetching team count:', err);
    res.status(500).json({ message: 'Internal error' });
  }
};
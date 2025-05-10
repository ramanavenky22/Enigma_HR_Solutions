const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { auth } = require('express-oauth2-jwt-bearer');

// Auth0 middleware configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
});

// Get team members by manager ID
router.get('/api/team', checkJwt, async (req, res) => {
  try {
    const { managerId } = req.query;
    if (!managerId) {
      return res.status(400).json({ error: 'Manager ID is required' });
    }

    const query = `
      SELECT e.emp_no, e.first_name, e.last_name, t.title, d.dept_name as department_name
      FROM employees e
      INNER JOIN dept_emp de ON e.emp_no = de.emp_no
      INNER JOIN departments d ON de.dept_no = d.dept_no
      INNER JOIN dept_manager dm ON d.dept_no = dm.dept_no
      INNER JOIN titles t ON e.emp_no = t.emp_no
      WHERE dm.emp_no = ?
      AND de.to_date = '9999-01-01'
      AND dm.to_date = '9999-01-01'
      AND t.to_date = '9999-01-01'
    `;

    const [employees] = await db.query(query, [managerId]);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search team members
router.get('/api/team/search', checkJwt, async (req, res) => {
  try {
    const { managerId, q } = req.query;
    if (!managerId) {
      return res.status(400).json({ error: 'Manager ID is required' });
    }

    const searchQuery = `
      SELECT e.emp_no, e.first_name, e.last_name, t.title, d.dept_name as department_name
      FROM employees e
      INNER JOIN dept_emp de ON e.emp_no = de.emp_no
      INNER JOIN departments d ON de.dept_no = d.dept_no
      INNER JOIN dept_manager dm ON d.dept_no = dm.dept_no
      INNER JOIN titles t ON e.emp_no = t.emp_no
      WHERE dm.emp_no = ?
      AND de.to_date = '9999-01-01'
      AND dm.to_date = '9999-01-01'
      AND t.to_date = '9999-01-01'
      AND (
        e.first_name LIKE ? OR
        e.last_name LIKE ? OR
        t.title LIKE ? OR
        d.dept_name LIKE ?
      )
    `;

    const searchTerm = `%${q}%`;
    const [employees] = await db.query(searchQuery, [managerId, searchTerm, searchTerm, searchTerm, searchTerm]);
    res.json(employees);
  } catch (error) {
    console.error('Error searching team members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team size
router.get('/api/team/count', checkJwt, async (req, res) => {
  try {
    const { managerId } = req.query;
    if (!managerId) {
      return res.status(400).json({ error: 'Manager ID is required' });
    }

    const query = `
      SELECT COUNT(*) as count
      FROM employees e
      INNER JOIN dept_emp de ON e.emp_no = de.emp_no
      INNER JOIN departments d ON de.dept_no = d.dept_no
      INNER JOIN dept_manager dm ON d.dept_no = dm.dept_no
      WHERE dm.emp_no = ?
      AND de.to_date = '9999-01-01'
      AND dm.to_date = '9999-01-01'
    `;

    const [result] = await db.query(query, [managerId]);
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error getting team size:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

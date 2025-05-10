const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
require('dotenv').config();

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

const { query } = require('../config/db'); // Import your database query function

const syncUser = async (req, res, next) => {
  try {
    const sub = req.auth?.sub;
    const fullName = req.auth['https://hr-portal.com/name'];

    if (!sub || !fullName) {
      return res.status(400).json({ error: 'Missing user information from Auth0 token' });
    }

    // Split name into first and last
    const [first_name, ...rest] = fullName.trim().split(' ');
    const last_name = rest.join(' ') || '';

    // Check if the user already exists in the employees table
    const [existingUser] = await query('SELECT emp_no FROM employees WHERE auth0_id = ?', [sub]);

    if (!existingUser || existingUser.length === 0) {
      // Insert the user into the employees table
      const insertQuery = `
        INSERT INTO employees (auth0_id, first_name, last_name, hire_date)
        VALUES (?, ?, ?, CURDATE())
      `;
      await query(insertQuery, [sub, first_name, last_name]);
      console.log(`🆕 User ${first_name} ${last_name} added to the database.`);
    }

    next(); // Proceed to next route
  } catch (err) {
    console.error('❌ Error syncing user:', err);
    res.status(500).json({ error: 'Error syncing user', details: err.message });
  }
};

const checkRole = (roles) => (req, res, next) => {
  try {
    const userRoles = req.auth['https://hr-portal.com/roles'] || [];
    if (roles.some((role) => userRoles.includes(role))) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  } catch (err) {
    console.error('Error checking role:', err);
    res.status(500).json({ error: 'Error checking permissions' });
  }
};

module.exports = { checkJwt, checkRole, syncUser };

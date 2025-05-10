const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { query } = require('../config/db');
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

const checkRole = (requiredRoles) => async (req, res, next) => {
  try {
    console.log('Checking roles for request:', {
      method: req.method,
      path: req.path,
      id: req.params.id,
      auth: req.auth
    });

    // Convert requiredRoles to array if it's a string
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const userRoles = req.auth?.['https://hr-portal.com/roles'] || [];
    
    console.log('User roles:', userRoles);
    console.log('Required roles:', roles);

    // Allow users to update their own profile
    if (req.method === 'PUT' && req.params.id) {
      const sub = req.auth?.sub;
      if (sub) {
        try {
          // Check if the user is updating their own profile
          console.log('Checking auth0_id:', sub);
          const users = await query('SELECT emp_no FROM employees WHERE auth0_id = ?', [sub]);
          console.log('Found users:', users);
          const user = users[0];
          
          // Allow if it's their own profile or if they have the required role
          if (user && user.emp_no.toString() === req.params.id) {
            return next();
          }
          if (roles.some(role => userRoles.includes(role))) {
            return next();
          }
          return res.status(403).json({ error: 'Insufficient permissions' });
        } catch (err) {
          console.error('Error checking user:', err);
          return res.status(500).json({ error: 'Error checking permissions' });
        }
      }
    }

    // For non-PUT requests, just check roles
    if (roles.some(role => userRoles.includes(role))) {
      return next();
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  } catch (err) {
    console.error('Error checking role:', err);
    return res.status(500).json({ error: 'Error checking permissions' });
  }
};

module.exports = { checkJwt, checkRole, syncUser };

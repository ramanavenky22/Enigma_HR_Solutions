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

const checkRole = (role) => (req, res, next) => {
  try {
    const roles = req.auth['https://hr-portal.com/roles'] || [];
    if (roles.includes(role)) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  } catch (err) {
    console.error('Error checking role:', err);
    res.status(500).json({ error: 'Error checking permissions' });
  }
};

module.exports = { checkJwt, checkRole };

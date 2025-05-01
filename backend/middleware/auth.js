const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

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
  const roles = req.auth['https://hr-portal.com/roles'] || [];
  if (roles.includes(role)) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
};

module.exports = { checkJwt, checkRole };

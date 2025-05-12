// Middleware to check if user has required role
exports.checkRole = (requiredRole) => {
  return (req, res, next) => {
    const userRoles = req.auth?.['https://hr-portal.com/roles'] || [];
    
    if (!userRoles.some(role => role.toLowerCase() === requiredRole.toLowerCase())) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${requiredRole}` 
      });
    }
    
    next();
  };
};

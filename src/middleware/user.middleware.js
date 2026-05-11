const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const { logger } = require('../config/logger');

// Protect routes (Check if user is logged in)
exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logger.warn('Unauthorized access attempt without token');
    return error(res, 'Not authorized to access this route', 401);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Unauthorized access attempt with invalid token', { error: err.message });
    return error(res, 'Not authorized, token failed', 401);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn('Forbidden access attempt', { requiredRoles: roles, userRole: req.user?.role });
      return error(res, `User role ${req.user?.role || 'unknown'} is not authorized to access this route`, 403);
    }
    next();
  };
};
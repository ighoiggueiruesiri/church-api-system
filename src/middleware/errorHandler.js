const { logger } = require('../config/logger');
const { error } = require('../utils/response');
const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = 'Internal server error';
  let errors = null;

  logger.error('API Error', {
    message: err.message,
    stack: err.stack,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: req.body ? JSON.stringify(req.body).slice(0, 500) : null,
    params: req.params,
    query: req.query,
    rawError: err   
  });

  // 1. Zod Validation Errors 
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed. Please check the highlighted fields.';

    const issues = err.issues || err.errors || [];  

    errors = issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
      code: issue.code,
      
      ...(issue.keys && { invalidFields: issue.keys }),
      ...(issue.expected && { expected: issue.expected }),
      ...(issue.received && { received: issue.received }),
      ...(issue.minimum !== undefined && { minimum: issue.minimum }),
      ...(issue.maximum !== undefined && { maximum: issue.maximum })
    }));
  }

  // 2. Mongoose Validation Errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));
  }

  // 3. Duplicate key
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    errors = [{ field, message: `${field} already exists` }];
  }

  // 4. Invalid ObjectId
  else if (err.name === 'CastError' || err.message.includes('Cast to ObjectId')) {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // 5. Not Found
  else if (statusCode === 404 || err.message?.toLowerCase().includes('not found')) {
    statusCode = 404;
    message = err.message || 'Resource not found';
  }

  // 6. Any other error
  else if (err.message) {
    message = err.message;
  }

  // Always send clean JSON to frontend
  error(res, message, statusCode, errors);
};

module.exports = errorHandler;
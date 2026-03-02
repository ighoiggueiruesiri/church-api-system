const mongoose = require('mongoose');
const { error } = require('../utils/response');

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return error(res, "Invalid ID format", 400);
  }
  next();
};

module.exports = validateObjectId;
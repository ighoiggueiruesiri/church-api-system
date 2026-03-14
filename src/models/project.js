const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true, maxlength: 500, unique: true },
  desc:      { type: String, required: true, trim: true, maxlength: 2000 },
  image:     { type: String, trim: true },
  link:      { type: String, trim: true, maxlength: 1000 },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

projectSchema.index({ deletedAt: 1 });

projectSchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('Project', projectSchema);

const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  link: { type: String, trim: true },
  info: { type: String, trim: true, maxlength: 500 },
  type: { type: String, enum: ['primary', 'secondary', 'info'], required: true }
});

const ministrySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 500, unique: true },
  desc: { type: String, required: true, trim: true, maxlength: 500 },
  headName: { type: String, trim: true, maxlength: 500 },
  headImage: { type: String, trim: true },
  headTitle: { type: String, trim: true },
  icon: { type: String, trim: true },
  color: { type: String, trim: true },
  bg: { type: String, trim: true },
  border: { type: String, trim: true },
  fullDesc: { type: String, trim: true, maxlength: 2000 },
  actions: [actionSchema],
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ministrySchema.index({ deletedAt: 1 });

// Soft delete helper
ministrySchema.statics.findActive = function() {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('Ministry', ministrySchema);
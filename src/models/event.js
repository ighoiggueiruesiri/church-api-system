const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 500, unique: true },
  location: { type: String, required: true, trim: true },
  image: { type: String, trim: true },
  date: { type: String, trim: true },
  time: { type: String, trim: true },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
eventSchema.index({ deletedAt: 1 });

// Soft delete helper
eventSchema.statics.findActive = function() {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('Event', eventSchema);
const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 500, unique: true },
  pastor: { type: String, required: true, trim: true, maxlength: 500 },
  date: { type: String, trim: true, maxlength: 500 },
  thumbnail: { type: String, trim: true },
  videoId: { type: String, trim: true },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
sermonSchema.index({ deletedAt: 1 });

// Soft delete helper
sermonSchema.statics.findActive = function() {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('Sermon', sermonSchema);
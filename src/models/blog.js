const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 500, unique: true },
  date:        { type: String, trim: true, maxlength: 100 },
  excerpt:     { type: String, trim: true, maxlength: 500 },
  image:       { type: String, trim: true },
  fullContent: { type: String, trim: true },
  deletedAt:   { type: Date, default: null }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

blogSchema.index({ deletedAt: 1 });

blogSchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('Blog', blogSchema);

const mongoose = require('mongoose');

const testimonySchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, maxlength: 200 },
  role:      { type: String, trim: true, maxlength: 300 },
  text:      { type: String, required: true, trim: true, maxlength: 2000 },
  avatar:    { type: String, trim: true },          // initials string OR uploaded image URL
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

testimonySchema.index({ deletedAt: 1 });

testimonySchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('Testimony', testimonySchema);

const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, maxlength: 200 },
  email:     { type: String, required: true, trim: true, maxlength: 300 },
  message:   { type: String, required: true, trim: true, maxlength: 3000 },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

contactMessageSchema.index({ deletedAt: 1 });
contactMessageSchema.index({ email: 1 });

contactMessageSchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('ContactMessage', contactMessageSchema);

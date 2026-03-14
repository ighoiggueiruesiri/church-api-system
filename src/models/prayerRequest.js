const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, maxlength: 200 },
  email:     { type: String, required: true, trim: true, maxlength: 300 },
  request:   { type: String, required: true, trim: true, maxlength: 3000 },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

prayerRequestSchema.index({ deletedAt: 1 });
prayerRequestSchema.index({ email: 1 });

prayerRequestSchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);

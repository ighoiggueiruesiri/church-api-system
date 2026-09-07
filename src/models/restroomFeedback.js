const mongoose = require('mongoose');

const ISSUE_TYPES = ['cleanliness', 'supplies', 'plumbing', 'odor', 'other'];

const restroomFeedbackSchema = new mongoose.Schema({
  location:  { type: String, required: true, trim: true, maxlength: 150 }, // e.g. "Men's Restroom - Ground Floor"
  rating:    { type: Number, required: true, min: 1, max: 5 },
  issues:    [{ type: String, enum: ISSUE_TYPES }],
  comments:  { type: String, trim: true, maxlength: 1000, default: '' },
  name:      { type: String, trim: true, maxlength: 200, default: '' },
  email:     { type: String, trim: true, maxlength: 300, default: '' },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

restroomFeedbackSchema.index({ deletedAt: 1 });
restroomFeedbackSchema.index({ location: 1 });
restroomFeedbackSchema.index({ rating: 1 });

restroomFeedbackSchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

restroomFeedbackSchema.statics.ISSUE_TYPES = ISSUE_TYPES;

module.exports = mongoose.model('RestroomFeedback', restroomFeedbackSchema);
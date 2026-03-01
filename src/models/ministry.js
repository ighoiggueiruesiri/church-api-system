const mongoose = require('mongoose');

const ministrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  headName: String,
  headImage: String,
  icon: String,
  color: String,
  bg: String,
  border: String,
  fullDesc: String,
  actions: [{
    label: { type: String, required: true },
    link: String,
    info: String,
    type: { type: String, enum: ['primary', 'secondary', 'info'], required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Ministry', ministrySchema);
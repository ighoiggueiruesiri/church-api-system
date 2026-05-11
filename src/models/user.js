const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false }, // Hidden by default
  role: { type: String, enum: ['user', 'editor', 'admin'], default: 'user' },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true 
});

// Pre-save hook to hash password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Only return non-deleted users
userSchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('User', userSchema);
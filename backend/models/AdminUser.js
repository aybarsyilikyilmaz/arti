const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Minimum back-office: işletme onayı ve iade yönetimi (PLAN.md §2)
const adminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 12,
    select: false
  },
  role: {
    type: String,
    enum: ['superadmin', 'operator'],
    default: 'operator'
  },
  refreshTokenHash: {
    type: String,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

adminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminUserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);

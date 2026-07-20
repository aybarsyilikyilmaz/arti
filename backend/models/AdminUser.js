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
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['superadmin', 'operator'],
    default: 'operator'
  },
  sessions: {
    type: [{
      refreshTokenHash: { type: String, required: true },
      deviceId: { type: String, required: true },
      deviceInfo: { type: String },
      ip: { type: String },
      createdAt: { type: Date, default: Date.now },
      lastActiveAt: { type: Date, default: Date.now }
    }],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Refresh akışı sessions.refreshTokenHash ile arar — index olmadan COLLSCAN
adminUserSchema.index({ 'sessions.refreshTokenHash': 1 });

adminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminUserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);

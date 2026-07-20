const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim zorunludur.'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta adresi zorunludur.'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Lütfen geçerli bir e-posta adresi girin.']
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur.'],
    minlength: 8,
    select: false
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }],
  // Aktif oturumlar listesi
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
  kvkkConsentAt: {
    type: Date
  },
  // Moderasyon: doluysa hesap engellidir, giriş yapamaz (admin paneli)
  bannedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Refresh akışı sessions.refreshTokenHash ile arar — index olmadan COLLSCAN
userSchema.index({ 'sessions.refreshTokenHash': 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);

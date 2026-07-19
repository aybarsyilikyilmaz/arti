const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  allowedBranches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }],
  name: {
    type: String,
    required: [true, 'Çalışan adı zorunludur.'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta adresi zorunludur.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Lütfen geçerli bir e-posta adresi girin.']
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur.'],
    minlength: 6,
    select: false
  },
  allowedPages: [{
    type: String
  }],
  // Refresh token hash'i
  refreshTokenHash: { type: String, select: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employeeSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// API cevaplarında güvenli veri
employeeSchema.methods.toSafeJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokenHash;
  return obj;
};

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;

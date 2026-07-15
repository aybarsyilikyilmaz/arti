const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İşletme adı zorunludur.'],
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
    required: [true, 'Telefon numarası zorunludur.']
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur.'],
    minlength: 8,
    select: false
  },
  address: {
    type: String,
    required: [true, 'Adres zorunludur.']
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number]
  },
  businessType: {
    type: String,
    enum: ['restoran', 'firin', 'market', 'diger'],
    required: [true, 'İşletme tipi zorunludur.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

businessSchema.index({ location: '2dsphere' });

businessSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

businessSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Business = mongoose.model('Business', businessSchema);
module.exports = Business;

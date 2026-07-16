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
    enum: ['restoran', 'firin', 'market', 'kafe', 'manav', 'kasap', 'otel', 'diger'],
    required: [true, 'İşletme tipi zorunludur.']
  },
  branchType: {
    type: String,
    enum: ['tek', 'zincir'],
    default: 'tek'
  },
  // Yasal ve finansal bilgiler
  legalName: { type: String, trim: true },
  taxOffice: { type: String, trim: true },
  taxNumber: { type: String, trim: true },
  mersisNumber: { type: String, trim: true },
  // Konum detayı
  city: { type: String, trim: true },
  district: { type: String, trim: true },
  neighborhood: { type: String, trim: true },
  // Yetkili kişi
  contactName: { type: String, trim: true },
  contactRole: {
    type: String,
    enum: ['sahibi', 'mudur', 'operasyon', 'diger'],
    default: 'sahibi'
  },
  contactPhone: { type: String, trim: true },
  // Operasyonel / sürpriz kutu ayarları
  dailyBoxCount: {
    type: String,
    enum: ['1-2', '3-5', '6-10', '10+'],
    default: '1-2'
  },
  boxContents: [{
    type: String,
    enum: ['unlu', 'sicak', 'meze', 'manav', 'karisik', 'vegan']
  }],
  pickupStart: { type: String, trim: true },
  pickupEnd: { type: String, trim: true },
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

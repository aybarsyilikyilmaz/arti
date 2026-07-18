const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encryptField, decryptField } = require('../utils/crypto');

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
  // GeoJSON konum — yalnızca koordinat verildiğinde oluşur;
  // default'lar kaldırıldı çünkü koordinatsız {type:'Point'} 2dsphere indeksini patlatır
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
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
  // İşletmeler admin onayından geçmeden kutu yayınlayamaz (PLAN.md §2)
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'SUSPENDED'],
    default: 'PENDING_APPROVAL',
    index: true
  },
  // Rotasyonlu refresh token hash'i (PLAN.md §5)
  refreshTokenHash: { type: String, select: false },
  // KVKK açık rıza zamanı (PLAN.md §7)
  kvkkConsentAt: { type: Date },
  // Yasal ve finansal bilgiler
  legalName: { type: String, trim: true },
  taxOffice: { type: String, trim: true },
  // KVKK: VKN/TCKN at-rest AES-256-GCM şifreli tutulur; loglanmaz
  taxNumber: { type: String, trim: true, set: encryptField },
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
  // Desk360 WhatsApp otomasyonu (PLAN.md §3.4) — admin panelden eşlenir
  desk360ChatId: { type: String, trim: true, index: true, sparse: true },
  whatsappPhone: { type: String, trim: true },
  // Cevapsız-işletme fallback yayını için varsayılanlar; fiyatlar tanımlı
  // değilse otomatik yayın yapılmaz, mesaj admin onayına düşer
  defaultPackageCount: { type: Number, min: 0 },
  defaultPrice: { type: Number, min: 1 },
  defaultOriginalPrice: { type: Number, min: 1 },
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

// Şifreli vergi numarasını yalnızca ihtiyaç anında çözer (admin doğrulama ekranı)
businessSchema.methods.getTaxNumber = function() {
  return decryptField(this.taxNumber);
};

// API cevaplarında hassas alanlar asla dışarı çıkmaz
businessSchema.methods.toSafeJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokenHash;
  delete obj.taxNumber;
  return obj;
};

const Business = mongoose.model('Business', businessSchema);
module.exports = Business;

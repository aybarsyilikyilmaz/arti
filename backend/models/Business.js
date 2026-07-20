const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encryptField, decryptField } = require('../utils/crypto');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İşletme adı zorunludur.'],
    trim: true
  },
  branchName: {
    type: String,
    trim: true,
    default: ''
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
  // Yapısal konum — keşfette il/ilçe filtresi bunları kullanır (adres serbest metin)
  city: { type: String, trim: true, index: true },
  district: { type: String, trim: true, index: true },
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
  parentBusinessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    default: null,
    index: true
  },
  // İşletmeler admin onayından geçmeden kutu yayınlayamaz (PLAN.md §2)
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'SUSPENDED'],
    default: 'PENDING_APPROVAL',
    index: true
  },
  // Rotasyonlu refresh token hash'i (PLAN.md §5)
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
  },  // KVKK açık rıza zamanı (PLAN.md §7)
  kvkkConsentAt: { type: Date },
  // Yasal ve finansal bilgiler
  legalName: { type: String, trim: true },
  taxOffice: { type: String, trim: true },
  // KVKK: VKN/TCKN at-rest AES-256-GCM şifreli tutulur; loglanmaz
  taxNumber: { type: String, trim: true, set: encryptField },
  mersisNumber: { type: String, trim: true },
  
  // Otomatik mesaj için son sorulma tarihi (YYYY-MM-DD)
  lastPromptDate: { type: String },
  
  // Finans ve Ödemeler
  iban: { type: String, trim: true },
  ibanOwner: { type: String, trim: true },
  payoutPeriod: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  // Platform komisyonu (%) — işletme bazında admin panelden değiştirilebilir
  commissionRate: { type: Number, min: 0, max: 50, default: 10 },
  // Konum detayı
  mapsUrl: { type: String, trim: true },
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
  // Görseller — depolama adaptöründen dönen publicUrl (lokal disk veya S3/CDN)
  logoUrl: { type: String, trim: true, maxlength: 500 },
  coverUrl: { type: String, trim: true, maxlength: 500 },
  detailUrl: { type: String, trim: true, maxlength: 500 },
  // Vitrin: müşteri uygulamasında görünen tanıtım metni
  description: { type: String, trim: true, maxlength: 500 },
  // Operasyonel / sürpriz kutu ayarları
  dailyBoxCount: {
    type: String,
    enum: ['1-2', '3-5', '6-10', '10+'],
    default: '1-2'
  },
  boxContents: [{
    type: String,
    enum: ['unlu', 'sicak', 'meze', 'manav', 'karisik', 'vegan', 'tatli', 'sandvic', 'sarkuteri', 'et', 'glutensiz', 'fastfood', 'donut', 'ekler', 'sushi']
  }],
  pickupStart: { type: String, trim: true },
  pickupEnd: { type: String, trim: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Admin onayına gidecek geçici profil güncellemeleri
  pendingUpdates: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

businessSchema.index({ location: '2dsphere' });
// Refresh akışı her ~15 dk sessions.refreshTokenHash ile arar — index olmadan COLLSCAN
businessSchema.index({ 'sessions.refreshTokenHash': 1 });

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
  delete obj.sessions;
  delete obj.taxNumber;
  return obj;
};

const Business = mongoose.model('Business', businessSchema);
module.exports = Business;

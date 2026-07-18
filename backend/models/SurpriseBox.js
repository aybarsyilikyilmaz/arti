const mongoose = require('mongoose');

// Günlük sürpriz kutu envanteri. Konum ve işletme adı, geo sorgusunun tek
// koleksiyonda çalışması için işletmeden anlık kopyalanır (denormalizasyon).
const surpriseBoxSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  // Europe/Istanbul günü, "YYYY-MM-DD"
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  price: {
    type: Number,
    required: true,
    min: 1
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 1
  },
  contents: [{
    type: String,
    enum: ['unlu', 'sicak', 'meze', 'manav', 'karisik', 'vegan']
  }],
  pickupStart: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  pickupEnd: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },

  initialStock: { type: Number, required: true, min: 0 },
  extraStock: { type: Number, default: 0, min: 0 }, // Desk360'tan (Faz 2)
  // Tek gerçek kaynak: rezervasyon/iade yalnızca atomik $inc ile değişir
  remaining: { type: Number, required: true, min: 0 },

  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number], default: undefined }
  },

  createdAt: { type: Date, default: Date.now }
});

surpriseBoxSchema.index({ business: 1, date: 1 }, { unique: true });
surpriseBoxSchema.index({ date: 1, remaining: 1 });
surpriseBoxSchema.index({ location: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('SurpriseBox', surpriseBoxSchema);

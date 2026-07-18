const mongoose = require('mongoose');

// Sipariş durum makinesi (PLAN.md §2):
// RESERVED ─ödeme ok─▶ PAID ─QR─▶ PICKED_UP
//    │ süre doldu                  │ iade
//    ▼                             ▼
// EXPIRED (stok geri salınır)   REFUNDED
const ORDER_STATUSES = ['RESERVED', 'PAID', 'PICKED_UP', 'EXPIRED', 'REFUNDED'];

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  box: { type: mongoose.Schema.Types.ObjectId, ref: 'SurpriseBox', required: true },

  amount: { type: Number, required: true, min: 0 },

  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'RESERVED',
    index: true
  },

  // Ödeme sağlayıcı referansı + çift-callback koruması
  paymentRef: { type: String, index: true },
  idempotencyKey: { type: String, unique: true, sparse: true },

  // Tek kullanımlık, HMAC imzalı teslim kodu (yalnızca PAID sonrası üretilir)
  qrToken: { type: String, unique: true, sparse: true },
  usedAt: { type: Date },

  reservedAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
  refundedAt: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

// Süresi dolan rezervasyonların taranması için
orderSchema.index({ status: 1, reservedAt: 1 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;

const mongoose = require('mongoose');

// Müşteri değerlendirmesi — teslim alınan siparişlere 1 kez puanlama (PLAN.md §2).
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 500, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// order alanındaki unique:true zaten indeks oluşturur — burada tekrarlanmaz
reviewSchema.index({ business: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

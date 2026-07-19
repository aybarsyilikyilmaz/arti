const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  
  totalOrders: { type: Number, required: true, min: 0 },
  netAmount: { type: Number, required: true, min: 0 },
  
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED'],
    default: 'PENDING',
    index: true
  },
  
  ibanUsed: { type: String, trim: true },
  ibanOwnerUsed: { type: String, trim: true },

  // Banka dekont / havale referansı — PAID işaretlenirken admin girer
  reference: { type: String, trim: true, maxlength: 120 },
  
  payoutDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payout', payoutSchema);

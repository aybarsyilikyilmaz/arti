const mongoose = require('mongoose');

// Günlük WhatsApp otomasyon kaydı — {business, date} unique indeksi sayesinde
// aynı işletmeye aynı gün ikinci mesaj gitmesi imkânsızdır (restart dahil).
const OUTREACH_STATUSES = ['SENT', 'REPLIED', 'PENDING_REVIEW', 'FALLBACK_PUBLISHED'];

const outreachLogSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },

  status: { type: String, enum: OUTREACH_STATUSES, default: 'SENT', index: true },

  sentAt: { type: Date },
  repliedAt: { type: Date },
  replyText: { type: String, maxlength: 1000 },
  parsedCount: { type: Number, min: 0 },

  createdAt: { type: Date, default: Date.now }
});

outreachLogSchema.index({ business: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('OutreachLog', outreachLogSchema);
module.exports.OUTREACH_STATUSES = OUTREACH_STATUSES;

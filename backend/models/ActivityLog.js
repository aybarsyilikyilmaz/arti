// İşletme aktivite/değişiklik logu — admin panelinden görünür (onay akışı DEĞİL,
// sadece izleme). İşletme profil/ayar/kutu/IBAN/vitrin değiştirdiğinde kayıt düşer.
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  businessName: { type: String, trim: true },
  // Değişikliği kim yaptı: işletme sahibi mi, bir çalışan mı
  actorType: { type: String, enum: ['owner', 'employee'], default: 'owner' },
  actorId: { type: mongoose.Schema.Types.ObjectId },
  actorName: { type: String, trim: true },
  // Kısa makine anahtarı (profile.update, box.upsert, iban.update, images.update ...)
  action: { type: String, required: true },
  // Admin panelde gösterilecek insan-okur mesaj (Türkçe)
  message: { type: String, required: true, maxlength: 500 },
  // Opsiyonel detay (değişen alanlar, eski→yeni vb.)
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ business: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

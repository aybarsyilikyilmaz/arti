// Uygulama içi bildirim (PLAN.md Faz 4) — şimdilik tek tür: favori işletme
// bugünün kutusunu yayınladığında. Push (FCM) eklendiğinde aynı kayıtlar
// gönderim kuyruğu olarak kullanılır.
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BOX_PUBLISHED'], required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  box: { type: mongoose.Schema.Types.ObjectId, ref: 'SurpriseBox' },
  title: { type: String, required: true, maxlength: 120 },
  body: { type: String, required: true, maxlength: 300 },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Kullanıcının bildirim akışı + okunmamış sayacı bu indeksten döner
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

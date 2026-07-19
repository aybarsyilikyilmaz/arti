// Uygulama içi bildirim — Müşteri ve İşletmeleri kapsayacak şekilde genişletildi.
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // targetType bildirimin kime gönderildiğini belirler (User veya Business)
  targetType: { type: String, enum: ['USER', 'BUSINESS'], required: true },
  
  // Polymorphic referanslar:
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  
  // İlişkili opsiyonel kaynaklar (sipariş, kutu vb.)
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  box: { type: mongoose.Schema.Types.ObjectId, ref: 'SurpriseBox' },
  
  type: { 
    type: String, 
    enum: ['BOX_PUBLISHED', 'NEW_ORDER', 'ADMIN_MESSAGE', 'SYSTEM_ALERT'], 
    required: true 
  },
  
  title: { type: String, required: true, maxlength: 120 },
  body: { type: String, required: true, maxlength: 500 },
  
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// İlgili hedefin (User veya Business) okunmamış bildirimlerini hızlıca çekmek için indeks
notificationSchema.index({ targetType: 1, user: 1, business: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

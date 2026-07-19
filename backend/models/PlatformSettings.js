const mongoose = require('mongoose');

// Singleton — her zaman tek belge. _id: 'global' ile upsert yapılır.
const platformSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  markupRate: { type: Number, default: 10, min: 0, max: 100 }, // platform markup %
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);

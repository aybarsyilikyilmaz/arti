const PlatformSettings = require('../models/PlatformSettings');

// Cache — DB'yi her kutu oluşturmada sorgulamaktan kaçın (60s TTL)
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 60_000;

const _load = async () => {
  let s = await PlatformSettings.findById('global');
  if (!s) s = await PlatformSettings.create({ _id: 'global', markupRate: 10 });
  return s;
};

/** Platform markup oranını döndürür (cache'li) */
exports.getMarkupRate = async () => {
  if (_cache !== null && Date.now() - _cacheAt < CACHE_TTL) return _cache;
  const s = await _load();
  _cache = s.markupRate;
  _cacheAt = Date.now();
  return _cache;
};

/** Ayarları GET /admin/settings */
exports.getSettings = async (req, res, next) => {
  try {
    const s = await _load();
    res.json({ status: 'success', data: { markupRate: s.markupRate } });
  } catch (err) { next(err); }
};

/** Ayarları PATCH /admin/settings */
exports.updateSettings = async (req, res, next) => {
  try {
    const { markupRate } = req.body;
    if (markupRate === undefined || typeof markupRate !== 'number' || markupRate < 0 || markupRate > 100) {
      return res.status(400).json({ status: 'fail', message: 'markupRate 0-100 arasında olmalı.' });
    }
    const s = await PlatformSettings.findByIdAndUpdate(
      'global',
      { markupRate, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    // Cache'i hemen güncelle
    _cache = s.markupRate;
    _cacheAt = Date.now();
    res.json({ status: 'success', data: { markupRate: s.markupRate } });
  } catch (err) { next(err); }
};

// Görsel yükleme akışı (PLAN.md §1 — S3 presigned upload):
//   1. İşletme POST /business/uploads/presign → { uploadUrl, publicUrl }
//   2. İstemci dosyayı uploadUrl'e PUT eder (lokalde bize, üretimde doğrudan S3'e)
//   3. İşletme PATCH /business/profile/images ile publicUrl'i profiline yazar
// Sunucu hiçbir zaman dosyayı proxy'lemez; API yükü sabit kalır.
const crypto = require('crypto');
const Business = require('../models/Business');
const storage = require('../services/storage');

const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

exports.presign = async (req, res, next) => {
  try {
    const { kind, contentType } = req.body;
    const key = `business/${req.auth.id}/${kind}-${crypto.randomBytes(8).toString('hex')}.${EXT_BY_TYPE[contentType]}`;
    const grant = await storage.presignUpload({ key, contentType });
    res.status(200).json({ status: 'success', data: grant });
  } catch (err) {
    next(err);
  }
};

// Yalnızca STORAGE_PROVIDER=local iken kullanılan PUT ucu (S3 simülasyonu)
exports.putLocal = async (req, res, next) => {
  try {
    const contentType = String(req.query.ct || '');
    // S3 davranışıyla aynı: imzalanan Content-Type ile gönderilen eşleşmek zorunda
    if ((req.headers['content-type'] || '') !== contentType) {
      return res.status(403).json({ status: 'fail', message: 'Content-Type imzalananla eşleşmiyor.' });
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Dosya gövdesi boş.' });
    }
    const result = await storage.saveUpload({
      key: req.params[0],
      contentType,
      exp: req.query.exp,
      sig: req.query.sig,
      body: req.body,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

exports.setImages = async (req, res, next) => {
  try {
    const { logoUrl, coverUrl } = req.body;
    // Keyfi dış URL profil görseli yapılamaz — yalnızca kendi depomuz
    for (const url of [logoUrl, coverUrl].filter(Boolean)) {
      if (!storage.ownsPublicUrl(url)) {
        return res.status(400).json({ status: 'fail', message: 'Görsel URL\'i depolama alanımıza ait değil.' });
      }
    }
    const update = {};
    if (logoUrl) update.logoUrl = logoUrl;
    if (coverUrl) update.coverUrl = coverUrl;
    const business = await Business.findByIdAndUpdate(req.auth.id, update, { new: true });
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    res.status(200).json({ status: 'success', data: { business: business.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

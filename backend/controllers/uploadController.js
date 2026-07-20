// Görsel yükleme akışı (PLAN.md §1 — S3 presigned upload):
//   1. İşletme POST /business/uploads/presign → { uploadUrl, publicUrl }
//   2. İstemci dosyayı uploadUrl'e PUT eder (lokalde bize, üretimde doğrudan S3'e)
//   3. İşletme PATCH /business/profile/images ile publicUrl'i profiline yazar
// Sunucu hiçbir zaman dosyayı proxy'lemez; API yükü sabit kalır.
const crypto = require('crypto');
const Business = require('../models/Business');
const storage = require('../services/storage');

const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Ortak imzalama — dosya anahtarı her zaman hedef işletmenin klasörüne yazılır
const presignFor = (businessId, { kind, contentType }) => {
  const key = `business/${businessId}/${kind}-${crypto.randomBytes(8).toString('hex')}.${EXT_BY_TYPE[contentType]}`;
  return storage.presignUpload({ key, contentType });
};

exports.presign = async (req, res, next) => {
  try {
    const grant = await presignFor(req.auth.id, req.body);
    res.status(200).json({ status: 'success', data: grant });
  } catch (err) {
    next(err);
  }
};

// Admin, İşletme Detay → Kutu & Vitrin'den işletme adına görsel yükler
exports.presignForBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id).select('_id');
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    const grant = await presignFor(business._id, req.body);
    res.status(200).json({ status: 'success', data: grant });
  } catch (err) {
    next(err);
  }
};

// Yalnızca STORAGE_PROVIDER=local iken kullanılan PUT ucu (S3 simülasyonu)
exports.putLocal = async (req, res, next) => {
  try {
    const contentType = String(req.query.ct || '').toLowerCase();
    const actualCt = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    
    // S3 davranışıyla aynı: imzalanan Content-Type ile gönderilen eşleşmek zorunda
    if (actualCt !== contentType) {
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

// Ortak görsel yazma — keyfi dış URL profil görseli yapılamaz, yalnızca kendi depomuz
const applyImages = async (businessId, { logoUrl, coverUrl, detailUrl }, res) => {
  for (const url of [logoUrl, coverUrl, detailUrl].filter(Boolean)) {
    if (!storage.ownsPublicUrl(url)) {
      return res.status(400).json({ status: 'fail', message: 'Görsel URL\'i depolama alanımıza ait değil.' });
    }
  }
  const update = {};
  if (logoUrl !== undefined) update.logoUrl = logoUrl;
  if (coverUrl !== undefined) update.coverUrl = coverUrl;
  if (detailUrl !== undefined) update.detailUrl = detailUrl;
  const business = await Business.findByIdAndUpdate(businessId, update, { new: true });
  if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
  return res.status(200).json({ status: 'success', data: { business: business.toSafeJSON() } });
};

exports.setImages = async (req, res, next) => {
  try {
    await applyImages(req.auth.id, req.body, res);
  } catch (err) {
    next(err);
  }
};

exports.setImagesForBusiness = async (req, res, next) => {
  try {
    await applyImages(req.params.id, req.body, res);
  } catch (err) {
    next(err);
  }
};

// Access + refresh token yönetimi (PLAN.md §5)
// - Access: 15 dk JWT, rol claim'li, Authorization: Bearer ile taşınır
// - Refresh: 30 gün, httpOnly cookie, DB'de yalnızca SHA-256 hash'i,
//   her kullanımda rotate edilir; hash uyuşmazlığı = olası çalıntı → oturum iptal
// - Çoklu Oturum (Multi-Session): Her kullanıcının 'sessions' dizisi vardır.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sha256 } = require('../utils/crypto');

const COOKIE_NAMES = { user: 'rt_user', business: 'rt_business', admin: 'rt_admin', employee: 'rt_employee' };
const MAX_SESSIONS = 5; // En fazla 5 aktif oturum
const MAX_DEVICE_INFO = 255; // User-Agent'ı sınırla (kötü niyetli dev header'a karşı)

function signAccessToken(id, role, payloadExtras = {}) {
  return jwt.sign({ sub: String(id), role, ...payloadExtras }, env.jwtSecret, { expiresIn: env.accessTokenTtl });
}

// Cihaz bilgisini güvenli biçimde çıkarır.
// IP: 'trust proxy' ayarlı olduğundan Express'in doğru çözdüğü req.ip kullanılır
// (ham x-forwarded-for istemci tarafından sahte gönderilebilir/virgüllü liste olabilir).
function extractDevice(req, fallback = {}) {
  const rawUa = req && req.headers ? req.headers['user-agent'] : undefined;
  const deviceInfo = String(rawUa || fallback.deviceInfo || 'Bilinmeyen Cihaz').slice(0, MAX_DEVICE_INFO);
  const ip = (req && (req.ip || (req.socket && req.socket.remoteAddress))) || fallback.ip || 'Bilinmeyen IP';
  return { deviceInfo, ip };
}

// Yeni refresh token üretir, hash'ini dokümanın sessions dizisine ekler, ham değeri döner.
// ÖNEMLİ: Atomik $push kullanılır — çünkü login/switch-branch dokümanı 'sessions'
// alanını seçmeden (select:false) yükler; diziyi bellekte yeniden kurmak diğer
// cihazların oturumlarını SİLERDİ. Atomik güncelleme hem bu tuzağı hem de eşzamanlı
// giriş yarışlarını önler. $sort+$slice ile en fazla MAX_SESSIONS oturum tutulur.
async function issueRefreshToken(req, doc) {
  const raw = crypto.randomBytes(48).toString('hex');
  const hashed = sha256(raw);

  const now = new Date();
  const newSession = {
    refreshTokenHash: hashed,
    deviceId: crypto.randomBytes(16).toString('hex'),
    ...extractDevice(req),
    createdAt: now,
    lastActiveAt: now
  };

  await doc.constructor.updateOne(
    { _id: doc._id },
    { $push: { sessions: { $each: [newSession], $sort: { lastActiveAt: -1 }, $slice: MAX_SESSIONS } } }
  );

  return raw;
}

function setRefreshCookie(res, role, rawToken) {
  res.cookie(COOKIE_NAMES[role], rawToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    maxAge: env.refreshTtlDays * 24 * 60 * 60 * 1000,
    path: '/api/v1',
  });
}

function clearRefreshCookie(res, role) {
  res.clearCookie(COOKIE_NAMES[role], { path: '/api/v1' });
}

// Ortak login cevabı: access token + refresh cookie
async function issueSession(req, res, doc, role, payloadExtras = {}) {
  const raw = await issueRefreshToken(req, doc);
  setRefreshCookie(res, role, raw);
  return signAccessToken(doc._id, role, payloadExtras);
}

// Refresh akışı: cookie'deki ham token hash ile karşılaştırılır, eşleşirse rotate.
// Eşleşmezse (eski/çalıntı token) mevcut oturum tamamen iptal edilir.
async function rotateSession(req, res, Model, role) {
  const raw = req.cookies?.[COOKIE_NAMES[role]];
  if (!raw) return null;

  const hashed = sha256(raw);
  
  // İçinde bu hash bulunan dökümanı bul
  const doc = await Model.findOne({ 'sessions.refreshTokenHash': hashed }).select('+sessions');
  if (!doc) {
    clearRefreshCookie(res, role);
    return null;
  }

  // Eski oturumu bul ve sil
  const sessionIndex = doc.sessions.findIndex(s => s.refreshTokenHash === hashed);
  if (sessionIndex === -1) {
    clearRefreshCookie(res, role);
    return null;
  }

  // Eski cihaz bilgilerini al
  const oldSession = doc.sessions[sessionIndex];
  doc.sessions.splice(sessionIndex, 1); // Eski token'ı sil

  // Yeni token üret (rotate)
  const newRaw = crypto.randomBytes(48).toString('hex');
  const newHashed = sha256(newRaw);
  
  const { deviceInfo, ip } = extractDevice(req, oldSession);

  // Aynı cihaz kimliğiyle yeni oturumu kaydet
  doc.sessions.push({
    refreshTokenHash: newHashed,
    deviceId: oldSession.deviceId, // Cihaz ID'si aynı kalır
    deviceInfo,
    ip,
    createdAt: oldSession.createdAt,
    lastActiveAt: new Date()
  });

  await doc.save({ validateBeforeSave: false });
  setRefreshCookie(res, role, newRaw);

  const payloadExtras = {};
  if (role === 'employee' && doc.business) {
    payloadExtras.businessId = String(doc.business);
  }

  const accessToken = signAccessToken(doc._id, role, payloadExtras);
  return { doc, accessToken };
}

// Belirli bir oturumu kapatır (eğer req.cookies'deki token verildiyse onu siler)
async function revokeSession(req, res, Model, role) {
  const raw = req.cookies?.[COOKIE_NAMES[role]];
  if (raw) {
    const hashed = sha256(raw);
    await Model.updateOne(
      { 'sessions.refreshTokenHash': hashed }, 
      { $pull: { sessions: { refreshTokenHash: hashed } } }
    );
  }
  clearRefreshCookie(res, role);
}

module.exports = { signAccessToken, issueSession, rotateSession, revokeSession, clearRefreshCookie, COOKIE_NAMES };

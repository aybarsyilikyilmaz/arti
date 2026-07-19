// Access + refresh token yönetimi (PLAN.md §5)
// - Access: 15 dk JWT, rol claim'li, Authorization: Bearer ile taşınır
// - Refresh: 30 gün, httpOnly cookie, DB'de yalnızca SHA-256 hash'i,
//   her kullanımda rotate edilir; hash uyuşmazlığı = olası çalıntı → oturum iptal
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sha256 } = require('../utils/crypto');

const COOKIE_NAMES = { user: 'rt_user', business: 'rt_business', admin: 'rt_admin', employee: 'rt_employee' };

function signAccessToken(id, role, payloadExtras = {}) {
  return jwt.sign({ sub: String(id), role, ...payloadExtras }, env.jwtSecret, { expiresIn: env.accessTokenTtl });
}

// Yeni refresh token üretir, hash'ini dokümana yazar, ham değeri döner
async function issueRefreshToken(doc) {
  const raw = crypto.randomBytes(48).toString('hex');
  doc.refreshTokenHash = sha256(raw);
  await doc.save({ validateBeforeSave: false });
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
async function issueSession(res, doc, role, payloadExtras = {}) {
  const raw = await issueRefreshToken(doc);
  setRefreshCookie(res, role, raw);
  return signAccessToken(doc._id, role, payloadExtras);
}

// Refresh akışı: cookie'deki ham token hash ile karşılaştırılır, eşleşirse rotate.
// Eşleşmezse (eski/çalıntı token) mevcut oturum tamamen iptal edilir.
async function rotateSession(req, res, Model, role) {
  const raw = req.cookies?.[COOKIE_NAMES[role]];
  if (!raw) return null;

  const doc = await Model.findOne({ refreshTokenHash: sha256(raw) }).select('+refreshTokenHash');
  if (!doc) {
    clearRefreshCookie(res, role);
    return null;
  }

  const payloadExtras = {};
  if (role === 'employee' && doc.business) {
    payloadExtras.businessId = String(doc.business);
  }

  const accessToken = await issueSession(res, doc, role, payloadExtras);
  return { doc, accessToken };
}

async function revokeSession(req, res, Model, role) {
  const raw = req.cookies?.[COOKIE_NAMES[role]];
  if (raw) {
    await Model.updateOne({ refreshTokenHash: sha256(raw) }, { $unset: { refreshTokenHash: 1 } });
  }
  clearRefreshCookie(res, role);
}

module.exports = { signAccessToken, issueSession, rotateSession, revokeSession, clearRefreshCookie };

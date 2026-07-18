// Kurumsal güvenlik kalkanları (PLAN.md §6)
const crypto = require('crypto');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const timeout = require('connect-timeout');
const env = require('../config/env');

// CDN katmanı (PLAN.md Faz 4): PROXY_SHARED_SECRET doluysa /api istekleri
// yalnızca doğru X-Proxy-Secret başlığıyla işlenir — origin'e CDN'i atlayarak
// doğrudan erişim engellenir. Boşken (tek EC2 + Nginx) devre dışıdır.
function proxySecret(req, res, next) {
  if (!env.proxySharedSecret) return next();
  const given = Buffer.from(String(req.get('x-proxy-secret') || ''));
  const expected = Buffer.from(env.proxySharedSecret);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return res.status(403).json({ status: 'fail', message: 'Erişim reddedildi.' });
  }
  next();
}

const MAX_DEPTH = 10;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Prototype pollution anahtarlarını recursive temizler; MAX_DEPTH'ten
// derin katmanları budayarak JSON-bombası tarzı DoS'u engeller.
function stripDangerous(value, depth = 0) {
  if (depth > MAX_DEPTH) return undefined;
  if (Array.isArray(value)) {
    return value
      .map((v) => stripDangerous(v, depth + 1))
      .filter((v) => v !== undefined);
  }
  if (value !== null && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (FORBIDDEN_KEYS.has(key)) continue;
      const v = stripDangerous(value[key], depth + 1);
      if (v !== undefined) clean[key] = v;
    }
    return clean;
  }
  return value;
}

function deepGuard(req, _res, next) {
  if (req.body) req.body = stripDangerous(req.body);
  if (req.params) req.params = stripDangerous(req.params);
  if (req.query) req.query = stripDangerous(req.query);
  next();
}

// Slowloris/asimetrik yük kalkanı: JSON istekleri 15 sn, dosya yükleme 120 sn
function requestTimeout(req, res, next) {
  const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');
  return timeout(isMultipart ? '120s' : '15s')(req, res, next);
}

// connect-timeout isteği işaretledikten sonra zinciri durdurur
function haltOnTimedOut(req, _res, next) {
  if (!req.timedout) next();
}

module.exports = {
  deepGuard,
  requestTimeout,
  haltOnTimedOut,
  mongoSanitize: mongoSanitize(),
  hpp: hpp(),
  proxySecret,
};

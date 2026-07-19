const rateLimit = require('express-rate-limit');
const { slowDown } = require('express-slow-down');
const env = require('../config/env');

const WINDOW = 15 * 60 * 1000; // 15 dakika

// Geliştirmede brute-force limitleri devre dışıdır (test akışını kilitlemesin);
// NODE_ENV=production olduğu anda otomatik devreye girer — yayında elle
// açmayı hatırlamak GEREKMEZ. (DEPLOY.md yayın günü kontrol listesinde de var.)
const skipInDev = () => !env.isProd;

// Genel API limiti — IP başına (dev'de de açık; 300/15dk teste takılmaz)
const globalLimiter = rateLimit({
  windowMs: WINDOW,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.' },
});

// Auth uçları (login/register) — brute-force koruması
const authLimiter = rateLimit({
  windowMs: WINDOW,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { status: 'fail', message: 'Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' },
});

// Auth uçlarında 3. denemeden sonra her cevabı kademeli geciktir
const authSlowDown = slowDown({
  windowMs: WINDOW,
  delayAfter: 3,
  delayMs: (hits) => Math.min(hits * 400, 5000),
  skip: skipInDev,
});

module.exports = { globalLimiter, authLimiter, authSlowDown };

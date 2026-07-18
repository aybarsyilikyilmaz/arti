const rateLimit = require('express-rate-limit');
const { slowDown } = require('express-slow-down');

const WINDOW = 15 * 60 * 1000; // 15 dakika

// Genel API limiti — IP başına
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
  message: { status: 'fail', message: 'Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' },
});

// Auth uçlarında 3. denemeden sonra her cevabı kademeli geciktir
const authSlowDown = slowDown({
  windowMs: WINDOW,
  delayAfter: 3,
  delayMs: (hits) => Math.min(hits * 400, 5000),
});

module.exports = { globalLimiter, authLimiter, authSlowDown };

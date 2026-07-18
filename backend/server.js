// Env doğrulaması her şeyden önce çalışır (fail-fast) — eksik secret'la süreç başlamaz.
const env = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const cookieParser = require('cookie-parser');

const logger = require('./utils/logger');
const { deepGuard, requestTimeout, haltOnTimedOut, mongoSanitize, hpp } = require('./middleware/security');
const { globalLimiter } = require('./middleware/rateLimiters');
const { startSchedulers } = require('./services/scheduler');
const { validateBody } = require('./middleware/validate');
const { webhookSchema } = require('./schemas/desk360Schemas');
const desk360Controller = require('./controllers/desk360Controller');
const businessRoutes = require('./routes/businessRoutes');
const userRoutes = require('./routes/userRoutes');
const boxRoutes = require('./routes/boxRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderController = require('./controllers/orderController');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // Nginx arkasında gerçek istemci IP'si (rate limit doğruluğu)

// --- Gözlemlenebilirlik ---
app.use(pinoHttp({
  logger,
  autoLogging: { ignore: (req) => req.url === '/healthz' },
}));

// --- Güvenlik kalkanları (PLAN.md §6) ---
app.use(requestTimeout);                 // Slowloris: JSON 15sn, multipart 120sn
app.use(helmet());                       // HTTP başlık güvenliği
app.use(cors({ origin: env.allowedOrigins, credentials: true }));
app.use(cookieParser());                 // httpOnly refresh token cookie'leri
app.use(express.json({ limit: '2mb' })); // Payload limiti
app.use(haltOnTimedOut);
app.use(deepGuard);                      // Prototype pollution + derinlik sınırı
app.use(mongoSanitize);                  // NoSQL injection
app.use(hpp);                            // HTTP parameter pollution
app.use('/api', globalLimiter);          // Genel IP limiti

// --- Veritabanı ---
mongoose
  .connect(env.mongoUri)
  .then(() => logger.info('MongoDB bağlantısı kuruldu'))
  .catch((err) => logger.error({ err }, 'MongoDB bağlantı hatası'));

// --- Sağlık kontrolü ---
app.get('/healthz', (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'degraded',
    db: dbUp ? 'up' : 'down',
    uptime: Math.round(process.uptime()),
  });
});

// --- Rotalar ---
app.use('/api/v1/business', businessRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/boxes', boxRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
// Ödeme sağlayıcı webhook'u (HMAC imzalı — bkz. orderController.paymentWebhook)
app.post('/api/v1/webhooks/payment', orderController.paymentWebhook);
// Desk360 WhatsApp cevap webhook'u (URL token korumalı — PLAN.md §3.4)
app.post('/api/v1/webhooks/desk360/:token', validateBody(webhookSchema), desk360Controller.webhook);

// 404
app.use((_req, res) => {
  res.status(404).json({ status: 'fail', message: 'Kaynak bulunamadı.' });
});

// Merkezi hata yakalayıcı — üretimde stack/iç detay sızdırmaz
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (req.timedout) return; // bağlantı zaten kesildi
  (req.log || logger).error({ err }, 'İstek hatası');
  const status = err.status || 500;
  res.status(status).json({
    status: 'error',
    message: env.isProd && status === 500 ? 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' : err.message,
  });
});

const server = app.listen(env.port, () => {
  logger.info(`Artı API ${env.port} portunda çalışıyor (${env.nodeEnv})`);
});

// Zamanlanmış işler: rezervasyon süpürme, WhatsApp taraması, fallback yayın
let scheduler = { stop: async () => {} };
startSchedulers().then((s) => { scheduler = s; });

// --- Zarif kapanış: aktif istekler bitirilir, DB bağlantısı kapatılır ---
function shutdown(signal) {
  logger.info(`${signal} alındı, sunucu kapatılıyor...`);
  server.close(() => {
    scheduler.stop()
      .catch(() => {})
      .finally(() => mongoose.connection.close(false).finally(() => process.exit(0)));
  });
  setTimeout(() => process.exit(1), 10000).unref(); // 10 sn'de kapanmazsa zorla
}
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));

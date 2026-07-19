// Env doğrulaması her şeyden önce çalışır (fail-fast) — eksik secret'la süreç başlamaz.
const env = require('./config/env');

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const cookieParser = require('cookie-parser');

const logger = require('./utils/logger');
const { deepGuard, requestTimeout, haltOnTimedOut, mongoSanitize, hpp, proxySecret } = require('./middleware/security');
const { globalLimiter } = require('./middleware/rateLimiters');
const { startSchedulers, redisPing } = require('./services/scheduler');
const uploadController = require('./controllers/uploadController');
const { validateBody } = require('./middleware/validate');
const { webhookSchema } = require('./schemas/desk360Schemas');
const desk360Controller = require('./controllers/desk360Controller');
const businessRoutes = require('./routes/businessRoutes');
const userRoutes = require('./routes/userRoutes');
const boxRoutes = require('./routes/boxRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
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
app.use('/api', proxySecret);            // CDN varken origin'e direkt erişim engeli (env ile açılır)
app.use('/api', globalLimiter);          // Genel IP limiti

// --- Veritabanı ---
mongoose
  .connect(env.mongoUri)
  .then(() => logger.info('MongoDB bağlantısı kuruldu'))
  .catch((err) => logger.error({ err }, 'MongoDB bağlantı hatası'));

// --- Sağlık kontrolü (UptimeRobot + Nginx upstream check) ---
app.get('/healthz', async (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  const redis = await redisPing(); // 'up' | 'down' | 'n/a'
  const ok = dbUp && redis !== 'down';
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    db: dbUp ? 'up' : 'down',
    redis,
    uptime: Math.round(process.uptime()),
  });
});

// --- Lokal depolama modu: S3 simülasyonu (PLAN.md §1, Faz 3) ---
if (env.storageProvider === 'local') {
  // Presigned PUT hedefi — imza/expiry doğrulaması localProvider.saveUpload'da
  app.put(
    '/api/v1/uploads/local/*',
    express.raw({ type: () => true, limit: '5mb' }),
    uploadController.putLocal
  );
  // Yüklenen görsellerin statik servisi; CORP başlığı frontend origin'inin
  // görselleri yükleyebilmesi için gerekli (helmet varsayılanı same-origin)
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  }));
}

// --- Rotalar ---
app.use('/api/v1/business', businessRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/boxes', boxRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/tickets', ticketRoutes);
// Ödeme sağlayıcı webhook'u (HMAC imzalı — bkz. orderController.paymentWebhook)
app.post('/api/v1/webhooks/payment', orderController.paymentWebhook);
// Mock ödeme simülasyonu — yalnızca dev (PAYMENT_PROVIDER=mock). Gerçek sağlayıcıda
// bu rota hiç mount edilmez; ödeme sonucu imzalı webhook'tan gelir.
if (env.paymentProvider === 'mock') {
  const orderService = require('./services/orderService');
  app.post('/api/v1/payments/mock/complete', async (req, res, next) => {
    try {
      const { paymentRef, success = true } = req.body || {};
      if (!paymentRef) return res.status(400).json({ status: 'fail', message: 'paymentRef zorunlu.' });
      const result = await orderService.handlePaymentResult(paymentRef, Boolean(success));
      res.status(200).json({ status: 'success', outcome: result.outcome });
    } catch (err) {
      next(err);
    }
  });
}
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

// Üretimde yalnızca 127.0.0.1 dinlenir; dış dünyaya Nginx açılır (PLAN.md §6.11)
const server = app.listen(env.port, env.host, () => {
  logger.info(`Artı API ${env.host}:${env.port} üzerinde çalışıyor (${env.nodeEnv}, depolama: ${env.storageProvider})`);
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

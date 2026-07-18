// Ortam değişkenleri — fail-fast: zorunlu bir değişken eksikse süreç hiç başlamaz.
// Kodun hiçbir yerinde hardcoded secret/fallback bulunamaz (bkz. PLAN.md §1).
const dotenv = require('dotenv');

dotenv.config();

const REQUIRED = ['MONGO_URI', 'JWT_SECRET', 'ENCRYPTION_KEY', 'WEBHOOK_SECRET', 'DESK360_WEBHOOK_TOKEN'];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `[env] Eksik zorunlu ortam değişkeni: ${missing.join(', ')}\n` +
    '[env] backend/.env dosyanızı .env.example üzerinden oluşturun.'
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  // eslint-disable-next-line no-console
  console.error('[env] JWT_SECRET en az 32 karakter olmalı. Üretim için: openssl rand -hex 48');
  process.exit(1);
}

if (!/^[0-9a-f]{64}$/i.test(process.env.ENCRYPTION_KEY)) {
  // eslint-disable-next-line no-console
  console.error('[env] ENCRYPTION_KEY 64 karakter hex (32 bayt) olmalı. Üretim için: openssl rand -hex 32');
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  port: parseInt(process.env.PORT, 10) || 5002,
  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,
  // Refresh token akışı geldiği için access token kısa ömürlü (PLAN.md §5)
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTtlDays: parseInt(process.env.REFRESH_TTL_DAYS, 10) || 30,

  // KVKK field-level şifreleme anahtarı (AES-256-GCM)
  encryptionKey: Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
  // Webhook HMAC imzaları (ödeme, ileride Desk360)
  webhookSecret: process.env.WEBHOOK_SECRET,

  // Ödeme sağlayıcı: 'mock' | 'iyzico' (iyzico anahtarları gelince aktifleşir)
  paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',

  // Rezervasyon ödeme penceresi (dk) — süre dolarsa stok geri salınır
  reservationTtlMin: parseInt(process.env.RESERVATION_TTL_MIN, 10) || 10,

  // Kuyruk altyapısı: boşsa tek-instance in-process moda düşer (yalnızca dev)
  redisUrl: process.env.REDIS_URL || '',

  // Desk360 WhatsApp entegrasyonu
  // API URL boşsa simülatör modu: mesajlar yalnızca loglanır (PLAN.md §3.4)
  desk360ApiUrl: process.env.DESK360_API_URL || '',
  desk360ApiKey: process.env.DESK360_API_KEY || '',
  desk360WebhookToken: process.env.DESK360_WEBHOOK_TOKEN,
  // Pickup'a kaç dk kala WhatsApp sorusu gider / fallback yayını yapılır
  outreachLeadMin: parseInt(process.env.OUTREACH_LEAD_MIN, 10) || 240,
  fallbackLeadMin: parseInt(process.env.FALLBACK_LEAD_MIN, 10) || 60,

  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

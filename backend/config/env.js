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
const isProd = nodeEnv === 'production';

// Depolama: 'local' (dev — dosyalar backend/uploads altına yazılır) | 's3' (üretim)
const storageProvider = process.env.STORAGE_PROVIDER || 'local';
if (storageProvider === 's3' && (!process.env.S3_BUCKET || !process.env.S3_REGION)) {
  // eslint-disable-next-line no-console
  console.error('[env] STORAGE_PROVIDER=s3 için S3_BUCKET ve S3_REGION zorunludur.');
  process.exit(1);
}

module.exports = {
  nodeEnv,
  isProd,
  port: parseInt(process.env.PORT, 10) || 5002,
  // Üretimde Nginx arkasında yalnızca loopback dinlenir (PLAN.md §6.11)
  host: process.env.HOST || (isProd ? '127.0.0.1' : '0.0.0.0'),
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

  // Fraud kuralları (PLAN.md Faz 4): stok kilitleme ve toplu kapatma istismarına fren
  maxActiveReservations: parseInt(process.env.MAX_ACTIVE_RESERVATIONS, 10) || 3,
  maxDailyOrders: parseInt(process.env.MAX_DAILY_ORDERS, 10) || 10,

  // CDN katmanı devreye girince doldurulur: doluysa /api istekleri
  // X-Proxy-Secret başlığı olmadan işlenmez (PLAN.md Faz 4)
  proxySharedSecret: process.env.PROXY_SHARED_SECRET || '',

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

  // Dosya depolama (işletme logosu / kutu görselleri — PLAN.md §1)
  storageProvider,
  s3Bucket: process.env.S3_BUCKET || '',
  s3Region: process.env.S3_REGION || '',
  // Görsellerin servis edildiği taban URL (CDN eklenirse burası değişir)
  s3PublicBase: process.env.S3_PUBLIC_BASE || '',
  // API'nin dışarıdan görünen adresi (lokal presigned URL üretimi için)
  publicApiUrl: process.env.PUBLIC_API_URL || `http://localhost:${parseInt(process.env.PORT, 10) || 5002}`,

  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

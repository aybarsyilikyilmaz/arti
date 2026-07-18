// Faz 3 duman testi — görsel yükleme akışı (PLAN.md Faz 3):
//   presign → (imzalı) PUT → statik servis → profil görseli güncelleme
// STORAGE_PROVIDER=local varsayılır; S3 modunda bu test atlanmalıdır.
// Kullanım: API açıkken `node scripts/e2e-faz3.js`
const path = require('path');
const fs = require('fs/promises');
const env = require('../config/env');
const mongoose = require('mongoose');
const Business = require('../models/Business');

const BASE = process.env.E2E_BASE || `http://localhost:${env.port}`;
let passed = 0;
let failed = 0;

function check(name, cond, extra = '') {
  if (cond) { passed += 1; console.log('  ✓', name); }
  else { failed += 1; console.log('  ✗', name, extra); }
}

async function api(pathname, { method = 'GET', token, body, headers = {} } = {}) {
  const res = await fetch(BASE + pathname, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* gövdesiz */ }
  return { status: res.status, data };
}

async function main() {
  await mongoose.connect(env.mongoUri);
  const tag = Date.now();
  console.log(`\nArtı Faz 3 duman testi — ${BASE} (depolama: ${env.storageProvider})\n`);

  if (env.storageProvider !== 'local') {
    console.log('  ! STORAGE_PROVIDER=local değil — test atlandı');
    await mongoose.disconnect();
    process.exit(0);
  }

  const biz = await Business.create({
    name: 'E2E Görsel Fırın',
    email: `e2e3-biz-${tag}@arti.dev`,
    phone: '02121112233',
    password: 'sifre-1234',
    address: 'Test Mah. No:1',
    businessType: 'firin',
    status: 'APPROVED',
    boxContents: ['unlu'],
    kvkkConsentAt: new Date(),
  });

  // --- 0. Sağlık: healthz redis durumunu raporluyor ---
  const health = await api('/healthz');
  check('healthz redis alanı var', ['up', 'down', 'n/a'].includes(health.data?.redis), JSON.stringify(health.data));

  // --- 1. Presign yetki ve doğrulama ---
  const noAuth = await api('/api/v1/business/uploads/presign', {
    method: 'POST', body: { kind: 'logo', contentType: 'image/png' },
  });
  check('Token olmadan presign reddedildi (401)', noAuth.status === 401);

  const login = await api('/api/v1/business/login', {
    method: 'POST', body: { email: biz.email, password: 'sifre-1234' },
  });
  const token = login.data?.accessToken;
  check('İşletme girişi başarılı', Boolean(token));

  const badType = await api('/api/v1/business/uploads/presign', {
    method: 'POST', token, body: { kind: 'logo', contentType: 'application/pdf' },
  });
  check('Görsel dışı tür reddedildi (400)', badType.status === 400);

  const presign = await api('/api/v1/business/uploads/presign', {
    method: 'POST', token, body: { kind: 'logo', contentType: 'image/png' },
  });
  const grant = presign.data?.data;
  check('Presign URL üretildi', presign.status === 200 && Boolean(grant?.uploadUrl && grant?.publicUrl));

  // --- 2. PUT: imza kontrolleri ---
  // 1x1 şeffaf PNG
  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const tamperedUrl = grant.uploadUrl.replace(/sig=[0-9a-f]{6}/, 'sig=000000');
  const badSig = await fetch(tamperedUrl, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: pngBytes,
  });
  check('Bozuk imzalı PUT reddedildi (403)', badSig.status === 403);

  const wrongCt = await fetch(grant.uploadUrl, {
    method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: pngBytes,
  });
  check('İmzalanandan farklı Content-Type reddedildi (403)', wrongCt.status === 403);

  const put = await fetch(grant.uploadUrl, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: pngBytes,
  });
  check('İmzalı PUT başarılı (200)', put.status === 200);

  // --- 3. Statik servis ---
  const served = await fetch(grant.publicUrl);
  const servedBytes = Buffer.from(await served.arrayBuffer());
  check('Görsel /uploads üzerinden servis edildi', served.status === 200 && servedBytes.equals(pngBytes));
  check('CORP başlığı cross-origin', served.headers.get('cross-origin-resource-policy') === 'cross-origin');

  // --- 4. Profil görseli güncelleme ---
  const foreign = await api('/api/v1/business/profile/images', {
    method: 'PATCH', token, body: { logoUrl: 'https://kotu-site.dev/x.png' },
  });
  check('Depo dışı URL reddedildi (400)', foreign.status === 400);

  const setImg = await api('/api/v1/business/profile/images', {
    method: 'PATCH', token, body: { logoUrl: grant.publicUrl },
  });
  check('logoUrl profile yazıldı', setImg.status === 200 && setImg.data?.data?.business?.logoUrl === grant.publicUrl);
  check('Cevapta hassas alan yok', setImg.data?.data?.business?.password === undefined
    && setImg.data?.data?.business?.taxNumber === undefined);

  // --- Temizlik ---
  await Business.deleteOne({ _id: biz._id });
  await fs.rm(path.join(__dirname, '../uploads/business', String(biz._id)), { recursive: true, force: true });

  console.log(`\nSonuç: ${passed} başarılı, ${failed} başarısız\n`);
  await mongoose.disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });

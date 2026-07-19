// Faz 4 duman testi (PLAN.md Faz 4):
//   favoriler → kutu yayını bildirimi → fraud limitleri → işletme raporu
// Kullanım: API açıkken `node scripts/e2e-faz4.js`
const env = require('../config/env');
const mongoose = require('mongoose');
const User = require('../models/User');
const Business = require('../models/Business');
const SurpriseBox = require('../models/SurpriseBox');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { hmacSign } = require('../utils/crypto');

const BASE = process.env.E2E_BASE || `http://localhost:${env.port}`;
let passed = 0;
let failed = 0;

function check(name, cond, extra = '') {
  if (cond) { passed += 1; console.log('  ✓', name); }
  else { failed += 1; console.log('  ✗', name, extra); }
}

async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
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
  console.log(`\nArtı Faz 4 duman testi — ${BASE}\n`);

  // Aktörler
  const biz = await Business.create({
    name: 'E2E Favori Fırın',
    email: `e2e4-biz-${tag}@arti.dev`,
    phone: '02121112233',
    password: 'sifre-1234',
    address: 'Test Mah. No:1',
    businessType: 'firin',
    status: 'APPROVED',
    boxContents: ['unlu'],
    kvkkConsentAt: new Date(),
  });
  const bizLogin = await api('/api/v1/business/login', {
    method: 'POST', body: { email: biz.email, password: 'sifre-1234' },
  });
  const bizToken = bizLogin.data?.accessToken;

  const userEmail = `e2e4-user-${tag}@arti.dev`;
  await api('/api/v1/users/register', {
    method: 'POST',
    body: { name: 'E2E Faz4 Kullanıcı', email: userEmail, password: 'sifre-1234', kvkkConsent: true },
  });
  const userLogin = await api('/api/v1/users/login', {
    method: 'POST', body: { email: userEmail, password: 'sifre-1234' },
  });
  const userToken = userLogin.data?.accessToken;
  check('Aktörler hazır', Boolean(bizToken && userToken));

  // --- 1. Favoriler ---
  const badFav = await api('/api/v1/users/favorites/gecersiz-id', { method: 'POST', token: userToken });
  check('Geçersiz işletme kimliği reddedildi (400)', badFav.status === 400);

  const fav1 = await api(`/api/v1/users/favorites/${biz._id}`, { method: 'POST', token: userToken });
  check('Favoriye eklendi', fav1.status === 200);

  await api(`/api/v1/users/favorites/${biz._id}`, { method: 'POST', token: userToken });
  const favList = await api('/api/v1/users/favorites', { token: userToken });
  check('İkinci ekleme çoğaltmadı (idempotent)', favList.data?.data?.favorites?.length === 1);
  check('Listede işletme adı var', favList.data?.data?.favorites?.[0]?.name === 'E2E Favori Fırın');

  // --- 2. Kutu yayını → bildirim ---
  const boxRes = await api('/api/v1/business/boxes', {
    method: 'POST', token: bizToken,
    body: { basePrice: 200, originalPrice: 500, initialStock: 10, contents: ['unlu'], pickupStart: '18:00', pickupEnd: '21:00' },
  });
  const boxId = boxRes.data?.data?.box?._id;
  check('Kutu yayınlandı', boxRes.status === 201, JSON.stringify(boxRes.data));

  // Bildirim fire-and-forget — yazılması için kısa bekleme
  await new Promise((r) => setTimeout(r, 500));
  const notifs = await api('/api/v1/users/notifications', { token: userToken });
  const notif = notifs.data?.data?.notifications?.[0];
  check('Favorileyene bildirim düştü', notifs.data?.unreadCount === 1 && notif?.type === 'BOX_PUBLISHED',
    JSON.stringify(notifs.data));
  check('Bildirim metni işletmeyi anıyor', typeof notif?.title === 'string' && notif.title.includes('E2E Favori Fırın'));

  await api('/api/v1/users/notifications/read', { method: 'PATCH', token: userToken });
  const notifs2 = await api('/api/v1/users/notifications', { token: userToken });
  check('Okundu işaretlendi (unreadCount 0)', notifs2.data?.unreadCount === 0);

  // --- 3. Fraud: aktif rezervasyon limiti ---
  // Önceki test çalışmalarından kalabilecek RESERVED siparişleri temizle
  const userDb2 = await User.findOne({ email: userEmail });
  await Order.deleteMany({ user: userDb2._id, status: 'RESERVED' });

  const cos = [];
  for (let i = 0; i < 3; i += 1) {
    cos.push(await api('/api/v1/orders/checkout', { method: 'POST', token: userToken, body: { boxId } }));
  }
  check('3 rezervasyon açıldı', cos.every((c) => c.status === 201), cos.map((c) => c.status).join(','));

  const co4 = await api('/api/v1/orders/checkout', { method: 'POST', token: userToken, body: { boxId } });
  check(`4. istek limite takıldı (429, limit=${env.maxActiveReservations})`, co4.status === 429, `status=${co4.status}`);
  check('Limitli istek stok düşürmedi (7)', (await SurpriseBox.findById(boxId))?.remaining === 7);

  // Biri ödenince yer açılır → yeni rezervasyon tekrar mümkün
  const payRef = cos[0].data?.data?.paymentPageUrl?.split('/').pop();
  const whBody = { paymentRef: payRef, success: true };
  const wh = await api('/api/v1/webhooks/payment', {
    method: 'POST', body: whBody, headers: { 'x-webhook-signature': hmacSign(JSON.stringify(whBody)) },
  });
  check('Ödeme geçti (PAID)', wh.data?.outcome === 'PAID');

  const co5 = await api('/api/v1/orders/checkout', { method: 'POST', token: userToken, body: { boxId } });
  check('Ödeme sonrası yeni rezervasyon açılabildi', co5.status === 201, `status=${co5.status}`);

  // --- 4. İşletme raporu ---
  const report = await api('/api/v1/business/reports/summary?days=7', { token: bizToken });
  const d = report.data?.data;
  check('Rapor döndü', report.status === 200, JSON.stringify(report.data));
  check('Bugünün kutusu raporda (satılan 4)', d?.today?.published === true && d?.today?.sold === 4, JSON.stringify(d?.today));
  // basePrice=200, rate=%10 → müşteriden alınan price=220
  // rapordaki revenue = sipariş.amount toplamı (müşteri ödemesi)
  const expectedPrice = Math.round(200 * 1.1); // 220
  check('Ciro ödenen siparişten (price=220)', d?.totals?.revenue === expectedPrice, JSON.stringify(d?.totals));
  check('Durum kırılımı doğru (3 RESERVED + 1 PAID)',
    d?.totals?.byStatus?.RESERVED === 3 && d?.totals?.byStatus?.PAID === 1, JSON.stringify(d?.totals?.byStatus));
  check('Günlük seri bugünü içeriyor', Array.isArray(d?.daily) && d.daily.length === 1 && d.daily[0].revenue === expectedPrice);

  const badDays = await api('/api/v1/business/reports/summary?days=99', { token: bizToken });
  check('days=99 reddedildi (400)', badDays.status === 400);

  // --- 5. Favoriden çıkarma ---
  await api(`/api/v1/users/favorites/${biz._id}`, { method: 'DELETE', token: userToken });
  const favList2 = await api('/api/v1/users/favorites', { token: userToken });
  check('Favoriden çıkarıldı', favList2.data?.data?.favorites?.length === 0);

  // --- Temizlik ---
  const userDb = await User.findOne({ email: userEmail });
  await Notification.deleteMany({ user: userDb._id });
  await Order.deleteMany({ user: userDb._id });
  await SurpriseBox.deleteMany({ business: biz._id });
  await Business.deleteOne({ _id: biz._id });
  await User.deleteOne({ _id: userDb._id });

  console.log(`\nSonuç: ${passed} başarılı, ${failed} başarısız\n`);
  await mongoose.disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });

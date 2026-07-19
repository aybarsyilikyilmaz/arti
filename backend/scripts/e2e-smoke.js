// Uçtan uca duman testi (PLAN.md §9) — çalışan API'ye karşı koşar:
//   kayıt → onay → kutu → rezervasyon → ödeme webhook'u → QR teslim → yarış testi
// Kullanım: API açıkken `node scripts/e2e-smoke.js`
// Test verileri benzersiz e-postalarla oluşturulur ve sonunda temizlenir.
const env = require('../config/env');
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const Business = require('../models/Business');
const User = require('../models/User');
const Order = require('../models/Order');
const SurpriseBox = require('../models/SurpriseBox');
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
  try { data = await res.json(); } catch { /* gövdesiz cevap */ }
  return { status: res.status, data };
}

async function main() {
  await mongoose.connect(env.mongoUri);
  const tag = Date.now();
  const bizEmail = `e2e-biz-${tag}@arti.dev`;
  const userEmail = `e2e-user-${tag}@arti.dev`;
  const adminEmail = `e2e-admin-${tag}@arti.dev`;
  const adminPass = 'e2e-admin-sifresi-123';

  await AdminUser.create({ email: adminEmail, password: adminPass, role: 'superadmin' });
  console.log(`\nArtı e2e duman testi — ${BASE}\n`);

  // --- 1. İşletme kaydı + KVKK şifreleme ---
  const bizReg = await api('/api/v1/business/register', {
    method: 'POST',
    body: {
      name: 'E2E Fırın', businessType: 'firin', address: 'Test Mah. No:1',
      phone: '02121234567', email: bizEmail, password: 'sifre-1234',
      taxOffice: 'Kadıköy', taxNumber: '1234567890',
      coordinates: [29.03, 40.99], kvkkConsent: true,
    },
  });
  check('İşletme kaydı (201)', bizReg.status === 201, JSON.stringify(bizReg.data));
  const bizToken = bizReg.data?.accessToken;
  check('İşletme PENDING_APPROVAL başlıyor', bizReg.data?.data?.business?.status === 'PENDING_APPROVAL');
  check('VKN API cevabında yok', bizReg.data?.data?.business?.taxNumber === undefined);

  const bizDb = await Business.findOne({ email: bizEmail });
  check("VKN DB'de şifreli (enc:v1:)", String(bizDb.taxNumber).startsWith('enc:v1:'));
  check('VKN çözülünce doğru', bizDb.getTaxNumber() === '1234567890');

  // --- 2. Onaysız işletme kutu açamaz ---
  const boxDenied = await api('/api/v1/business/boxes', {
    method: 'POST', token: bizToken,
    body: { basePrice: 250, originalPrice: 500, initialStock: 2, contents: ['unlu'], pickupStart: '18:00', pickupEnd: '21:00' },
  });
  check('Onaysız işletme kutu açamaz (403)', boxDenied.status === 403);

  // --- 3. Admin onayı ---
  const adminLogin = await api('/api/v1/admin/login', { method: 'POST', body: { email: adminEmail, password: adminPass } });
  check('Admin girişi', adminLogin.status === 200);
  const adminToken = adminLogin.data?.accessToken;

  const detail = await api(`/api/v1/admin/businesses/${bizDb._id}`, { token: adminToken });
  check('Admin VKN\'yi çözülmüş görür', detail.data?.data?.business?.taxNumber === '1234567890');

  const approve = await api(`/api/v1/admin/businesses/${bizDb._id}/approve`, { method: 'PATCH', token: adminToken });
  check('İşletme onaylandı', approve.status === 200 && approve.data?.data?.business?.status === 'APPROVED');

  // --- 4. Kutu oluşturma ---
  const boxRes = await api('/api/v1/business/boxes', {
    method: 'POST', token: bizToken,
    body: { basePrice: 250, originalPrice: 500, initialStock: 2, contents: ['unlu', 'vegan'], pickupStart: '18:00', pickupEnd: '21:00' },
  });
  check('Kutu oluşturuldu (201)', boxRes.status === 201, JSON.stringify(boxRes.data));
  const boxId = boxRes.data?.data?.box?._id;

  // --- 5. Kullanıcı kaydı + herkese açık listeleme ---
  const userReg = await api('/api/v1/users/register', {
    method: 'POST',
    body: { name: 'E2E Kullanıcı', email: userEmail, password: 'sifre-1234', kvkkConsent: true },
  });
  check('Kullanıcı kaydı (201)', userReg.status === 201, JSON.stringify(userReg.data));
  const userToken = userReg.data?.accessToken;

  const list = await api('/api/v1/boxes?lng=29.03&lat=40.99&radiusKm=5');
  check('Yakındaki kutular listeleniyor', list.status === 200 && list.data?.data?.boxes?.some((b) => b._id === boxId));

  // --- 6. Checkout + atomik stok ---
  const co1 = await api('/api/v1/orders/checkout', { method: 'POST', token: userToken, body: { boxId } });
  check('Checkout 1: rezervasyon (201)', co1.status === 201, JSON.stringify(co1.data));
  const payRef1 = co1.data?.data?.paymentPageUrl?.split('/').pop();

  check('Stok 2→1 düştü', (await SurpriseBox.findById(boxId)).remaining === 1);

  // --- 7. Webhook güvenliği + idempotency ---
  const badWh = await api('/api/v1/webhooks/payment', { method: 'POST', body: { paymentRef: payRef1, success: true } });
  check('İmzasız webhook reddedildi (401)', badWh.status === 401);

  const whBody = { paymentRef: payRef1, success: true };
  const sig = hmacSign(JSON.stringify(whBody));
  const wh = await api('/api/v1/webhooks/payment', { method: 'POST', body: whBody, headers: { 'x-webhook-signature': sig } });
  check('İmzalı webhook → PAID', wh.status === 200 && wh.data?.outcome === 'PAID', JSON.stringify(wh.data));

  const wh2 = await api('/api/v1/webhooks/payment', { method: 'POST', body: whBody, headers: { 'x-webhook-signature': sig } });
  check('Çift callback idempotent (ALREADY_PAID)', wh2.data?.outcome === 'ALREADY_PAID');

  // --- 8. QR teslim: tek kullanım + imza ---
  const mine = await api('/api/v1/orders/mine', { token: userToken });
  const qrToken = mine.data?.data?.orders?.find((o) => o.status === 'PAID')?.qrToken;
  check('QR token üretildi (3 parçalı imzalı)', typeof qrToken === 'string' && qrToken.split('.').length === 3);

  const v1 = await api('/api/v1/business/orders/verify', { method: 'POST', token: bizToken, body: { qrToken } });
  check('QR ile teslim onayı', v1.status === 200, JSON.stringify(v1.data));

  const v2 = await api('/api/v1/business/orders/verify', { method: 'POST', token: bizToken, body: { qrToken } });
  check('Aynı QR ikinci kez reddedildi (409)', v2.status === 409);

  const vBad = await api('/api/v1/business/orders/verify', {
    method: 'POST', token: bizToken,
    body: { qrToken: `${qrToken.split('.')[0]}.${qrToken.split('.')[1]}.${'0'.repeat(64)}` },
  });
  check('Sahte imzalı QR reddedildi', vBad.status === 409);

  // --- 9. Başarısız ödemede stok iadesi ---
  const co2 = await api('/api/v1/orders/checkout', { method: 'POST', token: userToken, body: { boxId } });
  check('Checkout 2 (son kutu)', co2.status === 201);
  const payRef2 = co2.data?.data?.paymentPageUrl?.split('/').pop();

  const co3 = await api('/api/v1/orders/checkout', { method: 'POST', token: userToken, body: { boxId } });
  check('Stok bitince 409 (tükendi)', co3.status === 409);

  const whFailBody = { paymentRef: payRef2, success: false };
  const whFail = await api('/api/v1/webhooks/payment', {
    method: 'POST', body: whFailBody, headers: { 'x-webhook-signature': hmacSign(JSON.stringify(whFailBody)) },
  });
  check('Başarısız ödeme → stok iadesi (RELEASED)', whFail.data?.outcome === 'RELEASED');
  check('Stok geri salındı (1)', (await SurpriseBox.findById(boxId)).remaining === 1);

  // --- 10. Yarış testi: kalan 1 kutuya 5 eşzamanlı checkout ---
  const race = await Promise.all(
    [...Array(5)].map(() => api('/api/v1/orders/checkout', { method: 'POST', token: userToken, body: { boxId } }))
  );
  const wins = race.filter((r) => r.status === 201).length;
  check('Yarış: 5 eşzamanlı istekten yalnızca 1 kazandı', wins === 1, `kazanan=${wins}`);
  check('Stok 0 (eksiye düşmedi)', (await SurpriseBox.findById(boxId)).remaining === 0);

  // --- Temizlik ---
  const userDb = await User.findOne({ email: userEmail });
  await Order.deleteMany({ user: userDb._id });
  await SurpriseBox.deleteMany({ business: bizDb._id });
  await Business.deleteOne({ _id: bizDb._id });
  await User.deleteOne({ _id: userDb._id });
  await AdminUser.deleteOne({ email: adminEmail });

  console.log(`\nSonuç: ${passed} başarılı, ${failed} başarısız\n`);
  await mongoose.disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });

// Müşteri web sipariş akışı — uçtan uca duman testi:
//   kayıt → keşfet → rezervasyon → mock ödeme → QR → işletme teslim (PICKED_UP)
// + GÜVENLİK: fiyat manipülasyonu etkisiz, IDOR (başkasının siparişi görünmez),
//   geçersiz kutu id 400, çift teslim engeli.
// Kullanım: API açıkken `node scripts/e2e-customer.js`
const env = require('../config/env');
const mongoose = require('mongoose');
const Business = require('../models/Business');
const SurpriseBox = require('../models/SurpriseBox');
const Order = require('../models/Order');
const User = require('../models/User');
const { todayIstanbul } = require('../utils/time');

const BASE = process.env.E2E_BASE || `http://localhost:${env.port}`;
let passed = 0;
let failed = 0;

function check(name, cond, extra = '') {
  if (cond) { passed += 1; console.log('  ✓', name); }
  else { failed += 1; console.log('  ✗', name, extra); }
}

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* gövdesiz */ }
  return { status: res.status, data };
}

async function main() {
  await mongoose.connect(env.mongoUri);
  const tag = Date.now();
  console.log(`\nArtı müşteri sipariş akışı duman testi — ${BASE}\n`);

  // İşletme + bugünün kutusu (price dolu — markup uygulanmış)
  const biz = await Business.create({
    name: 'E2E Kutu Fırın', email: `e2e-cust-biz-${tag}@arti.dev`, phone: `0212${String(tag).slice(-7)}`,
    password: 'sifre-1234', address: 'Test Mah. No:1', businessType: 'firin',
    status: 'APPROVED', kvkkConsentAt: new Date(),
  });
  const bizTok = (await api('/api/v1/business/login', { method: 'POST', body: { email: biz.email, password: 'sifre-1234' } })).data?.accessToken;
  const box = await SurpriseBox.create({
    business: biz._id, businessName: biz.name, date: todayIstanbul(),
    basePrice: 100, price: 110, originalPrice: 300, initialStock: 3, remaining: 3,
    contents: ['unlu'], pickupStart: '18:00', pickupEnd: '21:00',
  });

  // İki müşteri (biri IDOR denemesi için)
  const reg = async (n) => {
    const email = `e2e-cust-${n}-${tag}@arti.dev`;
    const r = await api('/api/v1/users/register', { method: 'POST', body: { name: `Müşteri ${n}`, email, password: 'sifre-1234', kvkkConsent: true } });
    return { email, token: r.data?.accessToken };
  };
  const alice = await reg('alice');
  const bob = await reg('bob');
  check('Müşteriler kayıt oldu (token döndü)', Boolean(alice.token && bob.token));

  // --- Keşfet ---
  const list = await api('/api/v1/boxes');
  const seen = list.data?.data?.boxes?.find((b) => String(b._id) === String(box._id));
  check('Kutu keşfette listelendi (fiyat + işletme populate)', Boolean(seen) && seen.price === 110 && seen.business?.name === 'E2E Kutu Fırın');

  const detail = await api(`/api/v1/boxes/${box._id}`);
  check('Kutu detayı geldi', detail.status === 200 && detail.data?.data?.box?.price === 110);
  check('Geçersiz kutu id 400', (await api('/api/v1/boxes/gecersiz')).status === 400);

  // --- GÜVENLİK: fiyat manipülasyonu etkisiz ---
  // Müşteri gövdeye amount/price enjekte etse bile sunucu kutudan okur.
  const evilCheckout = await api('/api/v1/orders/checkout', { method: 'POST', token: alice.token, body: { boxId: String(box._id), amount: 1, price: 1 } });
  check('Rezervasyon başarılı, fiyat sunucudan (110 — enjeksiyon yok sayıldı)',
    evilCheckout.status === 201 && evilCheckout.data?.data?.amount === 110, JSON.stringify(evilCheckout.data));
  const paymentRef = evilCheckout.data?.data?.paymentRef;
  check('paymentRef döndü', Boolean(paymentRef));

  // --- Mock ödeme ---
  const pay = await api('/api/v1/payments/mock/complete', { method: 'POST', token: alice.token, body: { paymentRef, success: true } });
  check('Mock ödeme PAID', pay.status === 200 && pay.data?.outcome === 'PAID');

  // --- Siparişlerim + QR ---
  const aliceOrders = await api('/api/v1/orders/mine', { token: alice.token });
  const paidOrder = aliceOrders.data?.data?.orders?.[0];
  check('Alice siparişi PAID + qrToken var', paidOrder?.status === 'PAID' && Boolean(paidOrder?.qrToken));
  const qrToken = paidOrder?.qrToken;

  // --- GÜVENLİK: IDOR — Bob, Alice'in siparişini görmez ---
  const bobOrders = await api('/api/v1/orders/mine', { token: bob.token });
  check('Bob başkasının siparişini görmüyor (IDOR yok)', (bobOrders.data?.data?.orders || []).length === 0);

  // --- İşletme QR okutur → teslim ---
  const verify = await api('/api/v1/business/orders/verify', { method: 'POST', token: bizTok, body: { qrToken } });
  check('İşletme QR okuttu → PICKED_UP', verify.status === 200 && verify.data?.message?.includes('Teslimat'));

  const verifyAgain = await api('/api/v1/business/orders/verify', { method: 'POST', token: bizTok, body: { qrToken } });
  check('Aynı QR ikinci kez teslim edilemez (409)', verifyAgain.status === 409);

  // Stok: 3 başladı, 1 rezerve → 2 kalmalı
  const boxAfter = await SurpriseBox.findById(box._id).select('remaining');
  check('Stok atomik düştü (3 → 2)', boxAfter.remaining === 2, `remaining=${boxAfter.remaining}`);

  // --- Temizlik ---
  await Order.deleteMany({ business: biz._id });
  await SurpriseBox.deleteMany({ business: biz._id });
  await Business.deleteOne({ _id: biz._id });
  await User.deleteMany({ email: new RegExp(`e2e-cust-.*-${tag}@arti\\.dev`) });

  console.log(`\nSonuç: ${passed} geçti, ${failed} kaldı\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });

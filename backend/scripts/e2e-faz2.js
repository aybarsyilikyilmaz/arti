// Faz 2 duman testi — WhatsApp otomasyon döngüsü (PLAN.md §3.4, §9):
//   outreach taraması → webhook cevabı → stok işleme → fallback yayın → admin çözümleme
// Tarama fonksiyonları deterministik test için doğrudan çağrılır;
// webhook HTTP üzerinden gerçek endpoint'e vurulur.
// Kullanım: API açıkken `node scripts/e2e-faz2.js`
const env = require('../config/env');
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const Business = require('../models/Business');
const SurpriseBox = require('../models/SurpriseBox');
const OutreachLog = require('../models/OutreachLog');
const outreachService = require('../services/outreachService');
const { todayIstanbul, nowIstanbulHM } = require('../utils/time');

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

// İstanbul saatiyle şimdi+dk → "HH:MM"
function hmPlusMinutes(minutes) {
  const [h, m] = nowIstanbulHM().split(':').map(Number);
  const total = ((h * 60 + m + minutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

async function makeBusiness(overrides) {
  return Business.create({
    name: overrides.name,
    email: overrides.email,
    phone: '02121112233',
    password: 'sifre-1234',
    address: 'Test Mah. No:1',
    businessType: 'firin',
    status: 'APPROVED',
    boxContents: ['unlu'],
    kvkkConsentAt: new Date(),
    ...overrides,
  });
}

async function main() {
  await mongoose.connect(env.mongoUri);
  const tag = Date.now();
  const date = todayIstanbul();
  console.log(`\nArtı Faz 2 duman testi — ${BASE} (gün: ${date})\n`);

  // Gece yarısına çok yakınsa pencere hesapları güvenilmez olur
  const [nowH] = nowIstanbulHM().split(':').map(Number);
  if (nowH >= 23) console.log('  ! Uyarı: gece yarısına yakın; pencere testleri sarkabilir\n');

  // Aktörler
  const adminEmail = `e2e2-admin-${tag}@arti.dev`;
  await AdminUser.create({ email: adminEmail, password: 'e2e-admin-sifresi-123', role: 'superadmin' });

  // biz1: outreach penceresinde (pickup +3 saat), varsayılan fiyatları TANIMLI
  const biz1 = await makeBusiness({
    name: 'E2E Cevaplı Fırın', email: `e2e2-biz1-${tag}@arti.dev`,
    pickupStart: hmPlusMinutes(180), pickupEnd: hmPlusMinutes(240),
    desk360ChatId: `chat-${tag}-1`, whatsappPhone: '05001112233',
    defaultPackageCount: 3, defaultPrice: 200, defaultOriginalPrice: 500,
  });
  // biz2: outreach penceresinde, varsayılan fiyatları YOK (PENDING_REVIEW yolu)
  const biz2 = await makeBusiness({
    name: 'E2E Fiyatsız Kafe', email: `e2e2-biz2-${tag}@arti.dev`,
    businessType: 'kafe',
    pickupStart: hmPlusMinutes(180), pickupEnd: hmPlusMinutes(240),
    desk360ChatId: `chat-${tag}-2`,
  });
  // biz3: fallback penceresinde (pickup +30 dk), varsayılanlar tanımlı, kutu yok
  const biz3 = await makeBusiness({
    name: 'E2E Sessiz Market', email: `e2e2-biz3-${tag}@arti.dev`,
    businessType: 'market',
    pickupStart: hmPlusMinutes(30), pickupEnd: hmPlusMinutes(90),
    defaultPackageCount: 4, defaultPrice: 150, defaultOriginalPrice: 400,
  });
  // biz4: pencere DIŞI (pickup +8 saat) — mesaj gitmemeli
  const biz4 = await makeBusiness({
    name: 'E2E Erken Restoran', email: `e2e2-biz4-${tag}@arti.dev`,
    businessType: 'restoran',
    pickupStart: hmPlusMinutes(480), pickupEnd: hmPlusMinutes(540),
    desk360ChatId: `chat-${tag}-4`,
  });
  const testBizIds = [biz1._id, biz2._id, biz3._id, biz4._id];

  // --- 1. Outreach taraması ---
  await outreachService.sweepOutreach();
  const logs1 = await OutreachLog.find({ business: { $in: testBizIds }, date });
  check('Penceredeki işletmelere mesaj gitti (biz1+biz2)',
    logs1.some((l) => String(l.business) === String(biz1._id)) &&
    logs1.some((l) => String(l.business) === String(biz2._id)));
  check('Pencere dışına mesaj gitmedi (biz4)', !logs1.some((l) => String(l.business) === String(biz4._id)));

  const countBefore = logs1.length;
  await outreachService.sweepOutreach();
  const logs2 = await OutreachLog.countDocuments({ business: { $in: testBizIds }, date });
  check('İkinci tarama çifte mesaj atmadı (idempotent)', logs2 === countBefore);

  // --- 2. Webhook: doğal dilden sayı çekme ---
  const badToken = await api(`/api/v1/webhooks/desk360/yanlis-token`, {
    method: 'POST', body: { chatId: biz1.desk360ChatId, message: '5' },
  });
  check('Yanlış webhook token reddedildi (401)', badToken.status === 401);

  const wh1 = await api(`/api/v1/webhooks/desk360/${env.desk360WebhookToken}`, {
    method: 'POST', body: { chatId: biz1.desk360ChatId, message: 'merhaba, bugün 5 kutu ayırabilirim' },
  });
  check('Cevap "…5 kutu…" → yeni kutu yayınlandı', wh1.data?.outcome === 'APPLIED_NEW_BOX', JSON.stringify(wh1.data));

  const box1 = await SurpriseBox.findOne({ business: biz1._id, date });
  check('Kutu stoğu 5 (extraStock=5)', box1?.remaining === 5 && box1?.extraStock === 5);
  check('Kutu fiyatları varsayılandan geldi (200/500)', box1?.price === 200 && box1?.originalPrice === 500);

  // İkinci cevap mevcut kutuya eklenir
  const wh2 = await api(`/api/v1/webhooks/desk360/${env.desk360WebhookToken}`, {
    method: 'POST', body: { chatId: biz1.desk360ChatId, message: '3' },
  });
  check('İkinci cevap mevcut kutuya eklendi (APPLIED_INC)', wh2.data?.outcome === 'APPLIED_INC');
  check('Stok 5+3=8', (await SurpriseBox.findOne({ business: biz1._id, date }))?.remaining === 8);

  // --- 3. Parse edilemeyen cevap → admin kuyruğu ---
  const wh3 = await api(`/api/v1/webhooks/desk360/${env.desk360WebhookToken}`, {
    method: 'POST', body: { chatId: biz2.desk360ChatId, message: 'belki olur bakarız' },
  });
  check('Anlaşılmayan cevap → PENDING_REVIEW', wh3.data?.outcome === 'PENDING_REVIEW_UNPARSED');

  const adminLogin = await api('/api/v1/admin/login', {
    method: 'POST', body: { email: adminEmail, password: 'e2e-admin-sifresi-123' },
  });
  const adminToken = adminLogin.data?.accessToken;

  const pendingList = await api('/api/v1/admin/outreach?status=PENDING_REVIEW', { token: adminToken });
  const pendingLog = pendingList.data?.data?.logs?.find((l) => String(l.business?._id) === String(biz2._id));
  check('Admin kuyruğunda görünüyor', Boolean(pendingLog));

  // biz2'nin fiyatı yok → admin sayı girse de kutu açılamaz, net hata
  const applyNoPrice = await api(`/api/v1/admin/outreach/${pendingLog._id}/apply`, {
    method: 'PATCH', token: adminToken, body: { count: 4 },
  });
  check('Fiyatsız işletmede admin işleyemez (409)', applyNoPrice.status === 409);

  // Fiyat tanımlanınca işlenebilir
  await Business.updateOne({ _id: biz2._id }, { defaultPrice: 100, defaultOriginalPrice: 300 });
  const applyOk = await api(`/api/v1/admin/outreach/${pendingLog._id}/apply`, {
    method: 'PATCH', token: adminToken, body: { count: 4 },
  });
  check('Fiyat tanımlanınca admin işledi', applyOk.status === 200 && applyOk.data?.outcome === 'APPLIED_NEW_BOX');
  check('biz2 kutusu 4 adet', (await SurpriseBox.findOne({ business: biz2._id, date }))?.remaining === 4);

  // --- 4. Fallback yayını ---
  await outreachService.sweepFallback();
  const box3 = await SurpriseBox.findOne({ business: biz3._id, date });
  check('Sessiz işletmeye fallback kutu yayınlandı', box3?.initialStock === 4 && box3?.remaining === 4);

  const log3 = await OutreachLog.findOne({ business: biz3._id, date });
  check('Fallback logu yazıldı', log3?.status === 'FALLBACK_PUBLISHED' || log3 === null);

  const fallbackAgain = await outreachService.sweepFallback();
  const boxCount3 = await SurpriseBox.countDocuments({ business: biz3._id, date });
  check('İkinci fallback taraması kutu çoğaltmadı', boxCount3 === 1, `yayın=${fallbackAgain}`);

  // biz1 kutusu varken fallback ona dokunmadı
  check('Cevap vermiş işletmenin kutusu değişmedi (8)',
    (await SurpriseBox.findOne({ business: biz1._id, date }))?.remaining === 8);

  // --- Temizlik ---
  await OutreachLog.deleteMany({ business: { $in: testBizIds } });
  await SurpriseBox.deleteMany({ business: { $in: testBizIds } });
  await Business.deleteMany({ _id: { $in: testBizIds } });
  await AdminUser.deleteOne({ email: adminEmail });

  console.log(`\nSonuç: ${passed} başarılı, ${failed} başarısız\n`);
  await mongoose.disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });

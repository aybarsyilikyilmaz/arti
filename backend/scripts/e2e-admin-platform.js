// Platform geneli admin duman testi:
//   dashboard metrikleri → tüm siparişler (arama dahil) → kullanıcı sicili +
//   ban/unban (banlı giriş 403) → finans (komisyon + dekont referanslı ödeme +
//   çift ödeme 409) → yorum moderasyonu
// Kullanım: API açıkken `node scripts/e2e-admin-platform.js`
const env = require('../config/env');
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const Business = require('../models/Business');
const SurpriseBox = require('../models/SurpriseBox');
const Order = require('../models/Order');
const User = require('../models/User');
const Payout = require('../models/Payout');
const Review = require('../models/Review');
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
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  console.log(`\nArtı admin platform duman testi — ${BASE}\n`);

  // --- Aktörler ---
  const adminEmail = `e2e-plat-admin-${tag}@arti.dev`;
  await AdminUser.create({ email: adminEmail, password: 'e2e-admin-sifresi-123', role: 'superadmin' });
  const adminLogin = await api('/api/v1/admin/login', {
    method: 'POST', body: { email: adminEmail, password: 'e2e-admin-sifresi-123' },
  });
  const adminToken = adminLogin.data?.accessToken;

  const biz = await Business.create({
    name: 'E2E Platform Fırın',
    email: `e2e-plat-biz-${tag}@arti.dev`,
    phone: '02121112233',
    password: 'sifre-1234',
    address: 'Test Mah. No:1',
    businessType: 'firin',
    status: 'APPROVED',
    commissionRate: 20,
    iban: 'TR000000000000000000000002',
    ibanOwner: 'E2E Platform A.Ş.',
    kvkkConsentAt: new Date(),
  });
  const userEmail = `e2e-plat-user-${tag}@arti.dev`;
  const user = await User.create({
    name: 'E2E Platform Müşteri', email: userEmail, password: 'sifre-1234', kvkkConsentAt: new Date(),
  });
  const box = await SurpriseBox.create({
    business: biz._id, businessName: biz.name, date: todayIstanbul(),
    basePrice: 100, price: 110, originalPrice: 300, initialStock: 5, remaining: 3, contents: ['unlu'],
  });
  const [order1] = await Order.create([
    { user: user._id, business: biz._id, box: box._id, amount: 110, baseAmount: 100, status: 'PICKED_UP', idempotencyKey: `e2e-plat-${tag}-1`, usedAt: new Date() },
    { user: user._id, business: biz._id, box: box._id, amount: 110, baseAmount: 100, status: 'PICKED_UP', idempotencyKey: `e2e-plat-${tag}-2`, usedAt: new Date() },
  ]);
  const review = await Review.create({
    user: user._id, business: biz._id, order: order1._id, rating: 1, comment: 'E2E test yorumu — berbat!',
  });
  check('Aktörler hazır', Boolean(adminToken));

  // --- 1. Dashboard ---
  const dash = await api('/api/v1/admin/dashboard', { token: adminToken });
  const m = dash.data?.data?.metrics;
  check('Dashboard metrikleri döndü', dash.status === 200 && m?.totalUsers >= 1 && m?.activeBusinesses >= 1);
  check('Bugünkü satış ciroya yansıdı', m?.todaySold >= 2 && m?.todayRevenue >= 220);
  check('Trend ve alarm listeleri var', Array.isArray(dash.data?.data?.daily) && Array.isArray(dash.data?.data?.alarms));

  // --- 2. Tüm siparişler ---
  const allOrders = await api('/api/v1/admin/orders?limit=5', { token: adminToken });
  check('Sipariş akışı listelendi', allOrders.status === 200 && allOrders.data?.data?.totalOrders >= 2);

  const searched = await api(`/api/v1/admin/orders?q=${encodeURIComponent(userEmail)}`, { token: adminToken });
  check('Müşteri e-postasıyla arama çalıştı', searched.data?.data?.totalOrders === 2);

  // --- 3. Kullanıcı yönetimi ---
  const userList = await api(`/api/v1/admin/users?q=${encodeURIComponent(userEmail)}`, { token: adminToken });
  check('Kullanıcı arandı', userList.data?.data?.totalUsers === 1);

  const detail = await api(`/api/v1/admin/users/${user._id}`, { token: adminToken });
  const rec = detail.data?.data?.record;
  check('Sicil doğru (2 sipariş, 220 harcama)',
    rec?.totalOrders === 2 && rec?.totalSpent === 220);

  const ban = await api(`/api/v1/admin/users/${user._id}/ban`, { method: 'PATCH', token: adminToken });
  check('Kullanıcı banlandı', ban.status === 200 && Boolean(ban.data?.data?.user?.bannedAt));

  const bannedLogin = await api('/api/v1/users/login', {
    method: 'POST', body: { email: userEmail, password: 'sifre-1234' },
  });
  check('Banlı kullanıcı giriş yapamadı (403)', bannedLogin.status === 403);

  const unban = await api(`/api/v1/admin/users/${user._id}/unban`, { method: 'PATCH', token: adminToken });
  check('Engel kaldırıldı', unban.status === 200 && unban.data?.data?.user?.bannedAt === null);

  // --- 4. Finans: komisyon + dekont referanslı ödeme ---
  const fin = await api('/api/v1/admin/finance/overview', { token: adminToken });
  const row = fin.data?.data?.rows?.find((r) => String(r.businessId) === String(biz._id));
  // Additive markup: biz.commissionRate=%20 → basePrice=100, price=120
  // Ama biz testde amount=110, baseAmount=100 gibi oluşturduk (default %10)
  // gross = 2*110 = 220, net(baseAmount) = 2*100 = 200, platformEarning = 20
  check('Hakediş satırı doğru hesaplandı (brüt 220, platform farkı 20, net 200)',
    fin.status === 200 && row?.gross === 220 && row?.platformEarning === 20 && row?.net === 200 && row?.pending === 200);

  const pay = await api('/api/v1/admin/finance/payouts', {
    method: 'POST', token: adminToken, body: { businessId: String(biz._id), reference: `DEKONT-${tag}` },
  });
  check('Hakediş dekont referansıyla ödendi',
    pay.status === 201 && pay.data?.data?.payout?.netAmount === 200 && pay.data?.data?.payout?.reference === `DEKONT-${tag}`);

  const payAgain = await api('/api/v1/admin/finance/payouts', {
    method: 'POST', token: adminToken, body: { businessId: String(biz._id) },
  });
  check('Bakiye sıfırken tekrar ödeme reddedildi (409)', payAgain.status === 409);

  // --- 5. Yorum moderasyonu ---
  const reviews = await api('/api/v1/admin/reviews?maxRating=2', { token: adminToken });
  check('Düşük puan filtresi yorumu buldu',
    reviews.status === 200 && reviews.data?.data?.reviews?.some((r) => String(r._id) === String(review._id)));

  const del = await api(`/api/v1/admin/reviews/${review._id}`, { method: 'DELETE', token: adminToken });
  check('Yorum silindi', del.status === 200, `Got status ${del.status}: ${JSON.stringify(del.data)}`);

  const delAgain = await api(`/api/v1/admin/reviews/${review._id}`, { method: 'DELETE', token: adminToken });
  check('Silinen yorum tekrar silinemedi (404)', delAgain.status === 404);

  // --- Temizlik ---
  await Review.deleteMany({ business: biz._id });
  await Order.deleteMany({ business: biz._id });
  await SurpriseBox.deleteMany({ business: biz._id });
  await Payout.deleteMany({ business: biz._id });
  await Business.deleteOne({ _id: biz._id });
  await User.deleteOne({ _id: user._id });
  await AdminUser.deleteOne({ email: adminEmail });

  console.log(`\nSonuç: ${passed} geçti, ${failed} kaldı\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });

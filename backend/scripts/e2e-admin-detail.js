// Admin "İşletme Detay" duman testi:
//   profil PATCH → sipariş listesi → kutu stok/fiyat müdahalesi →
//   finans özeti/hakediş durum geçişi → çalışan yetki/silme
// Kullanım: API açıkken `node scripts/e2e-admin-detail.js`
const env = require('../config/env');
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const Business = require('../models/Business');
const SurpriseBox = require('../models/SurpriseBox');
const Order = require('../models/Order');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Payout = require('../models/Payout');
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
  console.log(`\nArtı admin işletme-detay duman testi — ${BASE}\n`);

  // --- Aktörler ---
  const adminEmail = `e2e-detail-admin-${tag}@arti.dev`;
  await AdminUser.create({ email: adminEmail, password: 'e2e-admin-sifresi-123', role: 'superadmin' });
  const adminLogin = await api('/api/v1/admin/login', {
    method: 'POST', body: { email: adminEmail, password: 'e2e-admin-sifresi-123' },
  });
  const adminToken = adminLogin.data?.accessToken;

  const biz = await Business.create({
    name: 'E2E Detay Fırın',
    email: `e2e-detail-biz-${tag}@arti.dev`,
    phone: '02121112233',
    password: 'sifre-1234',
    address: 'Test Mah. No:1',
    businessType: 'firin',
    status: 'APPROVED',
    boxContents: ['unlu'],
    kvkkConsentAt: new Date(),
    iban: 'TR000000000000000000000001',
    ibanOwner: 'E2E A.Ş.',
  });
  const user = await User.create({
    name: 'E2E Detay Müşteri', email: `e2e-detail-user-${tag}@arti.dev`,
    password: 'sifre-1234', kvkkConsentAt: new Date(),
  });
  const box = await SurpriseBox.create({
    business: biz._id, businessName: biz.name, date: todayIstanbul(),
    basePrice: 100, price: 110, originalPrice: 300, initialStock: 5, remaining: 5, contents: ['unlu'],
  });
  await Order.create([
    { user: user._id, business: biz._id, box: box._id, amount: 110, baseAmount: 100, status: 'PICKED_UP', idempotencyKey: `e2e-det-${tag}-1`, usedAt: new Date() },
    { user: user._id, business: biz._id, box: box._id, amount: 110, baseAmount: 100, status: 'PAID', idempotencyKey: `e2e-det-${tag}-2` },
  ]);
  const employee = await Employee.create({
    business: biz._id, allowedBranches: [biz._id], name: 'E2E Çalışan',
    email: `e2e-detail-emp-${tag}@arti.dev`, password: 'sifre-1234', allowedPages: ['kutu'],
  });
  const payout = await Payout.create({
    business: biz._id, periodStart: new Date(Date.now() - 7 * 86400000), periodEnd: new Date(),
    totalOrders: 1, netAmount: 100, status: 'PENDING',
  });
  check('Aktörler hazır', Boolean(adminToken));

  // --- 1. Detay + istatistikler ---
  const detail = await api(`/api/v1/admin/businesses/${biz._id}`, { token: adminToken });
  check('Detay geldi (VKN çözümü dahil)', detail.status === 200 && detail.data?.data?.business?.name === 'E2E Detay Fırın');
  const stats = detail.data?.data?.stats;
  check('İstatistikler doğru (2 sipariş, 1 çalışan, bugün kutu var)',
    stats?.orderCount === 2 && stats?.employeeCount === 1 && stats?.todayPublished === true);

  // --- 2. Profil PATCH ---
  const patch = await api(`/api/v1/admin/businesses/${biz._id}/profile`, {
    method: 'PATCH', token: adminToken, body: { contactName: 'E2E Yetkili', defaultPrice: 90, defaultOriginalPrice: 300 },
  });
  check('Profil güncellendi', patch.status === 200 && patch.data?.data?.business?.contactName === 'E2E Yetkili');

  const badPatch = await api(`/api/v1/admin/businesses/${biz._id}/profile`, {
    method: 'PATCH', token: adminToken, body: { defaultPrice: 500, defaultOriginalPrice: 300 },
  });
  check('Mantıksız fiyat reddedildi (400)', badPatch.status === 400);

  const noAuth = await api(`/api/v1/admin/businesses/${biz._id}/profile`, {
    method: 'PATCH', body: { contactName: 'Korsan' },
  });
  check('Tokensız istek reddedildi (401)', noAuth.status === 401);

  // --- 2b. Vitrin: admin adına görsel yükleme ---
  const presign = await api(`/api/v1/admin/businesses/${biz._id}/uploads/presign`, {
    method: 'POST', token: adminToken, body: { kind: 'cover', contentType: 'image/png' },
  });
  const grant = presign.data?.data;
  check('Admin presign aldı (işletme klasörüne imzalı)',
    presign.status === 200 && Boolean(grant?.uploadUrl) && grant?.key?.startsWith(`business/${biz._id}/cover-`));

  const put = await fetch(grant.uploadUrl, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: Buffer.from('89504e470d0a1a0a', 'hex'),
  });
  check('Dosya PUT edildi', put.ok);

  const setImg = await api(`/api/v1/admin/businesses/${biz._id}/profile/images`, {
    method: 'PATCH', token: adminToken, body: { coverUrl: grant.publicUrl },
  });
  check('Kapak profile yazıldı', setImg.status === 200 && setImg.data?.data?.business?.coverUrl === grant.publicUrl);

  const foreignImg = await api(`/api/v1/admin/businesses/${biz._id}/profile/images`, {
    method: 'PATCH', token: adminToken, body: { coverUrl: 'https://kotu-site.com/x.png' },
  });
  check('Dış URL görsel reddedildi (400)', foreignImg.status === 400);

  // --- 3. Siparişler ---
  const orders = await api(`/api/v1/admin/businesses/${biz._id}/orders?status=PAID`, { token: adminToken });
  check('Sipariş filtresi çalışıyor (1 PAID)',
    orders.status === 200 && orders.data?.data?.totalOrders === 1 && orders.data?.data?.orders?.[0]?.status === 'PAID');

  // --- 4. Kutu müdahalesi ---
  const stokArtir = await api(`/api/v1/admin/businesses/${biz._id}/boxes/today`, {
    method: 'PATCH', token: adminToken, body: { remaining: 8, basePrice: 120 },
  });
  const patchedBox = stokArtir.data?.data?.box;
  check('Stok artışı ek stok olarak işlendi (5→8, extra 3)',
    stokArtir.status === 200 && patchedBox?.remaining === 8 && patchedBox?.extraStock === 3 && patchedBox?.basePrice === 120);

  const stokAzalt = await api(`/api/v1/admin/businesses/${biz._id}/boxes/today`, {
    method: 'PATCH', token: adminToken, body: { remaining: 6 },
  });
  check('Stok azaltma yalnızca kalanı düşürdü (8→6)',
    stokAzalt.status === 200 && stokAzalt.data?.data?.box?.remaining === 6 && stokAzalt.data?.data?.box?.extraStock === 3);

  const kotuFiyat = await api(`/api/v1/admin/businesses/${biz._id}/boxes/today`, {
    method: 'PATCH', token: adminToken, body: { basePrice: 300 },
  });
  check('İndirimli fiyat ≥ değer reddedildi (400)', kotuFiyat.status === 400);

  // --- 5. Finans ---
  const finance = await api(`/api/v1/admin/businesses/${biz._id}/finance`, { token: adminToken });
  const ov = finance.data?.data?.overview;
  // Additive markup modeli: basePrice=100, rate=%10 → müşteri 110 öder, işletme 100 alır, platform 10 alır
  // PICKED_UP sipariş: gross=110, netEarned(baseAmount)=100, platformEarning=10, pendingBalance=100 (işletmeye borç)
  check('Finans özeti doğru (brüt 110, platform farkı 10, işletme 100 bekliyor)',
    finance.status === 200 && ov?.netEarned === 100 && ov?.platformEarning === 10 && ov?.pendingBalance === 100 && ov?.iban?.length > 0);
  check('Hakediş listelendi', finance.data?.data?.payouts?.length === 1);

  const paidMark = await api(`/api/v1/admin/payouts/${payout._id}`, {
    method: 'PATCH', token: adminToken, body: { status: 'PAID' },
  });
  check('Hakediş PAID işaretlendi (tarih damgalı)',
    paidMark.status === 200 && paidMark.data?.data?.payout?.status === 'PAID' && Boolean(paidMark.data?.data?.payout?.payoutDate));

  const finance2 = await api(`/api/v1/admin/businesses/${biz._id}/finance`, { token: adminToken });
  check('Ödeme sonrası bekleyen bakiye sıfırlandı', finance2.data?.data?.overview?.pendingBalance === 0);

  // --- 6. Ekip ---
  const team = await api(`/api/v1/admin/businesses/${biz._id}/employees`, { token: adminToken });
  check('Çalışanlar listelendi', team.status === 200 && team.data?.data?.employees?.length === 1);

  const empPatch = await api(`/api/v1/admin/employees/${employee._id}`, {
    method: 'PATCH', token: adminToken, body: { allowedPages: ['kutu', 'siparisler', 'vitrin'] },
  });
  check('Çalışan yetkileri güncellendi',
    empPatch.status === 200 && empPatch.data?.data?.employee?.allowedPages?.length === 3);

  const empDel = await api(`/api/v1/admin/employees/${employee._id}`, { method: 'DELETE', token: adminToken });
  check('Çalışan silindi', empDel.status === 200);

  const teamAfter = await api(`/api/v1/admin/businesses/${biz._id}/employees`, { token: adminToken });
  check('Silme sonrası liste boş', teamAfter.data?.data?.employees?.length === 0);

  // --- Temizlik ---
  await Order.deleteMany({ business: biz._id });
  await SurpriseBox.deleteMany({ business: biz._id });
  await Payout.deleteMany({ business: biz._id });
  await Employee.deleteMany({ business: biz._id });
  await Business.deleteOne({ _id: biz._id });
  await User.deleteOne({ _id: user._id });
  await AdminUser.deleteOne({ email: adminEmail });

  console.log(`\nSonuç: ${passed} geçti, ${failed} kaldı\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });

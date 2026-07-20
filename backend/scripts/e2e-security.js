// Güvenlik regresyon testi — RBAC (çalışan yetki sınırları), admin işletme
// oluşturma (çift-hash yok) ve regex arama enjeksiyon koruması.
// Bu açıklar yayına alınmadan kapatıldı; test onların geri gelmesini engeller.
// Kullanım: API açıkken `node scripts/e2e-security.js`
const env = require('../config/env');
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Employee = require('../models/Employee');
const AdminUser = require('../models/AdminUser');
const Order = require('../models/Order');
const SurpriseBox = require('../models/SurpriseBox');

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
  console.log(`\nArtı güvenlik regresyon testi — ${BASE}\n`);

  const biz = await Business.create({
    name: 'Güvenlik E2E', email: `e2e-sec-biz-${tag}@arti.dev`, phone: `0212${String(tag).slice(-7)}`,
    password: 'sifre-1234', address: 'Test Mah. No:1', businessType: 'firin',
    status: 'APPROVED', kvkkConsentAt: new Date(), iban: 'TR_ESAS_IBAN', ibanOwner: 'Esas Sahip',
    defaultPrice: 100, defaultOriginalPrice: 300, defaultPackageCount: 5, pickupStart: '18:00', pickupEnd: '21:00',
  });
  await Employee.create({
    business: biz._id, allowedBranches: [biz._id], name: 'Kısıtlı Çalışan',
    email: `e2e-sec-emp-${tag}@arti.dev`, password: 'sifre-1234', allowedPages: ['kutu'], // finans/profil YOK
  });
  // 'ayarlar' yetkili çalışan — oturum/şifre yalıtımı testleri için
  await Employee.create({
    business: biz._id, allowedBranches: [biz._id], name: 'Ayarlar Çalışanı',
    email: `e2e-sec-emp2-${tag}@arti.dev`, password: 'emp-sifre-1234', allowedPages: ['ayarlar'],
  });
  const adminEmail = `e2e-sec-admin-${tag}@arti.dev`;
  await AdminUser.create({ email: adminEmail, password: 'admin-sifre-123', role: 'superadmin' });

  const empTok = (await api('/api/v1/business/login', { method: 'POST', body: { email: `e2e-sec-emp-${tag}@arti.dev`, password: 'sifre-1234' } })).data?.accessToken;
  const ownerTok = (await api('/api/v1/business/login', { method: 'POST', body: { email: `e2e-sec-biz-${tag}@arti.dev`, password: 'sifre-1234' } })).data?.accessToken;
  const adminTok = (await api('/api/v1/admin/login', { method: 'POST', body: { email: adminEmail, password: 'admin-sifre-123' } })).data?.accessToken;
  check('Aktörler hazır', Boolean(empTok && ownerTok && adminTok));

  // --- RBAC: kısıtlı çalışan (allowedPages=['kutu']) hassas uçlara giremez ---
  const ibanTry = await api('/api/v1/business/finance/iban', { method: 'PATCH', token: empTok, body: { iban: 'TR_CALISAN', ibanOwner: 'Kötü' } });
  const ibanAfter = (await Business.findById(biz._id).select('iban')).iban;
  check('Çalışan IBAN değiştiremez (403, DB değişmedi)', ibanTry.status === 403 && ibanAfter === 'TR_ESAS_IBAN');
  check('Çalışan finans göremez (403)', (await api('/api/v1/business/finance/overview', { token: empTok })).status === 403);
  check('Çalışan profil değiştiremez (403)', (await api('/api/v1/business/profile', { method: 'PATCH', token: empTok, body: { whatsappPhone: '05559998877' } })).status === 403);
  check('Çalışan şube açamaz (403)', (await api('/api/v1/business/branches', { method: 'POST', token: empTok, body: { name: 'Sahte', address: 'Adres No 5', phone: '02120001122' } })).status === 403);
  check('Çalışan çalışan ekleyemez (403)', (await api('/api/v1/business/employees', { method: 'POST', token: empTok, body: { name: 'X', email: `x-${tag}@arti.dev`, password: 'sifre-1234' } })).status === 403);

  // 'kutu' yetkisi olan çalışan izinli işini yapabilir
  const boxOk = await api('/api/v1/business/boxes', { method: 'POST', token: empTok, body: { basePrice: 100, originalPrice: 300, initialStock: 5, contents: ['unlu'], pickupStart: '18:00', pickupEnd: '21:00' } });
  check('Çalışan izinli kutu işini yapabilir (2xx)', boxOk.status >= 200 && boxOk.status < 300);

  // --- Ana işletme sahibi kısıtlı değil ---
  check('Sahip IBAN değiştirebilir (200)', (await api('/api/v1/business/finance/iban', { method: 'PATCH', token: ownerTok, body: { iban: 'TR_YENI', ibanOwner: 'Esas Sahip' } })).status === 200);
  check('Sahip finans görebilir (200)', (await api('/api/v1/business/finance/overview', { token: ownerTok })).status === 200);

  // --- Admin işletme oluşturur → çift hash yok, hesap giriş yapabilir ---
  const created = await api('/api/v1/admin/businesses', {
    method: 'POST', token: adminTok,
    body: { name: 'Yeni İşletme', email: `e2e-sec-yeni-${tag}@arti.dev`, phone: `0555${String(tag).slice(-7)}`, password: 'yeni-sifre-1234', address: 'Adres Mah No 9', businessType: 'kafe' },
  });
  const newLogin = await api('/api/v1/business/login', { method: 'POST', body: { email: `e2e-sec-yeni-${tag}@arti.dev`, password: 'yeni-sifre-1234' } });
  check('Admin oluşturduğu hesap giriş yapabilir (201 + 200)', created.status === 201 && newLogin.status === 200);

  // --- Regex enjeksiyon: özel karakterli arama sunucuyu kırmaz ---
  check('Regex-özel arama güvenli (200)', (await api(`/api/v1/admin/users?q=${encodeURIComponent('(a+)+$[')}`, { token: adminTok })).status === 200);

  // --- Oturumlar & şifre: çoklu oturum + çalışan/işletme yalıtımı ---
  // Çoklu oturum: sahip ikinci kez giriş yaparsa ilk oturum SİLİNMEMELİ (her giriş
  // diğer cihazları eziyordu — atomik $push ile çözüldü).
  await api('/api/v1/business/login', { method: 'POST', body: { email: `e2e-sec-biz-${tag}@arti.dev`, password: 'sifre-1234' } });
  const ownerSessions = (await Business.findById(biz._id).select('+sessions')).sessions || [];
  check('Çoklu oturum korunuyor (2. giriş 1.\'yi silmedi)', ownerSessions.length >= 2, `count=${ownerSessions.length}`);

  // Yetki: 'ayarlar' olmayan çalışan oturum/şifre uçlarına giremez (403)
  check('kutu-çalışanı oturumları göremez (403)', (await api('/api/v1/business/sessions', { token: empTok })).status === 403);
  check('kutu-çalışanı şifre değiştiremez (403)', (await api('/api/v1/business/change-password', { method: 'POST', token: empTok, body: { currentPassword: 'sifre-1234', newPassword: 'yeni-sifre-1234' } })).status === 403);

  // Yalıtım: 'ayarlar' yetkili çalışan YALNIZCA kendi oturumunu görür (sahibinkini değil)
  const emp2Tok = (await api('/api/v1/business/login', { method: 'POST', body: { email: `e2e-sec-emp2-${tag}@arti.dev`, password: 'emp-sifre-1234' } })).data?.accessToken;
  const emp2Sessions = await api('/api/v1/business/sessions', { token: emp2Tok });
  check('Çalışan yalnızca KENDİ oturumunu görüyor (sahibin 2 değil, 1)',
    emp2Sessions.status === 200 && (emp2Sessions.data?.sessions || []).length === 1,
    `count=${(emp2Sessions.data?.sessions || []).length}`);

  // Yalıtım: çalışan, sahibin şifresiyle değiştiremez; işlem KENDİ hesabında yürür
  check('Çalışan, sahibin şifresiyle değiştiremez (401)',
    (await api('/api/v1/business/change-password', { method: 'POST', token: emp2Tok, body: { currentPassword: 'sifre-1234', newPassword: 'baska-sifre-123' } })).status === 401);
  check('Çalışan kendi şifresini değiştirebilir (200)',
    (await api('/api/v1/business/change-password', { method: 'POST', token: emp2Tok, body: { currentPassword: 'emp-sifre-1234', newPassword: 'emp-yeni-1234' } })).status === 200);
  const ownerStillLogin = await api('/api/v1/business/login', { method: 'POST', body: { email: `e2e-sec-biz-${tag}@arti.dev`, password: 'sifre-1234' } });
  check('Sahip şifresi çalışan tarafından DEĞİŞTİRİLMEDİ (200)', ownerStillLogin.status === 200);

  // --- Temizlik ---
  const bizIds = (await Business.find({ email: new RegExp(`e2e-sec-(biz|yeni)-${tag}`) }).select('_id')).map((b) => b._id);
  await Order.deleteMany({ business: { $in: bizIds } });
  await SurpriseBox.deleteMany({ business: { $in: bizIds } });
  await Employee.deleteMany({ business: { $in: bizIds } });
  await Business.deleteMany({ email: new RegExp(`e2e-sec-(biz|yeni)-${tag}`) });
  await AdminUser.deleteOne({ email: adminEmail });

  console.log(`\nSonuç: ${passed} geçti, ${failed} kaldı\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });

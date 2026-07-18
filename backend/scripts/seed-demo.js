// Admin panelini dolu görmek için demo veri tohumlar (yalnızca dev).
// Tekrar çalıştırmak güvenlidir; önce kendi eski demo kayıtlarını temizler.
// Kullanım: node scripts/seed-demo.js   (temizlik: node scripts/seed-demo.js --temizle)
const env = require('../config/env');
const mongoose = require('mongoose');
const Business = require('../models/Business');
const OutreachLog = require('../models/OutreachLog');
const { todayIstanbul } = require('../utils/time');

const DEMO_FILTER = { email: /@demo\.arti\.dev$/ };

async function main() {
  await mongoose.connect(env.mongoUri);

  const eski = await Business.find(DEMO_FILTER).select('_id');
  await OutreachLog.deleteMany({ business: { $in: eski.map((b) => b._id) } });
  await Business.deleteMany(DEMO_FILTER);

  if (process.argv.includes('--temizle')) {
    console.log('Demo veriler temizlendi.');
    process.exit(0);
  }

  const ortak = {
    phone: '02121112233',
    password: 'demo-sifre-1234',
    address: 'Caferağa Mah. Moda Cad. No:18, Kadıköy/İstanbul',
    boxContents: ['unlu'],
    kvkkConsentAt: new Date(),
    taxNumber: '1234567890',
  };

  // Onay bekleyen başvurular
  await Business.create([
    { ...ortak, name: 'Fırın Meşhur Tahtakale', email: `firin@demo.arti.dev`, businessType: 'firin', status: 'PENDING_APPROVAL' },
    { ...ortak, name: 'Manolya Cafe & Brunch', email: `manolya@demo.arti.dev`, businessType: 'kafe', status: 'PENDING_APPROVAL', defaultPackageCount: 4, defaultPrice: 250, defaultOriginalPrice: 500 },
    { ...ortak, name: 'Yeşil Vadi Manav', email: `manav@demo.arti.dev`, businessType: 'manav', status: 'PENDING_APPROVAL' },
  ]);

  // Onaylı işletme + botun çözemediği WhatsApp cevabı (PENDING_REVIEW)
  const [cevapsiz, fiyatsiz] = await Business.create([
    { ...ortak, name: 'Simit Sarayı Moda', email: `simit@demo.arti.dev`, businessType: 'firin', status: 'APPROVED', whatsappPhone: '05001112233', defaultPackageCount: 5, defaultPrice: 150, defaultOriginalPrice: 400 },
    { ...ortak, name: 'Baklavacı Hüsnü Usta', email: `baklava@demo.arti.dev`, businessType: 'firin', status: 'APPROVED', whatsappPhone: '05004445566' },
  ]);

  const date = todayIstanbul();
  await OutreachLog.create([
    { business: cevapsiz._id, date, status: 'PENDING_REVIEW', sentAt: new Date(Date.now() - 90 * 60000), repliedAt: new Date(Date.now() - 40 * 60000), replyText: 'belki olur abi akşama doğru bakarız kaç tane kalır belli değil' },
    { business: fiyatsiz._id, date, status: 'PENDING_REVIEW', sentAt: new Date(Date.now() - 80 * 60000), repliedAt: new Date(Date.now() - 20 * 60000), replyText: 'bugün 6 tane ayırırım size' },
  ]);

  console.log('Demo veriler tohumlandı:');
  console.log('  • 3 onay bekleyen işletme (İşletme Onayları sekmesi)');
  console.log('  • 2 PENDING_REVIEW WhatsApp cevabı (WhatsApp Kuyruğu sekmesi)');
  console.log('  • "Baklavacı Hüsnü Usta"nın varsayılan fiyatı YOK → Stoka İşle 409 verir (beklenen)');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });

// Admin panelini dolu görmek için demo veri tohumlar (yalnızca dev).
// Tekrar çalıştırmak güvenlidir; önce kendi eski demo kayıtlarını temizler.
// Kullanım: node scripts/seed-demo.js   (temizlik: node scripts/seed-demo.js --temizle)
const env = require('../config/env');
const mongoose = require('mongoose');
const Business = require('../models/Business');
const User = require('../models/User');
const SurpriseBox = require('../models/SurpriseBox');
const Order = require('../models/Order');
const OutreachLog = require('../models/OutreachLog');
const { todayIstanbul } = require('../utils/time');

const DEMO_FILTER = { email: /@demo\.arti\.dev$/ };

async function main() {
  await mongoose.connect(env.mongoUri);

  const eski = await Business.find(DEMO_FILTER).select('_id');
  const eskiIds = eski.map((b) => b._id);
  await OutreachLog.deleteMany({ business: { $in: eskiIds } });
  await Order.deleteMany({ business: { $in: eskiIds } });
  await SurpriseBox.deleteMany({ business: { $in: eskiIds } });
  await Business.deleteMany(DEMO_FILTER);
  await User.deleteMany(DEMO_FILTER);

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

  // --- İşletme paneli demo verisi (Simit Sarayı Moda) ---
  // Bugünün kutusu: 8 açıldı, 5 satıldı, 3 kaldı
  const boxToday = await SurpriseBox.create({
    business: cevapsiz._id,
    businessName: cevapsiz.name,
    date,
    price: 150,
    originalPrice: 400,
    initialStock: 8,
    remaining: 3,
    contents: ['unlu'],
    pickupStart: '18:00',
    pickupEnd: '21:00',
  });

  // Grafik için son 7 güne yayılmış ödenmiş siparişler
  const demoUser = await User.create({
    name: 'Demo Müşteri', email: 'musteri@demo.arti.dev', password: 'demo-sifre-1234', kvkkConsentAt: new Date(),
  });
  const gun = 24 * 60 * 60 * 1000;
  const plan = [ // [kaç gün önce, sipariş adedi]
    [6, 2], [5, 3], [4, 1], [3, 4], [2, 2], [1, 5], [0, 5],
  ];
  const orders = [];
  for (const [daysAgo, count] of plan) {
    for (let i = 0; i < count; i += 1) {
      const created = new Date(Date.now() - daysAgo * gun - (2 + i) * 60 * 60 * 1000);
      orders.push({
        user: demoUser._id,
        business: cevapsiz._id,
        box: boxToday._id,
        amount: 150,
        status: daysAgo === 0 && i >= 3 ? 'PAID' : 'PICKED_UP', // bugünün 2'si henüz teslim edilmedi
        idempotencyKey: `demo-${daysAgo}-${i}-${Date.now()}`,
        reservedAt: created,
        paidAt: created,
        ...(daysAgo === 0 && i >= 3 ? {} : { usedAt: new Date(created.getTime() + 30 * 60000) }),
        createdAt: created,
      });
    }
  }
  await Order.insertMany(orders);

  console.log('Demo veriler tohumlandı:');
  console.log('  • 3 onay bekleyen işletme (Admin → İşletme Onayları)');
  console.log('  • 2 PENDING_REVIEW WhatsApp cevabı (Admin → WhatsApp Kuyruğu)');
  console.log('  • "Baklavacı Hüsnü Usta"nın varsayılan fiyatı YOK → Stoka İşle 409 verir (beklenen)');
  console.log('  • İşletme paneli: simit@demo.arti.dev / demo-sifre-1234');
  console.log(`    → 7 güne yayılmış ${orders.length} sipariş, bugünün kutusu 8/3 (satılan 5)`);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });

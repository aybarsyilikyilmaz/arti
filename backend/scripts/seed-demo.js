// Admin panelini dolu görmek için demo veri tohumlar (yalnızca dev).
// Tekrar çalıştırmak güvenlidir; önce kendi eski demo kayıtlarını temizler.
// Kullanım: node scripts/seed-demo.js   (temizlik: node scripts/seed-demo.js --temizle)
const env = require('../config/env');
const mongoose = require('mongoose');
const Business = require('../models/Business');
const User = require('../models/User');
const SurpriseBox = require('../models/SurpriseBox');
const Order = require('../models/Order');
const Employee = require('../models/Employee');
const Payout = require('../models/Payout');
const Review = require('../models/Review');
const { todayIstanbul } = require('../utils/time');

const DEMO_FILTER = { email: /@demo\.arti\.dev$/ };

async function main() {
  await mongoose.connect(env.mongoUri);

  const eski = await Business.find(DEMO_FILTER).select('_id');
  const eskiIds = eski.map((b) => b._id);
  await Employee.deleteMany({ $or: [{ business: { $in: eskiIds } }, DEMO_FILTER] });
  await Payout.deleteMany({ business: { $in: eskiIds } });
  await Review.deleteMany({ business: { $in: eskiIds } });
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
    password: 'artidemo123',
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

  // Onaylı işletme
  const [cevapsiz, fiyatsiz] = await Business.create([
    { ...ortak, name: 'Simit Sarayı Moda', email: `simit@demo.arti.dev`, businessType: 'firin', status: 'APPROVED', whatsappPhone: '05001112233', defaultPackageCount: 5, defaultPrice: 150, defaultOriginalPrice: 400, iban: 'TR33 0006 1005 1978 6457 8413 26', ibanOwner: 'Simit Sarayı Gıda A.Ş.', payoutPeriod: 'weekly' },
    { ...ortak, name: 'Baklavacı Hüsnü Usta', email: `baklava@demo.arti.dev`, businessType: 'firin', status: 'APPROVED', whatsappPhone: '05004445566' },
  ]);

  const date = todayIstanbul();

  // --- İşletme paneli demo verisi (Simit Sarayı Moda) ---
  // Bugünün kutusu: 8 açıldı, 5 satıldı, 3 kaldı
  const boxToday = await SurpriseBox.create({
    business: cevapsiz._id,
    businessName: cevapsiz.name,
    date,
    basePrice: 150,
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

  // Admin "İşletme Detay" sekmeleri boş görünmesin: 1 çalışan + 2 hakediş
  await Employee.create({
    business: cevapsiz._id,
    allowedBranches: [cevapsiz._id],
    name: 'Demo Çalışan',
    email: 'calisan@demo.arti.dev',
    password: 'artidemo123',
    allowedPages: ['kutu', 'siparisler'],
  });
  await Payout.create([
    {
      business: cevapsiz._id,
      periodStart: new Date(Date.now() - 14 * gun),
      periodEnd: new Date(Date.now() - 7 * gun),
      totalOrders: 9,
      netAmount: 1350,
      status: 'PAID',
      ibanUsed: 'TR33 0006 1005 1978 6457 8413 26',
      ibanOwnerUsed: 'Simit Sarayı Gıda A.Ş.',
      payoutDate: new Date(Date.now() - 6 * gun),
    },
    {
      business: cevapsiz._id,
      periodStart: new Date(Date.now() - 7 * gun),
      periodEnd: new Date(),
      totalOrders: 12,
      netAmount: 1800,
      status: 'PENDING',
      ibanUsed: 'TR33 0006 1005 1978 6457 8413 26',
      ibanOwnerUsed: 'Simit Sarayı Gıda A.Ş.',
    },
  ]);

  // Yorum moderasyonu ekranı için örnek değerlendirmeler (teslim alınan siparişlere)
  const inserted = await Order.find({ business: cevapsiz._id, status: 'PICKED_UP' }).sort('createdAt').limit(3);
  if (inserted.length >= 3) {
    await Review.create([
      { user: demoUser._id, business: cevapsiz._id, order: inserted[0]._id, rating: 5, comment: 'Kutu dopdoluydu, simitler taptaze. Kesinlikle tekrar alırım!' },
      { user: demoUser._id, business: cevapsiz._id, order: inserted[1]._id, rating: 4, comment: 'Güzeldi ama poğaçalar biraz soğumuştu.' },
      { user: demoUser._id, business: cevapsiz._id, order: inserted[2]._id, rating: 1, comment: 'Berbat! Yarısı bayattı, param çöpe gitti. Kimse almasın!!' },
    ]);
  }

  console.log('Demo veriler tohumlandı:');
  console.log('  • 3 onay bekleyen işletme (Admin → İşletme Onayları)');
  console.log('  • 2 PENDING_REVIEW WhatsApp cevabı (Admin → WhatsApp Kuyruğu)');
  console.log('  • "Baklavacı Hüsnü Usta"nın varsayılan fiyatı YOK → Stoka İşle 409 verir (beklenen)');
  console.log('  • İşletme paneli: simit@demo.arti.dev / artidemo123');
  console.log(`    → 7 güne yayılmış ${orders.length} sipariş, bugünün kutusu 8/3 (satılan 5)`);
  console.log('  • Admin → İşletme Detay: 1 demo çalışan + 2 hakediş (1 PAID, 1 PENDING) + IBAN');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });

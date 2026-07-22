// Admin panelini + müşteri keşfetini dolu görmek için demo veri tohumlar (yalnızca dev).
// Tekrar çalıştırmak güvenlidir; önce kendi eski demo kayıtlarını (@demo.arti.dev) temizler.
// Kullanım: node scripts/seed-demo.js   (temizlik: node scripts/seed-demo.js --temizle)
//
// NOT: Kapak/logo görselleri backend/uploads/business/<id>/ altında gerçek dosyalardır
// (statik sunum dosya yoluna bakar, işletme _id'sine değil — kayıt yeniden yaratılsa da açılır).
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
const base = env.publicApiUrl; // http://localhost:5002
const img = (folder, file) => `${base}/uploads/business/${folder}/${file}`;

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
    city: 'İstanbul',
    district: 'Kadıköy',
    boxContents: ['unlu'],
    kvkkConsentAt: new Date(),
    taxNumber: '1234567890',
  };

  const date = todayIstanbul();

  // Onay bekleyen başvurular (Admin → İşletme Onayları)
  await Business.create([
    { ...ortak, name: 'Fırın Meşhur Tahtakale', email: `firin@demo.arti.dev`, businessType: 'firin', status: 'PENDING_APPROVAL' },
    { ...ortak, name: 'Manolya Cafe & Brunch', email: `manolya@demo.arti.dev`, businessType: 'kafe', status: 'PENDING_APPROVAL', defaultPackageCount: 4, defaultPrice: 250, defaultOriginalPrice: 500 },
  ]);

  // GeoJSON konum yardımcısı: [boylam, enlem]
  const pt = (lng, lat) => ({ type: 'Point', coordinates: [lng, lat] });

  // SABİT _id'ler: reseed işletme kimliğini değiştirmesin ki elle açılan talep/
  // favori gibi ilişkili kayıtlar öksüz kalmasın (a171 = "artı" hatırlatıcı).
  const oid = (s) => new mongoose.Types.ObjectId(s);
  const SIMIT_ID = oid('a17100000000000000000001');

  // --- Ana panel demo işletmesi: Simit Sarayı Moda (fotoğraflı) ---
  const simitLoc = pt(29.0264, 40.9825); // Moda
  const cevapsiz = await Business.create({
    _id: SIMIT_ID,
    ...ortak, name: 'Simit Sarayı Moda', email: `simit@demo.arti.dev`, businessType: 'firin', status: 'APPROVED',
    whatsappPhone: '05001112233', defaultPackageCount: 5, defaultPrice: 150, defaultOriginalPrice: 400,
    iban: 'TR33 0006 1005 1978 6457 8413 26', ibanOwner: 'Simit Sarayı Gıda A.Ş.', payoutPeriod: 'weekly',
    description: 'Her sabah taze simit, poğaça ve açma. Gün sonu kalanları kutuda çok uygun fiyata.',
    location: simitLoc,
    coverUrl: img('6a5d56e5809c4707359a9c76', 'cover-96cb82fc4168f50d.jpg'),
    logoUrl: img('6a5d56e5809c4707359a9c76', 'logo-32bd4bf7adfad0eb.png'),
    detailUrl: img('6a5d56e5809c4707359a9c76', 'cover-96cb82fc4168f50d.jpg'),
  });

  // Bugünün kutusu: 8 açıldı, 5 satıldı, 3 kaldı (price = basePrice + %10 markup)
  const boxToday = await SurpriseBox.create({
    business: cevapsiz._id, businessName: cevapsiz.name, date,
    basePrice: 150, price: 165, originalPrice: 400,
    initialStock: 8, remaining: 3, contents: ['unlu', 'ekler'],
    pickupStart: '18:00', pickupEnd: '21:00', location: simitLoc,
  });

  // --- Diğer keşfet işletmeleri: her biri fotoğraflı + bugünün kutusuyla ---
  // folder = uploads/business/<id> (silinen kayıtların hayatta kalan görselleri)
  const SHOPS = [
    { name: 'Mis Pastane', email: 'mis@demo.arti.dev', type: 'kafe', folder: '6a5d56e5809c4707359a9c77', id: 'a17100000000000000000002',
      cover: 'cover-618f42ab3b2fb909.jpg', logo: 'logo-1a9abac2c2fad1a0.jpg', coords: [29.0290, 40.9860],
      base: 120, orig: 350, contents: ['tatli', 'unlu'], stock: 8, remaining: 5, start: '19:00', end: '21:00',
      desc: 'Ev yapımı pasta, kurabiye ve tatlılar. Vitrinde kalanlar sürpriz kutuda.' },
    { name: 'Yeşil Vadi Manav', email: 'yesilvadi@demo.arti.dev', type: 'manav', folder: '6a5d56e5809c4707359a9c78', id: 'a17100000000000000000003',
      cover: 'cover-d302e36ea7f2c0aa.jpg', logo: 'logo-0961072a7b2a05a9.jpg', coords: [29.0230, 40.9900],
      base: 120, orig: 350, contents: ['manav', 'vegan'], stock: 6, remaining: 4, start: '20:00', end: '20:30',
      desc: 'Günlük taze meyve ve sebze. İsraf olmasın diye gün sonu kutusu.' },
    { name: 'Baklavacı Hüsnü Usta', email: 'baklava@demo.arti.dev', type: 'firin', folder: '6a5d56e6809c4707359a9c7d', id: 'a17100000000000000000004',
      cover: 'cover-3d757a79bf47a84f.jpg', logo: 'logo-07e9cfa3f49aeb8d.png', whatsapp: '05004445566', coords: [29.0310, 40.9840],
      base: 200, orig: 700, contents: ['tatli', 'unlu'], stock: 8, remaining: 6, start: '20:30', end: '21:00',
      desc: 'Antep fıstıklı baklava ve şöbiyet. Günün sonunda taze kalanlar yarı fiyatına.' },
    { name: 'Bizim Manav', email: 'bizimmanav@demo.arti.dev', type: 'manav', folder: '6a5d56e6809c4707359a9c83', id: 'a17100000000000000000005',
      cover: 'cover-40bcbc3801e23066.jpg', logo: 'logo-d4398e29c29512ca.jpg', coords: [29.0250, 40.9880],
      base: 60, orig: 180, contents: ['manav'], stock: 8, remaining: 2, start: '19:00', end: '21:00',
      desc: 'Mahallenin manavı — mevsim meyveleri ve yeşillikler karışık kutuda.' },
    { name: 'Deniz Restoran', email: 'deniz@demo.arti.dev', type: 'restoran', folder: '6a5d56e6809c4707359a9c84', id: 'a17100000000000000000006',
      cover: 'cover-fd1af1889f63a25d.jpg', logo: 'logo-a1f0fb624f4bb96f.png', coords: [29.0360, 40.9775],
      base: 200, orig: 550, contents: ['sicak', 'sandvic'], stock: 8, remaining: 5, start: '21:00', end: '22:30',
      desc: 'Deniz kenarında sıcak yemek ve mezeler. Servis sonu kalanları kutuda.' },
    { name: 'Köşe Şarküteri', email: 'kose@demo.arti.dev', type: 'market', folder: '6a5d56e6809c4707359a9c85', id: 'a17100000000000000000007',
      cover: 'cover-efcddc585e62adc3.jpg', logo: 'logo-8dbf6811d856a403.png', coords: [29.0280, 40.9910],
      base: 90, orig: 250, contents: ['sarkuteri', 'et'], stock: 8, remaining: 5, start: '18:30', end: '20:30',
      desc: 'Şarküteri ürünleri ve hazır yemekler. Gün sonu ürünleri uygun fiyata.' },
  ];

  for (const s of SHOPS) {
    const loc = pt(s.coords[0], s.coords[1]);
    const biz = await Business.create({
      _id: oid(s.id),
      ...ortak, name: s.name, email: s.email, businessType: s.type, status: 'APPROVED',
      description: s.desc, boxContents: s.contents, location: loc,
      defaultPackageCount: s.stock, defaultPrice: s.base, defaultOriginalPrice: s.orig,
      pickupStart: s.start, pickupEnd: s.end, ...(s.whatsapp ? { whatsappPhone: s.whatsapp } : {}),
      coverUrl: img(s.folder, s.cover), logoUrl: img(s.folder, s.logo), detailUrl: img(s.folder, s.cover),
    });
    await SurpriseBox.create({
      business: biz._id, businessName: biz.name, date,
      basePrice: s.base, price: Math.round(s.base * 1.1), originalPrice: s.orig,
      initialStock: s.stock, remaining: s.remaining, contents: s.contents,
      pickupStart: s.start, pickupEnd: s.end, location: loc,
    });
  }

  // --- İşletme paneli demo verisi (Simit Sarayı Moda): 7 güne yayılmış siparişler ---
  const demoUser = await User.create({
    name: 'Demo Müşteri', email: 'musteri@demo.arti.dev', password: 'demo-sifre-1234', kvkkConsentAt: new Date(),
  });
  const gun = 24 * 60 * 60 * 1000;
  const plan = [[6, 2], [5, 3], [4, 1], [3, 4], [2, 2], [1, 5], [0, 5]];
  const orders = [];
  for (const [daysAgo, count] of plan) {
    for (let i = 0; i < count; i += 1) {
      const created = new Date(Date.now() - daysAgo * gun - (2 + i) * 60 * 60 * 1000);
      orders.push({
        user: demoUser._id, business: cevapsiz._id, box: boxToday._id,
        amount: 165, baseAmount: 150, // müşteri öder / işletme hakedişi (baseAmount zorunlu)
        status: daysAgo === 0 && i >= 3 ? 'PAID' : 'PICKED_UP',
        idempotencyKey: `demo-${daysAgo}-${i}-${Date.now()}`,
        reservedAt: created, paidAt: created,
        ...(daysAgo === 0 && i >= 3 ? {} : { usedAt: new Date(created.getTime() + 30 * 60000) }),
        createdAt: created,
      });
    }
  }
  await Order.insertMany(orders);

  // Admin "İşletme Detay": 1 çalışan.
  // NOT: Hakediş (Payout) kayıtları seed'lenmez — hakediş geçmişi tamamen dinamiktir;
  // gerçek ödeme yalnızca admin "Öde" dediğinde oluşur (createPayout). Böylece işletme
  // panelindeki "Hakediş Geçmişi" sahte veri göstermez, boş başlar.
  await Employee.create({
    business: cevapsiz._id, allowedBranches: [cevapsiz._id], name: 'Demo Çalışan',
    email: 'calisan@demo.arti.dev', password: 'artidemo123', allowedPages: ['kutu', 'siparisler'],
  });

  // Yorum moderasyonu + puan demosu (teslim alınan siparişlere)
  const inserted = await Order.find({ business: cevapsiz._id, status: 'PICKED_UP' }).sort('createdAt').limit(3);
  if (inserted.length >= 3) {
    await Review.create([
      { user: demoUser._id, business: cevapsiz._id, order: inserted[0]._id, rating: 5, comment: 'Kutu dopdoluydu, simitler taptaze. Kesinlikle tekrar alırım!' },
      { user: demoUser._id, business: cevapsiz._id, order: inserted[1]._id, rating: 4, comment: 'Güzeldi ama poğaçalar biraz soğumuştu.' },
      { user: demoUser._id, business: cevapsiz._id, order: inserted[2]._id, rating: 1, comment: 'Berbat! Yarısı bayattı, param çöpe gitti. Kimse almasın!!' },
    ]);
  }

  console.log('Demo veriler tohumlandı:');
  console.log(`  • Keşfet: ${SHOPS.length + 1} onaylı işletme (fotoğraflı + il/ilçe + bugünün kutusu)`);
  console.log('  • 2 onay bekleyen işletme (Admin → İşletme Onayları)');
  console.log('  • İşletme paneli: simit@demo.arti.dev / artidemo123');
  console.log(`    → 7 güne yayılmış ${orders.length} sipariş, bugünün kutusu 8/3, 3 yorum (puan 3.3)`);
  console.log('  • Admin → İşletme Detay: 1 çalışan + IBAN (hakediş geçmişi dinamik — boş başlar)');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });

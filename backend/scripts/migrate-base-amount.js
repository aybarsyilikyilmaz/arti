// Migration v2: Eski siparişlerde amount = işletme fiyatıydı (markup yoktu).
// Doğru model: baseAmount = eski amount (işletme hakedişi)
//              amount = round(eski amount × (1 + rate/100)) (müşteri ödemesi)

const env = require('../config/env');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Business = require('../models/Business');

async function main() {
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB bağlandı.\n');

  // İşletme ID → commissionRate haritası
  const businesses = await Business.find({}).select('commissionRate').lean();
  const rateMap = new Map(businesses.map((b) => [String(b._id), b.commissionRate ?? 10]));

  // Tüm siparişleri gözden geçir:
  // Eğer amount == round(baseAmount × (1+rate/100)) → yeni modelde kaydedilmiş, dokunma
  // Değilse → eski kayıt: amount = işletme hakedişi, düzelt
  const orders = await Order.find({}).lean();
  console.log(`Toplam sipariş: ${orders.length}`);

  let updated = 0;
  let skipped = 0;

  for (const order of orders) {
    const rate = rateMap.get(String(order.business)) ?? 10;
    const expectedAmount = Math.round((order.baseAmount || 0) * (1 + rate / 100));

    // Yeni modelde doğru kaydedilmiş: amount = baseAmount * (1+rate)
    if (order.baseAmount > 0 && order.amount === expectedAmount) {
      skipped += 1;
      continue;
    }

    // Eski kayıt: amount işletme hakedişi, markup ekle
    const businessEarning = order.amount; // eski amount = işletme fiyatı
    const customerPayment = Math.round(businessEarning * (1 + rate / 100));

    await Order.updateOne(
      { _id: order._id },
      { $set: { baseAmount: businessEarning, amount: customerPayment } }
    );
    updated += 1;
  }

  console.log(`✓ ${updated} sipariş güncellendi (eski kayıt → yeni model)`);
  console.log(`⏭  ${skipped} sipariş atlandı (zaten yeni modelde)`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });

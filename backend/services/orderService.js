// Sipariş durum makinesi — tüm geçişler atomik findOneAndUpdate ile yapılır,
// böylece eşzamanlı isteklerde çifte satış / çifte iade imkânsızdır (PLAN.md §3).
const crypto = require('crypto');
const SurpriseBox = require('../models/SurpriseBox');
const Order = require('../models/Order');
const paymentProvider = require('./payment');
const { makeQrToken, verifyQrToken } = require('../utils/crypto');
const { todayIstanbul } = require('../utils/time');
const env = require('../config/env');
const logger = require('../utils/logger');

// Stok geri salma — yalnızca durum geçişini kazanan çağrı stok iade eder
async function releaseStock(boxId) {
  await SurpriseBox.updateOne({ _id: boxId }, { $inc: { remaining: 1 } });
}

// Fraud frenleri (PLAN.md Faz 4) — stok düşülmeden ÖNCE kontrol edilir ki
// engellenen istek stok churn'u yaratmasın. Limitler env'den ayarlanır.
async function checkFraudLimits(userId) {
  const active = await Order.countDocuments({ user: userId, status: 'RESERVED' });
  if (active >= env.maxActiveReservations) return 'ACTIVE';

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const daily = await Order.countDocuments({
    user: userId,
    createdAt: { $gte: dayAgo },
    status: { $ne: 'EXPIRED' }, // düşen rezervasyonlar kotayı yemez
  });
  if (daily >= env.maxDailyOrders) return 'DAILY';

  return null;
}

// 1) Atomik rezervasyon: son kutuyu aynı anda isteyen N kullanıcıdan yalnızca
//    stok kadarı kazanır; kaybedenlere null döner. Limit aşımında { limited } döner.
async function reserveBox(userId, boxId) {
  const limited = await checkFraudLimits(userId);
  if (limited) return { limited };

  const box = await SurpriseBox.findOneAndUpdate(
    { _id: boxId, date: todayIstanbul(), remaining: { $gt: 0 } },
    { $inc: { remaining: -1 } },
    { new: true }
  );
  if (!box) return null;

  let order;
  try {
    order = await Order.create({
      user: userId,
      business: box.business,
      box: box._id,
      amount: box.price,
      status: 'RESERVED',
      idempotencyKey: crypto.randomUUID(),
    });

    const checkout = await paymentProvider.initCheckout(order);
    order.paymentRef = checkout.paymentRef;
    await order.save();

    return { order, paymentPageUrl: checkout.paymentPageUrl };
  } catch (err) {
    // Rezervasyon sonrası herhangi bir hata: stok geri verilir, sipariş düşürülür
    if (order) await Order.updateOne({ _id: order._id, status: 'RESERVED' }, { status: 'EXPIRED' });
    await releaseStock(box._id);
    throw err;
  }
}

// 2) Ödeme sonucu (webhook): idempotent — aynı callback iki kez gelirse
//    ikinci çağrı durum geçişini kaybeder ve mevcut durumu döner.
async function handlePaymentResult(paymentRef, success) {
  if (success) {
    const verified = await paymentProvider.verifyResult(paymentRef);
    if (!verified.ok) return { outcome: 'INVALID' };

    const order = await Order.findOneAndUpdate(
      { paymentRef, status: 'RESERVED' },
      { status: 'PAID', paidAt: new Date() },
      { new: true }
    );
    if (!order) {
      const existing = await Order.findOne({ paymentRef });
      return { outcome: existing ? `ALREADY_${existing.status}` : 'NOT_FOUND' };
    }

    // QR yalnızca ödeme kesinleşince üretilir
    order.qrToken = makeQrToken(order._id);
    await order.save();
    return { outcome: 'PAID', order };
  }

  // Başarısız ödeme: rezervasyon düşer, stok geri salınır
  const order = await Order.findOneAndUpdate(
    { paymentRef, status: 'RESERVED' },
    { status: 'EXPIRED' },
    { new: true }
  );
  if (order) await releaseStock(order.box);
  return { outcome: order ? 'RELEASED' : 'NOT_FOUND' };
}

// 3) QR teslim doğrulama: imza + tek kullanım + işletme sahipliği tek sorguda
async function verifyPickup(businessId, qrToken) {
  if (!verifyQrToken(qrToken)) return { outcome: 'INVALID_SIGNATURE' };

  const order = await Order.findOneAndUpdate(
    { qrToken, business: businessId, status: 'PAID', usedAt: null },
    { status: 'PICKED_UP', usedAt: new Date() },
    { new: true }
  ).populate('user', 'name');
  if (!order) {
    const existing = await Order.findOne({ qrToken, business: businessId });
    if (!existing) return { outcome: 'NOT_FOUND' };
    return { outcome: `ALREADY_${existing.status}` };
  }
  return { outcome: 'PICKED_UP', order };
}

// 4) Süresi dolan rezervasyonların süpürülmesi.
//    Not: Faz 2'de BullMQ gecikmeli job'a taşınacak; şimdilik tek instance
//    in-process interval yeterli ve idempotent (geçişi kazanan stok iade eder).
async function expireStaleReservations() {
  const cutoff = new Date(Date.now() - env.reservationTtlMin * 60 * 1000);
  const stale = await Order.find({ status: 'RESERVED', reservedAt: { $lt: cutoff } }).select('_id box');

  let expired = 0;
  for (const o of stale) {
    const won = await Order.findOneAndUpdate(
      { _id: o._id, status: 'RESERVED' },
      { status: 'EXPIRED' }
    );
    if (won) {
      await releaseStock(o.box);
      expired += 1;
    }
  }
  if (expired > 0) logger.info({ expired }, 'Süresi dolan rezervasyonlar temizlendi');
  return expired;
}

// 5) İade (admin): önce sağlayıcıda iade, sonra durum geçişi
async function refundOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) return { outcome: 'NOT_FOUND' };
  if (!['PAID', 'PICKED_UP'].includes(order.status)) return { outcome: `INVALID_STATUS_${order.status}` };

  const result = await paymentProvider.refund(order);
  if (!result.ok) return { outcome: 'PROVIDER_REJECTED' };

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { status: 'REFUNDED', refundedAt: new Date() },
    { new: true }
  );
  return updated ? { outcome: 'REFUNDED', order: updated } : { outcome: 'CONFLICT' };
}

module.exports = { reserveBox, handlePaymentResult, verifyPickup, expireStaleReservations, refundOrder };

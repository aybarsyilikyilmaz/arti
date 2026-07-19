const Order = require('../models/Order');
const orderService = require('../services/orderService');
const { hmacVerify } = require('../utils/crypto');

// Müşteri: atomik rezervasyon + ödeme başlatma
exports.checkout = async (req, res, next) => {
  try {
    const result = await orderService.reserveBox(req.auth.id, req.body.boxId);
    if (result?.limited) {
      const message = result.limited === 'ACTIVE'
        ? 'Bekleyen rezervasyon sayısı sınırına ulaştınız. Önce mevcut ödemelerinizi tamamlayın.'
        : 'Günlük sipariş limitinize ulaştınız. Yarın tekrar deneyebilirsiniz.';
      return res.status(429).json({ status: 'fail', message });
    }
    if (!result) {
      return res.status(409).json({ status: 'fail', message: 'Üzgünüz, bu kutu az önce tükendi.' });
    }

    res.status(201).json({
      status: 'success',
      data: {
        orderId: result.order._id,
        amount: result.order.amount,
        paymentPageUrl: result.paymentPageUrl,
        expiresInMinutes: require('../config/env').reservationTtlMin,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.auth.id })
      .sort('-createdAt')
      .limit(50)
      .select('business box amount status qrToken paymentRef reservedAt paidAt usedAt')
      .populate('business', 'name address')
      .populate('box', 'pickupStart pickupEnd date');
    res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
  } catch (err) {
    next(err);
  }
};

// Ödeme sağlayıcı webhook'u — HMAC imzalı gövde (PLAN.md §3.2).
// İmza: x-webhook-signature = HMAC_SHA256(rawBody, WEBHOOK_SECRET)
exports.paymentWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const rawBody = JSON.stringify(req.body);
    if (!hmacVerify(rawBody, signature)) {
      return res.status(401).json({ status: 'fail', message: 'Geçersiz imza.' });
    }

    const { paymentRef, success } = req.body;
    if (typeof paymentRef !== 'string' || typeof success !== 'boolean') {
      return res.status(400).json({ status: 'fail', message: 'Geçersiz webhook gövdesi.' });
    }

    const result = await orderService.handlePaymentResult(paymentRef, success);
    req.log.info({ paymentRef, outcome: result.outcome }, 'Ödeme webhook sonucu');

    // Webhook'lara idempotent 200 dönülür ki sağlayıcı retry döngüsüne girmesin
    res.status(200).json({ status: 'success', outcome: result.outcome });
  } catch (err) {
    next(err);
  }
};

// İşletme: QR okutarak teslim onayı
exports.verifyPickup = async (req, res, next) => {
  try {
    const result = await orderService.verifyPickup(req.auth.id, req.body.qrToken);

    const messages = {
      PICKED_UP: 'Teslimat onaylandı. Afiyet olsun!',
      INVALID_SIGNATURE: 'Geçersiz QR kod.',
      NOT_FOUND: 'Bu QR koda ait sipariş bulunamadı.',
      ALREADY_PICKED_UP: 'Bu sipariş zaten teslim edilmiş.',
      ALREADY_EXPIRED: 'Bu siparişin süresi dolmuş.',
      ALREADY_REFUNDED: 'Bu sipariş iade edilmiş.',
      ALREADY_RESERVED: 'Bu siparişin ödemesi henüz tamamlanmamış.',
    };

    const ok = result.outcome === 'PICKED_UP';
    res.status(ok ? 200 : 409).json({
      status: ok ? 'success' : 'fail',
      message: messages[result.outcome] || 'Doğrulama başarısız.',
      ...(ok ? { data: { order: { id: result.order._id, customer: result.order.user?.name } } } : {}),
    });
  } catch (err) {
    next(err);
  }
};

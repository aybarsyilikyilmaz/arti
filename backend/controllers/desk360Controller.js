const crypto = require('crypto');
const env = require('../config/env');
const Business = require('../models/Business');
const outreachService = require('../services/outreachService');

// URL yolundaki token sabit zamanlı karşılaştırılır (timing saldırısı önlemi)
function tokenValid(candidate) {
  const a = Buffer.from(String(candidate || ''));
  const b = Buffer.from(env.desk360WebhookToken);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Desk360 cevap webhook'u (PLAN.md §3.4).
// Not: Webhook'lara işlenemese bile 200 dönülür ki sağlayıcı retry
// fırtınası başlatmasın; sorunlu mesajlar admin kuyruğuna düşer.
exports.webhook = async (req, res, next) => {
  try {
    if (!tokenValid(req.params.token)) {
      return res.status(401).json({ status: 'fail', message: 'Geçersiz webhook adresi.' });
    }

    const { chatId, phone, message } = req.body;

    const business = await Business.findOne(
      chatId ? { desk360ChatId: chatId } : { whatsappPhone: phone }
    );
    if (!business) {
      req.log.warn({ chatId, phone }, 'Desk360 mesajı eşleşmeyen işletmeden geldi');
      return res.status(200).json({ status: 'success', outcome: 'UNKNOWN_BUSINESS' });
    }

    const outcome = await outreachService.applyReply(business, message);
    req.log.info({ business: business.name, outcome }, 'Desk360 cevabı işlendi');
    res.status(200).json({ status: 'success', outcome });
  } catch (err) {
    next(err);
  }
};

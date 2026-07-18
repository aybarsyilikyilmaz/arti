// WhatsApp otomasyon döngüsü (PLAN.md §3.4):
//  1. sweepOutreach  — pickup'a ≤4 saat kalan onaylı işletmelere günlük soru
//  2. applyReply     — webhook cevabı: sayı çek, stoğa işle; çekilemezse admin'e düşür
//  3. sweepFallback  — pickup'a ≤1 saat kala hâlâ kutu yoksa varsayılanlarla yayınla
// Tüm adımlar idempotent: OutreachLog {business,date} unique + kutu {business,date} unique.
const Business = require('../models/Business');
const SurpriseBox = require('../models/SurpriseBox');
const OutreachLog = require('../models/OutreachLog');
const desk360 = require('./desk360');
const { todayIstanbul, minutesUntilIstanbul } = require('../utils/time');
const env = require('../config/env');
const logger = require('../utils/logger');

// Mesajdan kutu adedi çekme: "5", "bugün 5 tane var", "5 kutu ayırdım" → 5
function parseCount(text) {
  const match = String(text || '').match(/\d{1,3}/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  if (n < 1 || n > 200) return null; // makul aralık dışı → insan onayı
  return n;
}

function hasPublishDefaults(business) {
  return (
    business.defaultPrice > 0 &&
    business.defaultOriginalPrice > business.defaultPrice
  );
}

function boxDefaults(business) {
  return {
    business: business._id,
    businessName: business.name,
    date: todayIstanbul(),
    price: business.defaultPrice,
    originalPrice: business.defaultOriginalPrice,
    contents: business.boxContents?.length ? business.boxContents : ['karisik'],
    pickupStart: business.pickupStart || '18:00',
    pickupEnd: business.pickupEnd || '21:00',
    location: business.location?.coordinates ? business.location : undefined,
  };
}

// Sayıyı bugünün kutusuna işler; kutu yoksa ve fiyat varsayılanları
// tanımlıysa yeni kutu açar. Webhook ve admin onayı aynı yolu kullanır.
async function applyCount(business, count, replyText) {
  const date = todayIstanbul();
  let outcome;

  const box = await SurpriseBox.findOne({ business: business._id, date });
  if (box) {
    await SurpriseBox.updateOne({ _id: box._id }, { $inc: { extraStock: count, remaining: count } });
    outcome = 'APPLIED_INC';
  } else if (hasPublishDefaults(business)) {
    await SurpriseBox.create({ ...boxDefaults(business), initialStock: 0, extraStock: count, remaining: count });
    outcome = 'APPLIED_NEW_BOX';
  } else {
    outcome = 'PENDING_REVIEW_NO_PRICE'; // fiyat bilinmeden otomatik yayın yapılmaz
  }

  const applied = outcome.startsWith('APPLIED');
  await OutreachLog.findOneAndUpdate(
    { business: business._id, date },
    {
      status: applied ? 'REPLIED' : 'PENDING_REVIEW',
      repliedAt: new Date(),
      ...(replyText !== undefined ? { replyText } : {}),
      ...(applied ? { parsedCount: count } : {}),
    },
    { upsert: true }
  );

  return outcome;
}

// Webhook cevabı: sayı çıkarılamazsa sessizce yutulmaz, admin kuyruğuna düşer
async function applyReply(business, replyText) {
  const count = parseCount(replyText);
  if (count === null) {
    await OutreachLog.findOneAndUpdate(
      { business: business._id, date: todayIstanbul() },
      { status: 'PENDING_REVIEW', repliedAt: new Date(), replyText },
      { upsert: true }
    );
    return 'PENDING_REVIEW_UNPARSED';
  }
  return applyCount(business, count, replyText);
}

// Pickup'a ≤ outreachLeadMin dk kalan, bugün mesaj atılmamış onaylı işletmeler.
// MVP ölçeğinde aday filtreleme bellekte yapılır (işletme sayısı küçük).
async function sweepOutreach() {
  const date = todayIstanbul();
  const candidates = await Business.find({
    status: 'APPROVED',
    pickupStart: { $exists: true, $nin: [null, ''] },
  }).select('name pickupStart whatsappPhone desk360ChatId');

  let sent = 0;
  for (const business of candidates) {
    const mins = minutesUntilIstanbul(business.pickupStart);
    if (mins <= 0 || mins > env.outreachLeadMin) continue;

    try {
      // Önce log (unique indeks çifte mesajı süreç çökse bile engeller)
      await OutreachLog.create({ business: business._id, date, status: 'SENT', sentAt: new Date() });
    } catch (err) {
      if (err.code === 11000) continue; // bugün zaten işlendi
      throw err;
    }

    await desk360.sendDailyPrompt(business);
    sent += 1;
  }

  if (sent > 0) logger.info({ sent }, 'WhatsApp günlük soruları gönderildi');
  return sent;
}

// Pickup'a ≤ fallbackLeadMin dk kala kutusu olmayan işletmeler için
// varsayılanlarla otomatik yayın (cevap gelmemiş ya da kutu açılmamışsa)
async function sweepFallback() {
  const date = todayIstanbul();
  const candidates = await Business.find({
    status: 'APPROVED',
    pickupStart: { $exists: true, $nin: [null, ''] },
    defaultPackageCount: { $gt: 0 },
  });

  let published = 0;
  for (const business of candidates) {
    const mins = minutesUntilIstanbul(business.pickupStart);
    if (mins <= 0 || mins > env.fallbackLeadMin) continue;
    if (!hasPublishDefaults(business)) continue;

    const exists = await SurpriseBox.findOne({ business: business._id, date }).select('_id');
    if (exists) continue;

    try {
      await SurpriseBox.create({
        ...boxDefaults(business),
        initialStock: business.defaultPackageCount,
        remaining: business.defaultPackageCount,
      });
    } catch (err) {
      if (err.code === 11000) continue; // yarışta başka süreç yayınladı
      throw err;
    }

    // REPLIED durumunu ezmeden fallback bilgisini işle
    await OutreachLog.findOneAndUpdate(
      { business: business._id, date, status: { $ne: 'REPLIED' } },
      { status: 'FALLBACK_PUBLISHED' },
      { upsert: false }
    );
    published += 1;
    logger.info({ business: business.name, count: business.defaultPackageCount }, 'Fallback kutu yayınlandı');
  }

  return published;
}

module.exports = { sweepOutreach, sweepFallback, applyReply, applyCount, parseCount };

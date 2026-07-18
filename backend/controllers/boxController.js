const SurpriseBox = require('../models/SurpriseBox');
const { todayIstanbul } = require('../utils/time');

// İşletme: bugünün kutusunu oluştur/güncelle (tek kayıt, upsert değil —
// stok saymacı remaining'e dokunmadan güncellenemeyeceği için ayrık akış)
exports.upsertTodayBox = async (req, res, next) => {
  try {
    const business = req.business; // requireApprovedBusiness doldurur
    const date = todayIstanbul();
    const { price, originalPrice, initialStock, contents, pickupStart, pickupEnd } = req.body;

    const existing = await SurpriseBox.findOne({ business: business._id, date });
    if (existing) {
      // Stok artışı: satılan adedi koruyarak remaining'i büyüt
      const sold = existing.initialStock + existing.extraStock - existing.remaining;
      const newRemaining = Math.max(initialStock - sold, 0);
      existing.set({ price, originalPrice, initialStock, contents, pickupStart, pickupEnd, remaining: newRemaining });
      await existing.save();
      return res.status(200).json({ status: 'success', data: { box: existing } });
    }

    const box = await SurpriseBox.create({
      business: business._id,
      businessName: business.name,
      date,
      price,
      originalPrice,
      initialStock,
      remaining: initialStock,
      contents,
      pickupStart,
      pickupEnd,
      location: business.location?.coordinates ? business.location : undefined,
    });

    // Favorileyen kullanıcılara uygulama içi bildirim (akışı asla kesmez)
    require('../services/notificationService').notifyBoxPublishedSafe(business, box);

    res.status(201).json({ status: 'success', data: { box } });
  } catch (err) {
    next(err);
  }
};

exports.getTodayBox = async (req, res, next) => {
  try {
    const box = await SurpriseBox.findOne({ business: req.auth.id, date: todayIstanbul() });
    res.status(200).json({ status: 'success', data: { box } });
  } catch (err) {
    next(err);
  }
};

// Müşteri: bugünün stoklu kutuları — koordinat verilirse yakınlık sıralı
exports.listNearby = async (req, res, next) => {
  try {
    const { lng, lat, radiusKm } = req.query;
    const filter = { date: todayIstanbul(), remaining: { $gt: 0 } };

    if (lng !== undefined && lat !== undefined) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      };
    }

    const boxes = await SurpriseBox.find(filter)
      .limit(50)
      .select('businessName price originalPrice contents pickupStart pickupEnd remaining location');

    res.status(200).json({ status: 'success', results: boxes.length, data: { boxes } });
  } catch (err) {
    next(err);
  }
};

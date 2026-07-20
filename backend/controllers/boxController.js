const mongoose = require('mongoose');
const SurpriseBox = require('../models/SurpriseBox');
const { getMarkupRate } = require('./settingsController');
const { todayIstanbul } = require('../utils/time');

// İşletme: bugünün kutusunu oluştur/güncelle (tek kayıt, upsert değil —
// stok saymacı remaining'e dokunmadan güncellenemeyeceği için ayrık akış)
exports.upsertTodayBox = async (req, res, next) => {
  try {
    const business = req.business; // requireApprovedBusiness doldurur
    const date = todayIstanbul();
    const { basePrice, originalPrice, initialStock, contents, pickupStart, pickupEnd } = req.body;
    const rate = await getMarkupRate();
    const price = Math.round(basePrice * (1 + rate / 100));

    const existing = await SurpriseBox.findOne({ business: business._id, date });
    if (existing) {
      // Stok artışı: satılan adedi koruyarak remaining'i büyüt
      const sold = existing.initialStock + existing.extraStock - existing.remaining;
      const newRemaining = Math.max(initialStock - sold, 0);
      existing.set({ basePrice, price, originalPrice, initialStock, contents, pickupStart, pickupEnd, remaining: newRemaining });
      await existing.save();

      // Ayrıca işletmenin varsayılan ayarlarını (şablonunu) güncelle
      business.set({
        defaultPackageCount: initialStock,
        defaultPrice: basePrice,
        defaultOriginalPrice: originalPrice,
        pickupStart,
        pickupEnd,
        boxContents: contents,
      });
      await business.save();

      return res.status(200).json({ status: 'success', data: { box: existing } });
    }

    const box = await SurpriseBox.create({
      business: business._id,
      businessName: business.name,
      date,
      basePrice,
      price,
      originalPrice,
      initialStock,
      remaining: initialStock,
      contents,
      pickupStart,
      pickupEnd,
      location: business.location?.coordinates ? business.location : undefined,
    });

    // Ayrıca işletmenin varsayılan ayarlarını (şablonunu) güncelle
    business.set({
      defaultPackageCount: initialStock,
      defaultPrice: basePrice,
      defaultOriginalPrice: originalPrice,
      pickupStart,
      pickupEnd,
      boxContents: contents,
    });
    await business.save();

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
      .select('business businessName price originalPrice contents pickupStart pickupEnd remaining location')
      .populate('business', 'name logoUrl coverUrl');

    res.status(200).json({ status: 'success', results: boxes.length, data: { boxes } });
  } catch (err) {
    next(err);
  }
};

// Müşteri: Tekil kutu detayını getir (İşletme detaylarıyla birlikte)
exports.getBox = async (req, res, next) => {
  try {
    // Geçersiz ObjectId'de findById CastError→500 fırlatır; önce doğrulayıp 400 dönüyoruz
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ status: 'fail', message: 'Geçersiz kutu kimliği.' });
    }

    const box = await SurpriseBox.findById(req.params.id)
      .populate('business', 'name address mapsUrl logoUrl coverUrl detailUrl description');

    if (!box) {
      return res.status(404).json({ status: 'fail', message: 'Kutu bulunamadı.' });
    }
    
    res.status(200).json({ status: 'success', data: { box } });
  } catch (err) {
    next(err);
  }
};

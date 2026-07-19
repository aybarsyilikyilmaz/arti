const Business = require('../models/Business');
const tokenService = require('../services/tokenService');

exports.register = async (req, res, next) => {
  try {
    const {
      name, email, phone, password, address, coordinates, businessType,
      branchType, legalName, taxOffice, taxNumber, mersisNumber,
      city, district, neighborhood,
      contactName, contactRole, contactPhone,
      dailyBoxCount, boxContents, pickupStart, pickupEnd
    } = req.body;

    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta ile zaten bir hesap var.' });
    }

    const newBusiness = await Business.create({
      name,
      email,
      phone,
      password,
      address,
      location: coordinates ? { type: 'Point', coordinates } : undefined,
      businessType,
      branchType,
      legalName,
      taxOffice,
      taxNumber,
      mersisNumber,
      city,
      district,
      neighborhood,
      contactName,
      contactRole,
      contactPhone,
      dailyBoxCount,
      boxContents,
      pickupStart,
      pickupEnd,
      kvkkConsentAt: new Date()
    });

    const accessToken = await tokenService.issueSession(res, newBusiness, 'business');

    res.status(201).json({
      status: 'success',
      accessToken,
      message: 'Kaydınız alındı! Hesabınız ekibimizce doğrulandıktan sonra kutu yayınlayabileceksiniz.',
      data: { business: newBusiness.toSafeJSON() }
    });
  } catch (err) {
    // İç detay sızdırma: yalnızca bilinen hata tipleri kullanıcıya yansıtılır
    if (err.code === 11000) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta ile zaten bir hesap var.' });
    }
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ status: 'fail', message: first?.message || 'Geçersiz kayıt verisi.' });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const business = await Business.findOne({ email }).select('+password');

    if (!business || !(await business.correctPassword(password, business.password))) {
      return res.status(401).json({ status: 'fail', message: 'Hatalı e-posta veya şifre.' });
    }

    const accessToken = await tokenService.issueSession(res, business, 'business');

    res.status(200).json({
      status: 'success',
      accessToken,
      data: { business: { id: business._id, name: business.name, status: business.status } }
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const session = await tokenService.rotateSession(req, res, Business, 'business');
    if (!session) {
      return res.status(401).json({ status: 'fail', message: 'Oturum geçersiz. Lütfen tekrar giriş yapın.' });
    }
    res.status(200).json({ status: 'success', accessToken: session.accessToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await tokenService.revokeSession(req, res, Business, 'business');
    res.status(200).json({ status: 'success', message: 'Çıkış yapıldı.' });
  } catch (err) {
    next(err);
  }
};

// --- İşletme paneli (Faz 4 frontend) ---

exports.getMe = async (req, res, next) => {
  try {
    const Business = require('../models/Business');
    const business = await Business.findById(req.auth.id);
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    res.status(200).json({ status: 'success', data: { business: business.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

// Yalnızca panelden yönetilebilir alanlar güncellenir (e-posta/VKN/status ASLA)
exports.updateProfile = async (req, res, next) => {
  try {
    const Business = require('../models/Business');
    const ALLOWED = [
      'defaultPackageCount', 'defaultPrice', 'defaultOriginalPrice',
      'pickupStart', 'pickupEnd', 'whatsappPhone', 'contactPhone', 'boxContents', 'description',
    ];
    const update = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const business = await Business.findByIdAndUpdate(req.auth.id, update, {
      new: true,
      runValidators: true,
    });
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    res.status(200).json({ status: 'success', message: 'Ayarlar kaydedildi.', data: { business: business.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

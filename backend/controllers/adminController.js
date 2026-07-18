const AdminUser = require('../models/AdminUser');
const Business = require('../models/Business');
const OutreachLog = require('../models/OutreachLog');
const tokenService = require('../services/tokenService');
const orderService = require('../services/orderService');
const outreachService = require('../services/outreachService');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ email }).select('+password');
    if (!admin || !(await admin.correctPassword(password, admin.password))) {
      return res.status(401).json({ status: 'fail', message: 'Hatalı e-posta veya şifre.' });
    }
    const accessToken = await tokenService.issueSession(res, admin, 'admin');
    res.status(200).json({ status: 'success', accessToken });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const session = await tokenService.rotateSession(req, res, AdminUser, 'admin');
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
    await tokenService.revokeSession(req, res, AdminUser, 'admin');
    res.status(200).json({ status: 'success', message: 'Çıkış yapıldı.' });
  } catch (err) {
    next(err);
  }
};

exports.listBusinesses = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const filter = status ? { status } : {};
    const businesses = await Business.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Business.countDocuments(filter);
    res.status(200).json({
      status: 'success',
      total,
      data: { businesses: businesses.map((b) => b.toSafeJSON()) },
    });
  } catch (err) {
    next(err);
  }
};

// Vergi doğrulama ekranı: şifreli VKN yalnızca burada, tekil kayıtta çözülür
exports.getBusinessDetail = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    res.status(200).json({
      status: 'success',
      data: { business: { ...business.toSafeJSON(), taxNumber: business.getTaxNumber() } },
    });
  } catch (err) {
    next(err);
  }
};

const setStatus = (status, successMessage) => async (req, res, next) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    res.status(200).json({ status: 'success', message: successMessage, data: { business: business.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

exports.approveBusiness = setStatus('APPROVED', 'İşletme onaylandı.');
exports.suspendBusiness = setStatus('SUSPENDED', 'İşletme askıya alındı.');

// Parse edilemeyen / fiyatı eksik WhatsApp cevapları burada listelenir
exports.listOutreach = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const filter = status ? { status } : {};
    const logs = await OutreachLog.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('business', 'name phone whatsappPhone');
    const total = await OutreachLog.countDocuments(filter);
    res.status(200).json({ status: 'success', total, data: { logs } });
  } catch (err) {
    next(err);
  }
};

// Admin, mesajı okuyup kutu adedini elle işler (PENDING_REVIEW çözümü)
exports.applyOutreach = async (req, res, next) => {
  try {
    const log = await OutreachLog.findById(req.params.id).populate('business');
    if (!log) return res.status(404).json({ status: 'fail', message: 'Kayıt bulunamadı.' });
    if (!log.business) return res.status(409).json({ status: 'fail', message: 'İşletme silinmiş.' });

    const outcome = await outreachService.applyCount(log.business, req.body.count, log.replyText);
    const ok = outcome.startsWith('APPLIED');
    res.status(ok ? 200 : 409).json({
      status: ok ? 'success' : 'fail',
      message: ok ? 'Stok işlendi.' : 'İşlenemedi: işletmenin varsayılan fiyatları tanımlı değil.',
      outcome,
    });
  } catch (err) {
    next(err);
  }
};

// PENDING_REVIEW kaydını işlem yapmadan kapatır ("yoksay") — kuyruk temiz kalır
exports.dismissOutreach = async (req, res, next) => {
  try {
    const log = await OutreachLog.findOneAndUpdate(
      { _id: req.params.id, status: 'PENDING_REVIEW' },
      { status: 'DISMISSED' },
      { new: true }
    );
    if (!log) {
      return res.status(409).json({ status: 'fail', message: 'Kayıt bulunamadı ya da incelemede değil.' });
    }
    res.status(200).json({ status: 'success', message: 'Kayıt yoksayıldı.' });
  } catch (err) {
    next(err);
  }
};

exports.refundOrder = async (req, res, next) => {
  try {
    const result = await orderService.refundOrder(req.params.id);
    const ok = result.outcome === 'REFUNDED';
    res.status(ok ? 200 : 409).json({
      status: ok ? 'success' : 'fail',
      message: ok ? 'İade tamamlandı.' : `İade yapılamadı (${result.outcome}).`,
    });
  } catch (err) {
    next(err);
  }
};

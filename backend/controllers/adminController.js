const AdminUser = require('../models/AdminUser');
const Business = require('../models/Business');
const tokenService = require('../services/tokenService');
const orderService = require('../services/orderService');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ email }).select('+password');
    if (!admin || !(await admin.correctPassword(password, admin.password))) {
      return res.status(401).json({ status: 'fail', message: 'Hatalı e-posta veya şifre.' });
    }
    const accessToken = await tokenService.issueSession(req, res, admin, 'admin');
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
    const { status, hasPendingUpdates, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (hasPendingUpdates === 'true') filter.pendingUpdates = { $ne: null };

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

// Vergi doğrulama ekranı: şifreli VKN yalnızca burada, tekil kayıtta çözülür.
// stats bloğu detay sayfasındaki sekme rozetlerini besler.
exports.getBusinessDetail = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });

    const Order = require('../models/Order');
    const Employee = require('../models/Employee');
    const SurpriseBox = require('../models/SurpriseBox');
    const { todayIstanbul } = require('../utils/time');

    const [orderCount, employeeCount, branchCount, todayBox] = await Promise.all([
      Order.countDocuments({ business: business._id }),
      Employee.countDocuments({ business: business._id }),
      Business.countDocuments({ parentBusinessId: business._id }),
      SurpriseBox.exists({ business: business._id, date: todayIstanbul() }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        business: { ...business.toSafeJSON(), taxNumber: business.getTaxNumber() },
        stats: { orderCount, employeeCount, branchCount, todayPublished: Boolean(todayBox) },
      },
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

exports.approveProfileUpdate = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    if (!business.pendingUpdates) return res.status(400).json({ status: 'fail', message: 'Bekleyen güncelleme yok.' });

    Object.assign(business, business.pendingUpdates);
    business.pendingUpdates = null;
    await business.save();

    res.status(200).json({ status: 'success', message: 'Profil güncellemeleri onaylandı.', data: { business: business.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

exports.rejectProfileUpdate = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    if (!business.pendingUpdates) return res.status(400).json({ status: 'fail', message: 'Bekleyen güncelleme yok.' });

    business.pendingUpdates = null;
    await business.save();

    const reason = req.body.reason || 'Profil güncelleme talebiniz uygun bulunmadı.';
    // TODO: Send email and whatsapp notification here
    console.log(`[Notification] To: ${business.email}, WhatsApp: ${business.whatsappPhone} - Reason: ${reason}`);

    res.status(200).json({ status: 'success', message: 'Profil güncellemeleri reddedildi ve işletmeye bildirildi.', data: { business: business.toSafeJSON() } });
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

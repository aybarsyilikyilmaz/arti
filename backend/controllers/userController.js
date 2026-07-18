const User = require('../models/User');
const tokenService = require('../services/tokenService');

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta ile zaten bir hesap var.' });
    }

    const user = await User.create({ name, email, phone, password, kvkkConsentAt: new Date() });
    const accessToken = await tokenService.issueSession(res, user, 'user');

    res.status(201).json({
      status: 'success',
      accessToken,
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta ile zaten bir hesap var.' });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Hatalı e-posta veya şifre.' });
    }

    const accessToken = await tokenService.issueSession(res, user, 'user');
    res.status(200).json({
      status: 'success',
      accessToken,
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const session = await tokenService.rotateSession(req, res, User, 'user');
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
    await tokenService.revokeSession(req, res, User, 'user');
    res.status(200).json({ status: 'success', message: 'Çıkış yapıldı.' });
  } catch (err) {
    next(err);
  }
};

// --- Favoriler (PLAN.md Faz 4) ---

exports.addFavorite = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    if (!require('mongoose').isValidObjectId(businessId)) {
      return res.status(400).json({ status: 'fail', message: 'Geçersiz işletme kimliği.' });
    }
    const Business = require('../models/Business');
    const business = await Business.findOne({ _id: businessId, status: 'APPROVED' }).select('_id name');
    if (!business) {
      return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    }
    // $addToSet: aynı işletme iki kez eklenmez (idempotent)
    await User.updateOne({ _id: req.auth.id }, { $addToSet: { favorites: business._id } });
    res.status(200).json({ status: 'success', message: `${business.name} favorilere eklendi.` });
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    if (!require('mongoose').isValidObjectId(businessId)) {
      return res.status(400).json({ status: 'fail', message: 'Geçersiz işletme kimliği.' });
    }
    await User.updateOne({ _id: req.auth.id }, { $pull: { favorites: businessId } });
    res.status(200).json({ status: 'success', message: 'Favorilerden çıkarıldı.' });
  } catch (err) {
    next(err);
  }
};

exports.listFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.id)
      .populate('favorites', 'name address businessType logoUrl coverUrl');
    res.status(200).json({ status: 'success', data: { favorites: user?.favorites || [] } });
  } catch (err) {
    next(err);
  }
};

// --- Bildirimler (PLAN.md Faz 4) ---

exports.listNotifications = async (req, res, next) => {
  try {
    const Notification = require('../models/Notification');
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.auth.id })
        .sort('-createdAt')
        .limit(50)
        .populate('business', 'name logoUrl'),
      Notification.countDocuments({ user: req.auth.id, readAt: null }),
    ]);
    res.status(200).json({ status: 'success', unreadCount, data: { notifications } });
  } catch (err) {
    next(err);
  }
};

exports.markNotificationsRead = async (req, res, next) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany({ user: req.auth.id, readAt: null }, { readAt: new Date() });
    res.status(200).json({ status: 'success', message: 'Bildirimler okundu olarak işaretlendi.' });
  } catch (err) {
    next(err);
  }
};

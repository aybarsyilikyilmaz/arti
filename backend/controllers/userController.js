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

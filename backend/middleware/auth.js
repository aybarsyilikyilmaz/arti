const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Business = require('../models/Business');

// Bearer access token doğrulaması + rol kontrolü.
// req.auth = { id, role } olarak devam eder.
const protect = (...allowedRoles) => (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Giriş yapmanız gerekiyor.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ status: 'fail', message: 'Oturum geçersiz veya süresi dolmuş.' });
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
    return res.status(403).json({ status: 'fail', message: 'Bu işlem için yetkiniz yok.' });
  }

  req.auth = { id: payload.sub, role: payload.role };
  next();
};

// Kutu yayınlama gibi işlemler yalnızca onaylı işletmelere açık (PLAN.md §2)
const requireApprovedBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.auth.id);
    if (!business) {
      return res.status(401).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    }
    if (business.status !== 'APPROVED') {
      return res.status(403).json({
        status: 'fail',
        message: business.status === 'PENDING_APPROVAL'
          ? 'Hesabınız henüz onay aşamasında. Onaylandığında e-posta ile bilgilendirileceksiniz.'
          : 'Hesabınız askıya alınmış. Destek ekibiyle iletişime geçin.',
      });
    }
    req.business = business;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect, requireApprovedBusiness };

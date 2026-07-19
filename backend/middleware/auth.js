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

  if (payload.role === 'employee') {
    if (allowedRoles.length > 0 && !allowedRoles.includes('business') && !allowedRoles.includes('employee')) {
      return res.status(403).json({ status: 'fail', message: 'Bu işlem için yetkiniz yok.' });
    }
    req.auth = { id: payload.businessId, role: 'business', employeeId: payload.sub };
  } else {
    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      return res.status(403).json({ status: 'fail', message: 'Bu işlem için yetkiniz yok.' });
    }
    req.auth = { id: payload.sub, role: payload.role };
  }

  next();
};

// RBAC: çalışan (Employee) yetki kontrolü. protect('business') çalışanı da
// role:'business' olarak geçirir; allowedPages kısıtı YALNIZCA frontend menüsünde
// uygulanıyordu — bu middleware onu backend'de zorunlu kılar.
//   • Ana işletme sahibi (employeeId yok) → her zaman geçer.
//   • Çalışan → verilen sayfalardan en az birine yetkili olmalı; yetkiler
//     her istekte DB'den okunur ki yetki iptali anında geçerli olsun.
const requirePage = (...pages) => async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.employeeId) return next(); // ana hesap
    const Employee = require('../models/Employee');
    const employee = await Employee.findById(req.auth.employeeId).select('allowedPages');
    if (!employee) {
      return res.status(401).json({ status: 'fail', message: 'Çalışan kaydı bulunamadı.' });
    }
    const allowed = employee.allowedPages || [];
    if (!pages.some((p) => allowed.includes(p))) {
      return res.status(403).json({ status: 'fail', message: 'Bu bölüm için yetkiniz yok.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Yalnızca ana işletme sahibine açık (çalışanlara tamamen kapalı).
// IBAN, şube yönetimi gibi finansal/yapısal olarak kritik işlemler için.
const requireOwner = (req, res, next) => {
  if (req.auth && req.auth.employeeId) {
    return res.status(403).json({ status: 'fail', message: 'Bu işlem yalnızca işletme sahibine açıktır.' });
  }
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

module.exports = { protect, requireApprovedBusiness, requirePage, requireOwner };

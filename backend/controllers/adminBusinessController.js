// Admin "İşletme Detay" uçları — admin, hesap değiştirmeden (impersonation'sız)
// bir işletmenin profilini, siparişlerini, kutusunu, finansını ve ekibini yönetir.
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Order = require('../models/Order');
const SurpriseBox = require('../models/SurpriseBox');
const Payout = require('../models/Payout');
const Employee = require('../models/Employee');
const financeService = require('../services/financeService');
const { todayIstanbul } = require('../utils/time');

const notFound = (res) => res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });

// Profil düzenleme — validateBody(adminUpdateBusinessSchema) bilinmeyen
// alanları zaten ayıklar; save() ile model validasyonları da çalışır.
exports.updateBusinessProfile = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return notFound(res);

    Object.assign(business, req.body);
    await business.save();

    res.status(200).json({
      status: 'success',
      message: 'İşletme profili güncellendi.',
      data: { business: business.toSafeJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// Bu işletmeye ait tüm siparişler (durum filtresi + sayfalama)
exports.listBusinessOrders = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.params.id);
    const { status, page, limit } = req.query;
    const filter = { business: businessId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .select('user box amount status paymentRef reservedAt paidAt refundedAt usedAt createdAt')
        .populate('user', 'name email')
        .populate('box', 'date price'),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: { page, limit, totalPages: Math.ceil(total / limit), totalOrders: total, orders },
    });
  } catch (err) {
    next(err);
  }
};

// Bugünün kutusu + son 14 günün kutu geçmişi
exports.listBusinessBoxes = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.params.id);
    const todayStr = todayIstanbul();
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [todayBox, recentBoxes] = await Promise.all([
      SurpriseBox.findOne({ business: businessId, date: todayStr }),
      SurpriseBox.find({ business: businessId, createdAt: { $gte: since } }).sort('-date').limit(20),
    ]);

    res.status(200).json({ status: 'success', data: { today: todayStr, todayBox, recentBoxes } });
  } catch (err) {
    next(err);
  }
};

// Stok/fiyat müdahalesi. remaining hedef değerdir; rezervasyon yarışını
// bozmamak için doğrudan yazılmaz, okunan değere şartlı atomik $inc uygulanır.
// Stok artışı extraStock'a da yazılır (satış sayacı bozulmasın); azalış
// yalnızca remaining'den düşer ("artık satışta değil" anlamına gelir).
exports.patchTodayBox = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.params.id);
    const box = await SurpriseBox.findOne({ business: businessId, date: todayIstanbul() });
    if (!box) return res.status(404).json({ status: 'fail', message: 'Bugün yayınlanmış kutu yok.' });

    const { basePrice, remaining } = req.body;

    const update = {};
    if (basePrice !== undefined) {
      const business = await Business.findById(businessId).select('commissionRate');
      const rate = business.commissionRate ?? 10;
      const price = Math.round(basePrice * (1 + rate / 100));
      
      if (price >= box.originalPrice) {
        return res.status(400).json({ status: 'fail', message: 'Müşteriye yansıyan indirimli fiyat, normal fiyattan düşük olmalı.' });
      }
      update.$set = { basePrice, price };
    }
    
    if (remaining !== undefined) {
      const delta = remaining - box.remaining;
      if (delta !== 0) {
        if (!update.$inc) update.$inc = {};
        update.$inc.remaining = delta;
        if (delta > 0) update.$inc.extraStock = delta;
      }
    }

    if (!update.$set && !update.$inc) {
      return res.status(200).json({ status: 'success', message: 'Değişiklik yok.', data: { box } });
    }

    // Guard: okuduğumuz remaining hâlâ geçerliyse uygula; değilse 409
    const updated = await SurpriseBox.findOneAndUpdate(
      { _id: box._id, remaining: box.remaining },
      update,
      { new: true }
    );
    if (!updated) {
      return res.status(409).json({ status: 'fail', message: 'Stok az önce değişti (yeni sipariş olabilir). Sayfayı yenileyip tekrar deneyin.' });
    }

    res.status(200).json({ status: 'success', message: 'Kutu güncellendi.', data: { box: updated } });
  } catch (err) {
    next(err);
  }
};

// Finans özeti + hakediş listesi tek cevapta (işletme paneliyle aynı hesap)
exports.getBusinessFinance = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id).select('_id');
    if (!business) return notFound(res);

    const page = parseInt(req.query.page, 10) || 1;
    const [overview, payoutData] = await Promise.all([
      financeService.computeOverview(req.params.id),
      financeService.listPayouts(req.params.id, { page, limit: 10 }),
    ]);

    res.status(200).json({
      status: 'success',
      data: { overview, payouts: payoutData.payouts, pagination: payoutData.pagination },
    });
  } catch (err) {
    next(err);
  }
};

// Hakediş durum geçişi — PAID işaretlenince ödeme tarihi damgalanır,
// dekont referansı verilmişse kayda yazılır
exports.updatePayoutStatus = async (req, res, next) => {
  try {
    const { status, reference } = req.body;
    const update = { status };
    if (status === 'PAID') update.payoutDate = new Date();
    if (reference !== undefined) update.reference = reference;

    const payout = await Payout.findByIdAndUpdate(req.params.payoutId, update, { new: true });
    if (!payout) return res.status(404).json({ status: 'fail', message: 'Hakediş kaydı bulunamadı.' });

    res.status(200).json({ status: 'success', message: 'Hakediş durumu güncellendi.', data: { payout } });
  } catch (err) {
    next(err);
  }
};

// Çalışanlar + bağlı şubeler tek cevapta (Ekip & Şubeler sekmesi)
exports.listBusinessEmployees = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id).select('_id branchType');
    if (!business) return notFound(res);

    const branches = await Business.find({ parentBusinessId: business._id })
      .select('name branchName address phone status createdAt');
    const businessIds = [business._id, ...branches.map((b) => b._id)];

    const employees = await Employee.find({ business: { $in: businessIds } })
      .populate('business', 'name branchName')
      .populate('allowedBranches', 'name branchName')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        employees: employees.map((e) => e.toSafeJSON()),
        branches,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Çalışan yetki/şifre düzenleme (admin)
exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.employeeId).select('+password');
    if (!employee) return res.status(404).json({ status: 'fail', message: 'Çalışan bulunamadı.' });

    if (req.body.allowedPages !== undefined) employee.allowedPages = req.body.allowedPages;
    if (req.body.password) employee.password = req.body.password;
    await employee.save();

    res.status(200).json({ status: 'success', message: 'Çalışan güncellendi.', data: { employee: employee.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.employeeId);
    if (!employee) return res.status(404).json({ status: 'fail', message: 'Çalışan bulunamadı.' });
    res.status(200).json({ status: 'success', message: 'Çalışan silindi.' });
  } catch (err) {
    next(err);
  }
};

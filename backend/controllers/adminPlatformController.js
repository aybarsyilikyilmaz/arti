// Platform geneli admin uçları — Dashboard, tüm siparişler/iadeler,
// kullanıcı (müşteri) yönetimi, finans/hakediş ve yorum moderasyonu.
const mongoose = require('mongoose');
const User = require('../models/User');
const Business = require('../models/Business');
const Order = require('../models/Order');
const SurpriseBox = require('../models/SurpriseBox');
const Ticket = require('../models/Ticket');
const Payout = require('../models/Payout');
const Review = require('../models/Review');
const financeService = require('../services/financeService');
const { todayIstanbul } = require('../utils/time');
const bcrypt = require('bcryptjs');

const REVENUE_STATUSES = ['PAID', 'PICKED_UP'];

/* ------------------------------------------------------------------ */
/* 1. Dashboard: canlı metrikler + 30 günlük trend + alarmlar          */
/* ------------------------------------------------------------------ */
exports.dashboard = async (req, res, next) => {
  try {
    const todayStart = new Date(`${todayIstanbul()}T00:00:00+03:00`);
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers, activeBusinesses, pendingBusinesses,
      todaySold, todayRevenueRows, totalRevenueRows,
      activeReservations, refunds24h, pendingTickets,
      todayBoxes, pendingPayouts, dailyRows,
    ] = await Promise.all([
      User.countDocuments({}),
      Business.countDocuments({ status: 'APPROVED' }),
      Business.countDocuments({ status: 'PENDING_APPROVAL' }),
      Order.countDocuments({ createdAt: { $gte: todayStart }, status: { $in: REVENUE_STATUSES } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, status: { $in: REVENUE_STATUSES } } },
        { $group: { _id: null, revenue: { $sum: '$amount' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $in: REVENUE_STATUSES } } },
        { $group: { _id: null, revenue: { $sum: '$amount' } } },
      ]),
      Order.countDocuments({ status: 'RESERVED' }),
      Order.countDocuments({ status: 'REFUNDED', refundedAt: { $gte: since24h } }),
      Ticket.countDocuments({ status: 'OPEN' }),
      SurpriseBox.countDocuments({ date: todayIstanbul() }),
      Payout.countDocuments({ status: 'PENDING' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: since30 }, status: { $in: REVENUE_STATUSES } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Europe/Istanbul' } },
            orders: { $sum: 1 },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Acil müdahale sinyalleri — panelde renkli alarm listesi olur
    const alarms = [];
    if (pendingBusinesses > 0) alarms.push({ level: 'warning', text: `${pendingBusinesses} işletme onay bekliyor`, link: 'isletmeler' });
    if (pendingTickets > 0) alarms.push({ level: 'warning', text: `${pendingTickets} destek talebi yanıt bekliyor`, link: 'destek' });
    if (pendingPayouts > 0) alarms.push({ level: 'info', text: `${pendingPayouts} hakediş ödemesi bekliyor`, link: 'finans' });
    if (refunds24h >= 3) alarms.push({ level: 'danger', text: `Son 24 saatte ${refunds24h} iade — olağandışı artış`, link: 'siparisler' });
    if (todayBoxes === 0) alarms.push({ level: 'info', text: 'Bugün henüz hiç kutu yayınlanmadı', link: 'isletmeler' });

    res.status(200).json({
      status: 'success',
      data: {
        metrics: {
          totalUsers,
          activeBusinesses,
          pendingBusinesses,
          todaySold,
          todayRevenue: todayRevenueRows[0]?.revenue || 0,
          totalRevenue: totalRevenueRows[0]?.revenue || 0,
          activeReservations,
          refunds24h,
          pendingTickets,
          todayBoxes,
        },
        daily: dailyRows.map((r) => ({ date: r._id, orders: r.orders, revenue: r.revenue })),
        alarms,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* 2. İşletme Yaratma (Admin Panelinden)                                */
/* ------------------------------------------------------------------ */
exports.createBusiness = async (req, res, next) => {
  try {
    const { email, password, phone, ...rest } = req.body;

    // Tekillik kontrolü
    const exists = await Business.findOne({ $or: [{ email }, { phone }] }).select('_id');
    if (exists) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta veya telefon numarası zaten kullanımda.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const business = new Business({
      ...rest,
      email,
      phone,
      password: hashedPassword,
      status: 'APPROVED', // Admin yarattığı için doğrudan onaylı
    });

    await business.save();

    res.status(201).json({
      status: 'success',
      message: 'İşletme başarıyla oluşturuldu ve onaylandı.',
      data: { business: business.toSafeJSON() },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* 3. Tüm siparişler — canlı akış + iade yönetimi                      */
/* ------------------------------------------------------------------ */
exports.listAllOrders = async (req, res, next) => {
  try {
    const { status, q, page, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // q: müşteri adı/e-postası — önce eşleşen kullanıcılar bulunur
    if (q) {
      const re = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const users = await User.find({ $or: [{ email: re }, { name: re }] }).select('_id').limit(200);
      filter.user = { $in: users.map((u) => u._id) };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .select('user business box amount status paymentRef reservedAt paidAt refundedAt usedAt createdAt')
        .populate('user', 'name email')
        .populate('business', 'name branchName')
        .populate('box', 'date'),
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

/* ------------------------------------------------------------------ */
/* 3. Kullanıcı (müşteri) yönetimi                                     */
/* ------------------------------------------------------------------ */
exports.listUsers = async (req, res, next) => {
  try {
    const { q, banned, page, limit } = req.query;
    const filter = {};
    if (q) {
      const re = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ email: re }, { name: re }, { phone: re }];
    }
    if (banned === 'true') filter.bannedAt = { $ne: null };

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .select('name email phone bannedAt createdAt'),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: { page, limit, totalPages: Math.ceil(total / limit), totalUsers: total, users },
    });
  } catch (err) {
    next(err);
  }
};

// Müşteri sicili: sipariş kırılımı, harcama, tasarruf, iade sayısı, son siparişler
exports.getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email phone bannedAt createdAt kvkkConsentAt');
    if (!user) return res.status(404).json({ status: 'fail', message: 'Kullanıcı bulunamadı.' });

    const userId = new mongoose.Types.ObjectId(req.params.id);
    const [statusRows, savingsRows, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      ]),
      // Tasarruf: teslim alınan kutularda (kutu değeri - ödenen)
      Order.aggregate([
        { $match: { user: userId, status: 'PICKED_UP' } },
        { $lookup: { from: 'surpriseboxes', localField: 'box', foreignField: '_id', as: 'boxDoc' } },
        { $unwind: '$boxDoc' },
        { $group: { _id: null, saved: { $sum: { $subtract: ['$boxDoc.originalPrice', '$amount'] } } } },
      ]),
      Order.find({ user: userId })
        .sort('-createdAt')
        .limit(10)
        .select('business amount status createdAt')
        .populate('business', 'name branchName'),
    ]);

    const byStatus = Object.fromEntries(statusRows.map((r) => [r._id, r.count]));
    const totalSpent = statusRows
      .filter((r) => REVENUE_STATUSES.includes(r._id))
      .reduce((s, r) => s + r.amount, 0);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        record: {
          byStatus,
          totalOrders: statusRows.reduce((s, r) => s + r.count, 0),
          totalSpent,
          totalSaved: Math.max(0, savingsRows[0]?.saved || 0),
          refundCount: byStatus.REFUNDED || 0,
          expiredCount: byStatus.EXPIRED || 0,
        },
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

const setBan = (banned) => async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      banned
        ? { bannedAt: new Date(), refreshTokenHash: null } // aktif oturumu da düşür
        : { bannedAt: null },
      { new: true }
    ).select('name email bannedAt');
    if (!user) return res.status(404).json({ status: 'fail', message: 'Kullanıcı bulunamadı.' });
    res.status(200).json({
      status: 'success',
      message: banned ? 'Kullanıcı engellendi — artık giriş yapamaz.' : 'Engel kaldırıldı.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
exports.banUser = setBan(true);
exports.unbanUser = setBan(false);

/* ------------------------------------------------------------------ */
/* 4. Finans: platform özeti + hakediş tablosu + ödeme oluşturma       */
/* ------------------------------------------------------------------ */
exports.financeOverview = async (req, res, next) => {
  try {
    const { rows, totals } = await financeService.computePlatformFinance();
    const recentPayouts = await Payout.find({})
      .sort('-createdAt')
      .limit(20)
      .populate('business', 'name branchName');
    res.status(200).json({ status: 'success', data: { rows, totals, recentPayouts } });
  } catch (err) {
    next(err);
  }
};

// Bekleyen bakiyeyi tek tuşla hakedişe çevirir (dekont referanslı, PAID)
exports.createPayout = async (req, res, next) => {
  try {
    const { businessId, reference } = req.body;
    const business = await Business.findById(businessId).select('iban ibanOwner');
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });

    const overview = await financeService.computeOverview(businessId);
    if (overview.pendingBalance <= 0) {
      return res.status(409).json({ status: 'fail', message: 'Bu işletmenin bekleyen bakiyesi yok.' });
    }

    // Dönem: son hakedişin bitiminden bugüne (ilk ödemede ilk siparişten itibaren)
    const lastPayout = await Payout.findOne({ business: businessId }).sort('-periodEnd');
    const periodStart = lastPayout?.periodEnd
      || (await Order.findOne({ business: businessId, status: 'PICKED_UP' }).sort('createdAt'))?.createdAt
      || new Date();
    const periodEnd = new Date();
    const totalOrders = await Order.countDocuments({
      business: businessId, status: 'PICKED_UP', createdAt: { $gte: periodStart, $lte: periodEnd },
    });

    const payout = await Payout.create({
      business: businessId,
      periodStart,
      periodEnd,
      totalOrders,
      netAmount: overview.pendingBalance,
      status: 'PAID',
      payoutDate: new Date(),
      ibanUsed: business.iban || '',
      ibanOwnerUsed: business.ibanOwner || '',
      reference: reference || '',
    });

    res.status(201).json({ status: 'success', message: 'Hakediş ödendi olarak kaydedildi.', data: { payout } });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* 5. Yorum moderasyonu                                                */
/* ------------------------------------------------------------------ */
exports.listReviews = async (req, res, next) => {
  try {
    const { maxRating, page, limit } = req.query;
    const filter = {};
    if (maxRating) filter.rating = { $lte: maxRating };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email')
        .populate('business', 'name branchName'),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: { page, limit, totalPages: Math.ceil(total / limit), totalReviews: total, reviews },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ status: 'fail', message: 'Yorum bulunamadı.' });
    res.status(200).json({ status: 'success', message: 'Yorum silindi.' });
  } catch (err) {
    next(err);
  }
};

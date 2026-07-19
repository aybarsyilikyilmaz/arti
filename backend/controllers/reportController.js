// İşletme paneli raporları (PLAN.md Faz 4) — bugünün kutusu + dönem özeti.
// Tüm gün hesapları Europe/Istanbul üzerinden yapılır (PLAN.md §1).
const mongoose = require('mongoose');
const Order = require('../models/Order');
const SurpriseBox = require('../models/SurpriseBox');
const { todayIstanbul } = require('../utils/time');

const REVENUE_STATUSES = ['PAID', 'PICKED_UP'];

exports.summary = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.auth.id);
    const { days } = req.query; // validateQuery: 1-30, varsayılan 7
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Bugünün başlangıcı (Europe/Istanbul)
    const todayStr = todayIstanbul();
    const todayStart = new Date(`${todayStr}T00:00:00+03:00`);

    const [todayBox, statusRows, dailyRows, todayOrderCount] = await Promise.all([
      SurpriseBox.findOne({ business: businessId, date: todayStr }),
      Order.aggregate([
        { $match: { business: businessId, createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      ]),
      Order.aggregate([
        { $match: { business: businessId, createdAt: { $gte: since }, status: { $in: REVENUE_STATUSES } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Europe/Istanbul' } },
            orders: { $sum: 1 },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Bugün gelen toplam sipariş (bildirim çanı için)
      Order.countDocuments({ business: businessId, createdAt: { $gte: todayStart } }),
    ]);

    const byStatus = Object.fromEntries(statusRows.map((r) => [r._id, r.count]));
    const revenue = statusRows
      .filter((r) => REVENUE_STATUSES.includes(r._id))
      .reduce((sum, r) => sum + r.amount, 0);

    res.status(200).json({
      status: 'success',
      data: {
        period: { days, since },
        today: todayBox
          ? {
              published: true,
              initialStock: todayBox.initialStock,
              extraStock: todayBox.extraStock,
              remaining: todayBox.remaining,
              sold: todayBox.initialStock + todayBox.extraStock - todayBox.remaining,
              price: todayBox.price,
            }
          : { published: false },
        todayOrderCount,
        totals: {
          byStatus,
          revenue,
          rescuedBoxes: byStatus.PICKED_UP || 0, // teslim edilen = kurtarılan yemek
        },
        daily: dailyRows.map((r) => ({ date: r._id, orders: r.orders, revenue: r.revenue })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Son siparişler — işletme paneli aktivite akışı
exports.recentOrders = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.auth.id);
    const orders = await Order.find({ business: businessId })
      .sort('-createdAt')
      .limit(10)
      .select('user amount status reservedAt paidAt usedAt createdAt')
      .populate('user', 'name');

    res.status(200).json({
      status: 'success',
      data: {
        orders: orders.map((o) => ({
          id: o._id,
          customerName: o.user?.name || 'Misafir',
          amount: o.amount,
          status: o.status,
          reservedAt: o.reservedAt,
          paidAt: o.paidAt,
          pickedUpAt: o.usedAt,
          createdAt: o.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Tüm siparişler — işletme paneli sayfalı liste (page, limit sorgu parametreleri)
exports.allOrders = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.auth.id);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ business: businessId })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .select('user amount status reservedAt paidAt usedAt createdAt')
        .populate('user', 'name email'),
      Order.countDocuments({ business: businessId }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        orders,
      },
    });
  } catch (err) {
    next(err);
  }
};

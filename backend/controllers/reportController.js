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

    const [todayBox, statusRows, dailyRows] = await Promise.all([
      SurpriseBox.findOne({ business: businessId, date: todayIstanbul() }),
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

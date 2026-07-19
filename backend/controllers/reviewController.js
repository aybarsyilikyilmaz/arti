const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');

// Müşteri: teslim alınan siparişe değerlendirme gönderir (1–5 puan + yorum).
// Doğrulamalar: sipariş kullanıcıya ait mi, PICKED_UP mu, daha önce yorum yapılmış mı.
exports.submitReview = async (req, res, next) => {
  try {
    const userId = req.auth.id;
    const { orderId, rating, comment } = req.body;

    // Sipariş sahibi ve durum kontrolü
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Sipariş bulunamadı.' });
    }
    if (order.user.toString() !== userId) {
      return res.status(403).json({ status: 'fail', message: 'Bu sipariş size ait değil.' });
    }
    if (order.status !== 'PICKED_UP') {
      return res.status(400).json({ status: 'fail', message: 'Yalnızca teslim alınmış siparişleri değerlendirebilirsiniz.' });
    }

    // Tekrar değerlendirme engeli
    const existing = await Review.findOne({ order: orderId });
    if (existing) {
      return res.status(409).json({ status: 'fail', message: 'Bu siparişi zaten değerlendirdiniz.' });
    }

    const review = await Review.create({
      user: userId,
      business: order.business,
      order: orderId,
      rating,
      comment: comment || '',
    });

    res.status(201).json({
      status: 'success',
      data: { review: { id: review._id, rating: review.rating, comment: review.comment } },
    });
  } catch (err) {
    // Unique index ihlali — yarış koşulunda ikinci istek buraya düşer
    if (err.code === 11000) {
      return res.status(409).json({ status: 'fail', message: 'Bu siparişi zaten değerlendirdiniz.' });
    }
    next(err);
  }
};

// İşletme: değerlendirme özeti — ortalama puan, toplam sayı ve son 5 yorum.
exports.businessReviews = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.auth.id);

    const [statsResult, recentReviews] = await Promise.all([
      // Ortalama ve toplam
      Review.aggregate([
        { $match: { business: businessId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } },
      ]),
      // Son 5 değerlendirme — müşteri adı ile
      Review.find({ business: businessId })
        .sort('-createdAt')
        .limit(5)
        .select('user rating comment createdAt')
        .populate('user', 'name'),
    ]);

    const stats = statsResult[0] || { avgRating: 0, total: 0 };

    res.status(200).json({
      status: 'success',
      data: {
        avgRating: Math.round(stats.avgRating * 10) / 10, // tek ondalık
        totalReviews: stats.total,
        reviews: recentReviews.map((r) => ({
          id: r._id,
          customerName: r.user?.name || 'Misafir',
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

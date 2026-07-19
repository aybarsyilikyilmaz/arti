// Hakediş hesapları — TEK kaynak. Hem işletme paneli (financeController)
// hem admin paneli aynı fonksiyonları kullanır; iki panelde farklı bakiye
// görünmesin diye mantık burada toplanır.
//
// GELİR MODELİ (Additive Markup):
//   - İşletme bir basePrice belirler (ör. 200 TL)
//   - Platform, commissionRate (ör. %10) kadar fark ekleyerek müşteriye satar (220 TL)
//   - Sipariş.amount = 220 TL (müşteri ödemesi)
//   - Sipariş.baseAmount = 200 TL (işletme hakedişi, dokunulmaz)
//   - Platform kazancı = amount - baseAmount = 20 TL
//   - İşletmeye ödenen = baseAmount toplamı
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Business = require('../models/Business');
const { getMarkupRate } = require('../controllers/settingsController');

const round2 = (n) => Math.round(n * 100) / 100;

exports.computeOverview = async (businessId) => {
  const id = new mongoose.Types.ObjectId(String(businessId));

  const [earnedRows, paidRows, business] = await Promise.all([
    Order.aggregate([
      { $match: { business: id, status: 'PICKED_UP' } },
      // Eski siparişlerde baseAmount olmayabilir (null/0) — o durumda
      // amount'u kullan: platform farkı yok, işletme tamamını almış sayılır.
      {
        $group: {
          _id: null,
          gross: { $sum: '$amount' },
          net: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$baseAmount', 0] }] },
                '$baseAmount',
                '$amount',   // eski kayıt: baseAmount yok, işletme tamamını almış
              ],
            },
          },
        },
      },
    ]),
    Payout.aggregate([
      { $match: { business: id, status: 'PAID' } },
      { $group: { _id: null, totalPaid: { $sum: '$netAmount' } } },
    ]),
    Business.findById(id).select('iban ibanOwner payoutPeriod commissionRate'),
  ]);

  const gross = earnedRows[0]?.gross || 0;        // müşteri ödemesi toplamı
  const netEarned = earnedRows[0]?.net || 0;       // işletme hakedişi (baseAmount toplamı)
  const platformEarning = round2(gross - netEarned); // platform farkı
  const totalPaid = paidRows[0]?.totalPaid || 0;
  const markupRate = await getMarkupRate();

  // Sonraki ödeme: günlük ise bugün 23:59, haftalık ise Cuma 23:59
  const now = new Date();
  const nextPayoutDate = new Date();
  if (business?.payoutPeriod === 'weekly') {
    const diff = 5 - now.getDay();
    nextPayoutDate.setDate(now.getDate() + (diff >= 0 ? diff : diff + 7));
  }
  nextPayoutDate.setHours(23, 59, 59, 999);

  return {
    gross,                // brüt ciro (müşteri ödemesi)
    netEarned,            // işletme hakedişi (baseAmount toplamı)
    platformEarning,      // platform kazancı (gross - net)
    markupRate,
    totalPaid,
    pendingBalance: Math.max(0, round2(netEarned - totalPaid)), // işletmeye borç
    nextPayoutDate,
    payoutPeriod: business?.payoutPeriod || 'daily',
    iban: business?.iban || '',
    ibanOwner: business?.ibanOwner || '',
    // Geriye dönük uyumluluk
    totalEarned: netEarned,
    commissionRate: markupRate,
    commission: platformEarning,
  };
};

exports.listPayouts = async (businessId, { page = 1, limit = 10 } = {}) => {
  const id = new mongoose.Types.ObjectId(String(businessId));
  const skip = (page - 1) * limit;

  const [payouts, total] = await Promise.all([
    Payout.find({ business: id }).sort('-createdAt').skip(skip).limit(limit),
    Payout.countDocuments({ business: id }),
  ]);

  return {
    payouts: payouts.map((p) => ({
      id: p._id,
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      totalOrders: p.totalOrders,
      netAmount: p.netAmount,
      status: p.status,
      ibanUsed: p.ibanUsed,
      reference: p.reference || '',
      payoutDate: p.payoutDate,
      createdAt: p.createdAt,
    })),
    pagination: { page, totalPages: Math.ceil(total / limit), total },
  };
};

// Platform geneli hakediş tablosu (admin Finans sayfası):
// İşletme başına: brüt (müşteri ödemesi) / platformFarkı / işletmeHakedişi / ödenen / bekleyen
exports.computePlatformFinance = async () => {
  const [markupRate, earnedRows, paidRows, businesses] = await Promise.all([
    getMarkupRate(),
    Order.aggregate([
      { $match: { status: 'PICKED_UP' } },
      {
        $group: {
          _id: '$business',
          gross: { $sum: '$amount' },
          // Eski siparişlerde baseAmount yoksa amount kullan (platform farkı yok)
          net: {
            $sum: {
              $cond: [
                { $gt: ['$baseAmount', 0] },
                '$baseAmount',
                '$amount',
              ],
            },
          },
          orders: { $sum: 1 },
        },
      },
    ]),
    Payout.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: '$business', paid: { $sum: '$netAmount' } } },
    ]),
    Business.find({ status: { $ne: 'PENDING_APPROVAL' } })
      .select('name branchName iban ibanOwner payoutPeriod commissionRate status'),
  ]);

  const earnedBy = new Map(earnedRows.map((r) => [String(r._id), r]));
  const paidBy = new Map(paidRows.map((r) => [String(r._id), r.paid]));

  const rows = businesses.map((b) => {
    const earned = earnedBy.get(String(b._id));
    const gross = earned?.gross || 0;               // müşteri ödemesi
    const net = earned?.net || 0;                   // işletme hakedişi (ödenecek)
    const platformEarning = round2(gross - net);    // platform kazancı
    const rate = markupRate;
    const paid = paidBy.get(String(b._id)) || 0;   // işletmeye ödenen hakediş
    return {
      businessId: b._id,
      name: b.branchName ? `${b.name} - ${b.branchName}` : b.name,
      status: b.status,
      iban: b.iban || '',
      ibanOwner: b.ibanOwner || '',
      payoutPeriod: b.payoutPeriod,
      commissionRate: rate,
      orders: earned?.orders || 0,
      gross,
      commission: platformEarning,  // alan adı geriye dönük uyumluluk için
      platformEarning,
      net,
      paid,
      pending: Math.max(0, round2(net - paid)),
    };
  });

  // Bekleyeni olan üstte, sonra brüte göre
  rows.sort((a, b) => b.pending - a.pending || b.gross - a.gross);

  const totals = rows.reduce(
    (t, r) => ({
      gross: round2(t.gross + r.gross),
      commission: round2(t.commission + r.commission),
      platformEarning: round2(t.platformEarning + r.platformEarning),
      net: round2(t.net + r.net),
      paid: round2(t.paid + r.paid),
      pending: round2(t.pending + r.pending),
    }),
    { gross: 0, commission: 0, platformEarning: 0, net: 0, paid: 0, pending: 0 }
  );

  return { rows, totals };
};

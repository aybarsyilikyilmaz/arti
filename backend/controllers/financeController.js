// İşletme paneli finans uçları — hesap mantığı financeService'te (admin ile ortak).
const Business = require('../models/Business');
const financeService = require('../services/financeService');

exports.getOverview = async (req, res, next) => {
  try {
    const overview = await financeService.computeOverview(req.auth.id);
    res.status(200).json({
      status: 'success',
      data: {
        totalEarned: overview.totalEarned,
        pendingBalance: overview.pendingBalance,
        nextPayoutDate: overview.nextPayoutDate,
        payoutPeriod: overview.payoutPeriod,
        iban: overview.iban,
        ibanOwner: overview.ibanOwner,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPayouts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { payouts, pagination } = await financeService.listPayouts(req.auth.id, { page, limit });
    res.status(200).json({ status: 'success', data: { payouts, pagination } });
  } catch (err) {
    next(err);
  }
};

exports.updateIban = async (req, res, next) => {
  try {
    const { iban, ibanOwner } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.auth.id,
      { iban, ibanOwner },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      status: 'success',
      data: { iban: business.iban, ibanOwner: business.ibanOwner },
    });
  } catch (err) {
    next(err);
  }
};

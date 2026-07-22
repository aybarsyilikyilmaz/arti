// İşletme paneli finans uçları — hesap mantığı financeService'te (admin ile ortak).
const Business = require('../models/Business');
const financeService = require('../services/financeService');

exports.getOverview = async (req, res, next) => {
  try {
    const overview = await financeService.computeOverview(req.auth.id);
    // IBAN kritik finansal bilgi: onay bekleyen bir değişiklik varsa UI'da göster.
    const biz = await Business.findById(req.auth.id).select('pendingUpdates').lean();
    const pu = biz?.pendingUpdates || {};
    res.status(200).json({
      status: 'success',
      data: {
        totalEarned: overview.totalEarned,
        pendingBalance: overview.pendingBalance,
        nextPayoutDate: overview.nextPayoutDate,
        payoutPeriod: overview.payoutPeriod,
        iban: overview.iban,
        ibanOwner: overview.ibanOwner,
        pendingIban: pu.iban ?? null,
        pendingIbanOwner: pu.ibanOwner ?? null,
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
    const business = await Business.findById(req.auth.id);
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });

    // IBAN paranın gittiği yer — kritik finansal bilgi. Direkt değişmez;
    // admin onayına giden pendingUpdates'e yazılır (varsa mevcut talebe eklenir).
    const pending = { ...(business.pendingUpdates || {}) };
    if (iban !== undefined && iban !== business.iban) pending.iban = iban;
    if (ibanOwner !== undefined && ibanOwner !== business.ibanOwner) pending.ibanOwner = ibanOwner;

    if (!('iban' in pending) && !('ibanOwner' in pending)) {
      return res.status(400).json({ status: 'fail', message: 'Değiştirilen bir bilgi bulunamadı.' });
    }

    business.pendingUpdates = pending;
    await business.save();

    require('../services/activityService').log({
      req, businessId: business._id, businessName: business.name, action: 'iban.request',
      message: `IBAN değişiklik talebi oluşturuldu (onaya gitti) — alıcı: ${ibanOwner || '—'}`,
      meta: { iban, ibanOwner },
    });

    res.status(200).json({
      status: 'success',
      pending: true,
      message: 'IBAN değişikliği yönetici onayına iletildi. Onaylanınca yürürlüğe girer.',
      // Henüz onaylanmadı: mevcut (eski) IBAN döner, yeni değer pending olarak gösterilir.
      data: { iban: business.iban, ibanOwner: business.ibanOwner, pendingIban: pending.iban ?? null, pendingIbanOwner: pending.ibanOwner ?? null },
    });
  } catch (err) {
    next(err);
  }
};

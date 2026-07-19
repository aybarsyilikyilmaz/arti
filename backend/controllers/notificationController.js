const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// İşletmenin bildirimlerini getirir
exports.getBusinessNotifications = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.auth.id);
    
    // İşletmeye giden en son 30 bildirim
    const notifications = await Notification.find({ 
      targetType: 'BUSINESS', 
      business: businessId 
    })
    .sort('-createdAt')
    .limit(30);

    const unreadCount = await Notification.countDocuments({
      targetType: 'BUSINESS',
      business: businessId,
      readAt: null
    });

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount,
        notifications: notifications.map(n => ({
          id: n._id,
          type: n.type,
          title: n.title,
          body: n.body,
          isRead: !!n.readAt,
          createdAt: n.createdAt
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Belirli bir bildirimi okundu işaretler
exports.markAsRead = async (req, res, next) => {
  try {
    const businessId = req.auth.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, targetType: 'BUSINESS', business: businessId },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Bildirim bulunamadı.' });
    }

    res.status(200).json({ status: 'success', data: { id: notification._id, isRead: true } });
  } catch (err) {
    next(err);
  }
};

// Tüm okunmamışları okundu işaretler
exports.markAllAsRead = async (req, res, next) => {
  try {
    const businessId = req.auth.id;

    await Notification.updateMany(
      { targetType: 'BUSINESS', business: businessId, readAt: null },
      { readAt: new Date() }
    );

    res.status(200).json({ status: 'success', message: 'Tümü okundu olarak işaretlendi.' });
  } catch (err) {
    next(err);
  }
};

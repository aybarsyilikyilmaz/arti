const express = require('express');
const adminController = require('../controllers/adminController');
const adminBusinessController = require('../controllers/adminBusinessController');
const uploadController = require('../controllers/uploadController');
const { presignSchema, setImagesSchema } = require('../schemas/uploadSchemas');
const { authLimiter, authSlowDown } = require('../middleware/rateLimiters');
const { validateBody, validateQuery } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const adminPlatformController = require('../controllers/adminPlatformController');
const adminTicketController = require('../controllers/adminTicketController');
const settingsController = require('../controllers/settingsController');
const {
  loginSchema,
  listBusinessesQuerySchema,
  adminUpdateBusinessSchema,
  listBusinessOrdersQuerySchema,
  adminBoxPatchSchema,
  payoutStatusSchema,
  adminUpdateEmployeeSchema,
  listAllOrdersQuerySchema,
  listUsersQuerySchema,
  createPayoutSchema,
  listReviewsQuerySchema,
  adminCreateBusinessSchema,
} = require('../schemas/adminSchemas');

const router = express.Router();

router.post('/login', authLimiter, authSlowDown, validateBody(loginSchema), adminController.login);
router.post('/refresh', authLimiter, adminController.refresh);
router.post('/logout', adminController.logout);

router.post('/businesses', protect('admin'), validateBody(adminCreateBusinessSchema), adminPlatformController.createBusiness);
router.get('/businesses', protect('admin'), validateQuery(listBusinessesQuerySchema), adminController.listBusinesses);
router.get('/businesses/:id', protect('admin'), adminController.getBusinessDetail);
router.patch('/businesses/:id/approve', protect('admin'), adminController.approveBusiness);
router.patch('/businesses/:id/suspend', protect('admin'), adminController.suspendBusiness);
router.post('/businesses/:id/approve-update', protect('admin'), adminController.approveProfileUpdate);
router.post('/businesses/:id/reject-update', protect('admin'), adminController.rejectProfileUpdate);
router.post('/orders/:id/refund', protect('admin'), adminController.refundOrder);

// İşletme Detay sayfası — admin, impersonation'sız tam yönetim
router.patch('/businesses/:id/profile', protect('admin'), validateBody(adminUpdateBusinessSchema), adminBusinessController.updateBusinessProfile);
router.get('/businesses/:id/orders', protect('admin'), validateQuery(listBusinessOrdersQuerySchema), adminBusinessController.listBusinessOrders);
router.get('/businesses/:id/boxes', protect('admin'), adminBusinessController.listBusinessBoxes);
router.patch('/businesses/:id/boxes/today', protect('admin'), validateBody(adminBoxPatchSchema), adminBusinessController.patchTodayBox);
router.get('/businesses/:id/finance', protect('admin'), adminBusinessController.getBusinessFinance);
router.patch('/payouts/:payoutId', protect('admin'), validateBody(payoutStatusSchema), adminBusinessController.updatePayoutStatus);
router.post('/businesses/:id/uploads/presign', protect('admin'), validateBody(presignSchema), uploadController.presignForBusiness);
router.patch('/businesses/:id/profile/images', protect('admin'), validateBody(setImagesSchema), uploadController.setImagesForBusiness);
router.get('/businesses/:id/employees', protect('admin'), adminBusinessController.listBusinessEmployees);
router.patch('/employees/:employeeId', protect('admin'), validateBody(adminUpdateEmployeeSchema), adminBusinessController.updateEmployee);
router.delete('/employees/:employeeId', protect('admin'), adminBusinessController.deleteEmployee);

// Platform geneli — Dashboard, siparişler, kullanıcılar, finans, yorumlar
router.get('/dashboard', protect('admin'), adminPlatformController.dashboard);
router.get('/orders', protect('admin'), validateQuery(listAllOrdersQuerySchema), adminPlatformController.listAllOrders);
router.get('/users', protect('admin'), validateQuery(listUsersQuerySchema), adminPlatformController.listUsers);
router.get('/users/:id', protect('admin'), adminPlatformController.getUserDetail);
router.patch('/users/:id/ban', protect('admin'), adminPlatformController.banUser);
router.patch('/users/:id/unban', protect('admin'), adminPlatformController.unbanUser);
router.get('/finance/overview', protect('admin'), adminPlatformController.financeOverview);
router.get('/reviews', protect('admin'), validateQuery(listReviewsQuerySchema), adminPlatformController.listReviews);
router.delete('/reviews/:id', protect('admin'), adminPlatformController.deleteReview);
// Bilet Yönetimi (Destek)
router.get('/tickets', protect('admin'), adminTicketController.listTickets);
router.get('/tickets/:id', protect('admin'), adminTicketController.getTicket);
router.post('/tickets/:id/reply', protect('admin'), adminTicketController.replyTicket);
router.patch('/tickets/:id/status', protect('admin'), adminTicketController.updateTicketStatus);

// Platform genel ayarları (markup oranı vb.)
router.get('/settings', protect('admin'), settingsController.getSettings);
router.patch('/settings', protect('admin'), settingsController.updateSettings);

module.exports = router;

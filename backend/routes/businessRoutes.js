const express = require('express');
const businessController = require('../controllers/businessController');
const boxController = require('../controllers/boxController');
const orderController = require('../controllers/orderController');
const { authLimiter, authSlowDown } = require('../middleware/rateLimiters');
const { validateBody, validateQuery } = require('../middleware/validate');
const { protect, requireApprovedBusiness } = require('../middleware/auth');
const { registerSchema, loginSchema, profileSchema, createBranchSchema } = require('../schemas/businessSchemas');
const { upsertBoxSchema, verifyQrSchema } = require('../schemas/boxSchemas');
const { presignSchema, setImagesSchema } = require('../schemas/uploadSchemas');
const { summaryQuerySchema } = require('../schemas/reportSchemas');
const uploadController = require('../controllers/uploadController');
const reportController = require('../controllers/reportController');
const reviewController = require('../controllers/reviewController');
const notificationController = require('../controllers/notificationController');
const financeController = require('../controllers/financeController');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

// --- Halka açık/misafir endpoint'leri ---
router.post('/register', authLimiter, authSlowDown, validateBody(registerSchema), businessController.register);
router.post('/login', authLimiter, authSlowDown, validateBody(loginSchema), businessController.login);
router.post('/refresh', authLimiter, businessController.refresh);
router.post('/logout', businessController.logout);

// --- Auth korumalı genel alanlar (henüz onaylanmasa bile erişilebilir) ---
// Yalnızca işletme profili tamamlamak vs.

router.get('/branches', protect('business'), businessController.getBranches);
router.post('/branches', protect('business'), validateBody(createBranchSchema), businessController.createBranch);
router.post('/switch-branch', protect('business'), businessController.switchBranch);

// Kutu yayınlama/güncelleme işlemleri ONAY gerektirir (PLAN.md §2)
router.post('/boxes', protect('business'), requireApprovedBusiness, validateBody(upsertBoxSchema), boxController.upsertTodayBox);
router.get('/boxes/today', protect('business'), boxController.getTodayBox);

// QR ile Teslimat Onayı
router.post('/orders/verify', protect('business'), validateBody(verifyQrSchema), orderController.verifyPickup);

// Profil & Ayarlar
router.get('/me', protect('business'), businessController.getMe);
router.patch('/profile', protect('business'), validateBody(profileSchema), businessController.updateProfile);
router.post('/profile/update-request', protect('business'), businessController.updateProfileRequest);

// Analiz & Raporlar
router.get('/reports/summary', protect('business'), validateQuery(summaryQuerySchema), reportController.summary);

// Sipariş Geçmişi
router.get('/orders/recent', protect('business'), reportController.recentOrders);

// Tüm Siparişler (Paginated)
router.get('/orders', protect('business'), reportController.allOrders);

// Müşteri Yorumları
router.get('/reviews', protect('business'), reviewController.businessReviews);

// Bildirimler
router.get('/notifications', protect('business'), notificationController.getBusinessNotifications);
router.patch('/notifications/read-all', protect('business'), notificationController.markAllAsRead);
router.patch('/notifications/:id/read', protect('business'), notificationController.markAsRead);

// Görsel Yüklemeleri (Presigned URL + S3)
router.post('/uploads/presign', protect('business'), validateBody(presignSchema), uploadController.presign);
router.patch('/profile/images', protect('business'), validateBody(setImagesSchema), uploadController.setImages);

// Finans & Ödemeler
router.get('/finance/overview', protect('business'), financeController.getOverview);
router.patch('/finance/iban', protect('business'), financeController.updateIban);
router.get('/finance/payouts', protect('business'), financeController.getPayouts);

// Ekip / Çalışan Yönetimi (RBAC)
router.get('/employees', protect('business'), employeeController.getEmployees);
router.post('/employees', protect('business'), employeeController.createEmployee);
router.patch('/employees/:id', protect('business'), employeeController.updateEmployee);
router.delete('/employees/:id', protect('business'), employeeController.deleteEmployee);

module.exports = router;

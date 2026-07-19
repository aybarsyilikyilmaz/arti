const express = require('express');
const businessController = require('../controllers/businessController');
const boxController = require('../controllers/boxController');
const orderController = require('../controllers/orderController');
const { authLimiter, authSlowDown } = require('../middleware/rateLimiters');
const { validateBody, validateQuery } = require('../middleware/validate');
const { protect, requireApprovedBusiness, requirePage, requireOwner } = require('../middleware/auth');
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
// Şube açma/değiştirme yapısal işlemdir — yalnızca işletme sahibi
router.post('/branches', protect('business'), requireOwner, validateBody(createBranchSchema), businessController.createBranch);
router.post('/switch-branch', protect('business'), requireOwner, businessController.switchBranch);

// Kutu yayınlama/güncelleme işlemleri ONAY gerektirir (PLAN.md §2) + 'kutu' yetkisi
router.post('/boxes', protect('business'), requirePage('kutu'), requireApprovedBusiness, validateBody(upsertBoxSchema), boxController.upsertTodayBox);
router.get('/boxes/today', protect('business'), boxController.getTodayBox);

// QR ile Teslimat Onayı — kutu ya da sipariş yetkisi olan çalışan yapabilir
router.post('/orders/verify', protect('business'), requirePage('kutu', 'siparisler'), validateBody(verifyQrSchema), orderController.verifyPickup);

// Profil & Ayarlar — profil/ayarlar yetkisi gerekir
router.get('/me', protect('business'), businessController.getMe);
router.patch('/profile', protect('business'), requirePage('profil', 'ayarlar'), validateBody(profileSchema), businessController.updateProfile);
router.post('/profile/update-request', protect('business'), requirePage('profil', 'ayarlar'), businessController.updateProfileRequest);

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

// Görsel Yüklemeleri (Presigned URL + S3) — vitrin yetkisi
router.post('/uploads/presign', protect('business'), requirePage('vitrin'), validateBody(presignSchema), uploadController.presign);
router.patch('/profile/images', protect('business'), requirePage('vitrin'), validateBody(setImagesSchema), uploadController.setImages);

// Finans & Ödemeler — okuma 'finans' yetkisi ister; IBAN değişikliği yalnızca sahibe açık
router.get('/finance/overview', protect('business'), requirePage('finans'), financeController.getOverview);
router.patch('/finance/iban', protect('business'), requireOwner, financeController.updateIban);
router.get('/finance/payouts', protect('business'), requirePage('finans'), financeController.getPayouts);

// Ekip / Çalışan Yönetimi (RBAC)
router.get('/employees', protect('business'), employeeController.getEmployees);
router.post('/employees', protect('business'), employeeController.createEmployee);
router.patch('/employees/:id', protect('business'), employeeController.updateEmployee);
router.delete('/employees/:id', protect('business'), employeeController.deleteEmployee);

module.exports = router;

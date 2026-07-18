const express = require('express');
const adminController = require('../controllers/adminController');
const { authLimiter, authSlowDown } = require('../middleware/rateLimiters');
const { validateBody, validateQuery } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { loginSchema, listBusinessesQuerySchema, listOutreachQuerySchema, applyOutreachSchema } = require('../schemas/adminSchemas');

const router = express.Router();

router.post('/login', authLimiter, authSlowDown, validateBody(loginSchema), adminController.login);
router.post('/refresh', authLimiter, adminController.refresh);
router.post('/logout', adminController.logout);

router.get('/businesses', protect('admin'), validateQuery(listBusinessesQuerySchema), adminController.listBusinesses);
router.get('/businesses/:id', protect('admin'), adminController.getBusinessDetail);
router.patch('/businesses/:id/approve', protect('admin'), adminController.approveBusiness);
router.patch('/businesses/:id/suspend', protect('admin'), adminController.suspendBusiness);
router.post('/orders/:id/refund', protect('admin'), adminController.refundOrder);

// WhatsApp otomasyon kuyruğu (PENDING_REVIEW çözümleme)
router.get('/outreach', protect('admin'), validateQuery(listOutreachQuerySchema), adminController.listOutreach);
router.patch('/outreach/:id/apply', protect('admin'), validateBody(applyOutreachSchema), adminController.applyOutreach);
router.patch('/outreach/:id/dismiss', protect('admin'), adminController.dismissOutreach);

module.exports = router;

const express = require('express');
const businessController = require('../controllers/businessController');
const boxController = require('../controllers/boxController');
const orderController = require('../controllers/orderController');
const { authLimiter, authSlowDown } = require('../middleware/rateLimiters');
const { validateBody } = require('../middleware/validate');
const { protect, requireApprovedBusiness } = require('../middleware/auth');
const { registerSchema, loginSchema } = require('../schemas/businessSchemas');
const { upsertBoxSchema, verifyQrSchema } = require('../schemas/boxSchemas');

const router = express.Router();

// Auth uçları: sıkı rate limit + kademeli yavaşlatma + şema doğrulaması
router.post('/register', authLimiter, authSlowDown, validateBody(registerSchema), businessController.register);
router.post('/login', authLimiter, authSlowDown, validateBody(loginSchema), businessController.login);
router.post('/refresh', authLimiter, businessController.refresh);
router.post('/logout', businessController.logout);

// Kutu yönetimi — yalnızca onaylı işletmeler
router.post('/boxes', protect('business'), requireApprovedBusiness, validateBody(upsertBoxSchema), boxController.upsertTodayBox);
router.get('/boxes/today', protect('business'), boxController.getTodayBox);

// QR teslim onayı
router.post('/orders/verify', protect('business'), validateBody(verifyQrSchema), orderController.verifyPickup);

module.exports = router;

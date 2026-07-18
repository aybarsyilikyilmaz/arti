const express = require('express');
const userController = require('../controllers/userController');
const { authLimiter, authSlowDown } = require('../middleware/rateLimiters');
const { validateBody } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../schemas/userSchemas');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authLimiter, authSlowDown, validateBody(registerSchema), userController.register);
router.post('/login', authLimiter, authSlowDown, validateBody(loginSchema), userController.login);
router.post('/refresh', authLimiter, userController.refresh);
router.post('/logout', userController.logout);

// Favoriler (PLAN.md Faz 4)
router.get('/favorites', protect('user'), userController.listFavorites);
router.post('/favorites/:businessId', protect('user'), userController.addFavorite);
router.delete('/favorites/:businessId', protect('user'), userController.removeFavorite);

// Uygulama içi bildirimler
router.get('/notifications', protect('user'), userController.listNotifications);
router.patch('/notifications/read', protect('user'), userController.markNotificationsRead);

module.exports = router;

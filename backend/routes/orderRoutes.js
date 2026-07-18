const express = require('express');
const orderController = require('../controllers/orderController');
const { validateBody } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { checkoutSchema } = require('../schemas/boxSchemas');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Checkout'a özel limit: stok kilitleme spam'ini engeller
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Çok fazla sipariş denemesi. Lütfen biraz bekleyin.' },
});

router.post('/checkout', protect('user'), checkoutLimiter, validateBody(checkoutSchema), orderController.checkout);
router.get('/mine', protect('user'), orderController.myOrders);

module.exports = router;

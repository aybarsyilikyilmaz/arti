const express = require('express');
const userController = require('../controllers/userController');
const { authLimiter, authSlowDown } = require('../middleware/rateLimiters');
const { validateBody } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../schemas/userSchemas');

const router = express.Router();

router.post('/register', authLimiter, authSlowDown, validateBody(registerSchema), userController.register);
router.post('/login', authLimiter, authSlowDown, validateBody(loginSchema), userController.login);
router.post('/refresh', authLimiter, userController.refresh);
router.post('/logout', userController.logout);

module.exports = router;

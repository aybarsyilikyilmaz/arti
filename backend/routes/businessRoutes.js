const express = require('express');
const businessController = require('../controllers/businessController');

const router = express.Router();

router.post('/register', businessController.register);
router.post('/login', businessController.login);

module.exports = router;

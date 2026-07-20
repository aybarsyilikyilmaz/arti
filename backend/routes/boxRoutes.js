const express = require('express');
const boxController = require('../controllers/boxController');
const { validateQuery } = require('../middleware/validate');
const { nearbyQuerySchema } = require('../schemas/boxSchemas');

const router = express.Router();

// Herkese açık: bugünün stoklu kutuları (konum verilirse yakınlık sıralı)
router.get('/', validateQuery(nearbyQuerySchema), boxController.listNearby);

// Herkese açık: Tekil kutu detayı
router.get('/:id', boxController.getBox);

module.exports = router;

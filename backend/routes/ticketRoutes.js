const express = require('express');
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// protect() middleware'i kullanıcıyı veya işletmeyi authenticate eder
router.use(protect('user', 'business', 'admin'));

router.route('/')
  .get(ticketController.listTickets)
  .post(ticketController.createTicket);

router.post('/:id/messages', ticketController.addMessage);
router.patch('/:id/close', ticketController.closeTicket);

module.exports = router;

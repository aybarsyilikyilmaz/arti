const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Business = require('../models/Business');

// Kullanıcı girişli regex aramada özel karakterleri etkisizleştirir (ReDoS + enjeksiyon)
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Admin: Tüm biletleri listele (Kullanıcı / İşletme filtrelemeli)
exports.listTickets = async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    
    // type = 'user' veya 'business'
    if (type === 'user') {
      filter.user = { $exists: true };
    } else if (type === 'business') {
      filter.business = { $exists: true };
    }
    
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      if (type === 'user') {
        const users = await User.find({ $or: [{ name: regex }, { email: regex }] }, '_id');
        filter.user = { $in: users.map(u => u._id) };
      } else if (type === 'business') {
        const businesses = await Business.find({ $or: [{ name: regex }, { email: regex }] }, '_id');
        filter.business = { $in: businesses.map(b => b._id) };
      } else {
        const users = await User.find({ $or: [{ name: regex }, { email: regex }] }, '_id');
        const businesses = await Business.find({ $or: [{ name: regex }, { email: regex }] }, '_id');
        filter.$or = [
          { user: { $in: users.map(u => u._id) } },
          { business: { $in: businesses.map(b => b._id) } },
          { ticketNumber: regex }
        ];
      }
    }

    const tickets = await Ticket.find(filter)
      .sort('-updatedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email phone')
      .populate('business', 'name branchName whatsappPhone email');

    const total = await Ticket.countDocuments(filter);
    
    res.status(200).json({ status: 'success', total, data: { tickets } });
  } catch (err) {
    next(err);
  }
};

// Admin: Bilet Detayı
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('business', 'name branchName whatsappPhone');
      
    if (!ticket) return res.status(404).json({ status: 'fail', message: 'Bilet bulunamadı.' });

    res.status(200).json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

// Admin: Mesaj gönder (Yanıtla)
exports.replyTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ status: 'fail', message: 'Mesaj boş olamaz.' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ status: 'fail', message: 'Bilet bulunamadı.' });

    ticket.messages.push({
      senderModel: 'Admin',
      senderId: req.auth.id,
      text: message
    });
    
    ticket.status = 'ANSWERED';
    await ticket.save();

    res.status(200).json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

// Admin: Bileti kapat / aç
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['OPEN', 'ANSWERED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Geçersiz durum.' });
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) return res.status(404).json({ status: 'fail', message: 'Bilet bulunamadı.' });

    res.status(200).json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

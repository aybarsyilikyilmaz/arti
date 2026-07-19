const Ticket = require('../models/Ticket');

// Biletleri listele
exports.listTickets = async (req, res, next) => {
  try {
    const isBusiness = req.auth.role === 'business';
    const filter = isBusiness ? { business: req.auth.id } : { user: req.auth.id };

    const tickets = await Ticket.find(filter).sort('-updatedAt');
    res.status(200).json({ status: 'success', data: { tickets } });
  } catch (err) {
    next(err);
  }
};

// Yeni bilet oluştur
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ status: 'fail', message: 'Konu ve ilk mesaj zorunludur.' });
    }

    const isBusiness = req.auth.role === 'business';
    
    const ticket = await Ticket.create({
      user: isBusiness ? undefined : req.auth.id,
      business: isBusiness ? req.auth.id : undefined,
      subject,
      messages: [{
        senderModel: isBusiness ? 'Business' : 'User',
        senderId: req.auth.id,
        text: message
      }]
    });

    res.status(201).json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

// Bilete detay/mesaj ekle
exports.addMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ status: 'fail', message: 'Mesaj boş olamaz.' });
    }

    const isBusiness = req.auth.role === 'business';
    const filter = isBusiness ? { _id: req.params.id, business: req.auth.id } : { _id: req.params.id, user: req.auth.id };

    const ticket = await Ticket.findOne(filter);
    if (!ticket) {
      return res.status(404).json({ status: 'fail', message: 'Bilet bulunamadı.' });
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ status: 'fail', message: 'Bu bilet kapatılmış, yeni mesaj eklenemez.' });
    }

    ticket.messages.push({
      senderModel: isBusiness ? 'Business' : 'User',
      senderId: req.auth.id,
      text: message
    });

    // Kullanıcı mesaj attığında durum OPEN olur (adminin görmesi için)
    ticket.status = 'OPEN';
    await ticket.save();

    res.status(200).json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

// Bileti çözüldü olarak işaretle
exports.closeTicket = async (req, res, next) => {
  try {
    const isBusiness = req.auth.role === 'business';
    const filter = isBusiness ? { _id: req.params.id, business: req.auth.id } : { _id: req.params.id, user: req.auth.id };

    const ticket = await Ticket.findOneAndUpdate(filter, { status: 'CLOSED' }, { new: true });
    if (!ticket) {
      return res.status(404).json({ status: 'fail', message: 'Bilet bulunamadı.' });
    }

    res.status(200).json({ status: 'success', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

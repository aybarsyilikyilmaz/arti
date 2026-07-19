const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderModel: { 
    type: String, 
    enum: ['User', 'Business', 'Admin'], 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const ticketSchema = new mongoose.Schema({
  // Bilet ya normal bir kullanıcıya (User) ya da bir işletmeye (Business) aittir.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    index: true
  },
  ticketNumber: { 
    type: String, 
    unique: true 
  },
  subject: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 150
  },
  status: { 
    type: String, 
    enum: ['OPEN', 'ANSWERED', 'CLOSED'], 
    default: 'OPEN',
    index: true
  },
  messages: [messageSchema],
}, {
  timestamps: true
});

// Kaydedilmeden önce ticketNumber oluştur
ticketSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    // Rastgele 8 haneli alfanumerik (büyük harf)
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.ticketNumber = `TCK-${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);

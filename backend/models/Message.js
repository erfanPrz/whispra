const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending',
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 
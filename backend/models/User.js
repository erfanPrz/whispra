const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  chatId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastMessageAt: {
    type: Date,
    default: null,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  settings: {
    allowMessages: {
      type: Boolean,
      default: true,
    },
    messageLimit: {
      type: Number,
      default: 1000, // characters
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User; 
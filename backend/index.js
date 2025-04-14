const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { bot } = require('./telegram');
const connectDB = require('./db/connection');
const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Connect user with Telegram
app.post('/api/connect', async (req, res) => {
  const { username, chatId } = req.body;
  
  if (!username || !chatId) {
    return res.status(400).json({ error: 'Username and chatId are required' });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ username });
    
    if (user) {
      // Update chatId if user exists
      user.chatId = chatId;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        username,
        chatId,
      });
    }

    res.json({ 
      success: true, 
      message: 'User connected successfully',
      data: {
        username: user.username,
        createdAt: user.createdAt,
        messageCount: user.messageCount
      }
    });
  } catch (error) {
    console.error('Error in /api/connect:', error);
    res.status(500).json({ 
      error: 'Failed to connect user',
      details: error.message
    });
  }
});

// Send anonymous message
app.post('/api/message/:username', async (req, res) => {
  const { username } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  try {
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user allows messages
    if (!user.settings.allowMessages) {
      return res.status(403).json({ error: 'User is not accepting messages' });
    }

    // Check message length
    if (text.length > user.settings.messageLimit) {
      return res.status(400).json({ 
        error: `Message is too long (max ${user.settings.messageLimit} characters)` 
      });
    }

    // Create message record
    const message = await Message.create({
      recipient: user._id,
      text,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    try {
      // Send message via Telegram
      await bot.sendMessage(user.chatId, `📨 New anonymous message:\n\n${text}\n\n⏰ ${new Date().toLocaleString()}`);
      
      // Update message status
      message.status = 'delivered';
      await message.save();

      // Update user stats
      user.messageCount += 1;
      user.lastMessageAt = new Date();
      await user.save();

      res.json({ 
        success: true, 
        message: 'Message sent successfully',
        data: {
          messageCount: user.messageCount
        }
      });
    } catch (error) {
      // Update message status to failed
      message.status = 'failed';
      await message.save();

      console.error('Error sending Telegram message:', error);
      res.status(500).json({ 
        error: 'Failed to send message',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error in /api/message:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get user info
app.get('/api/user/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get message statistics
    const messageStats = await Message.aggregate([
      { $match: { recipient: user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] 
            } 
          },
          failed: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0] 
            } 
          }
        }
      }
    ]);

    res.json({ 
      username: user.username,
      createdAt: user.createdAt,
      messageCount: user.messageCount,
      lastMessageAt: user.lastMessageAt,
      settings: user.settings,
      statistics: messageStats[0] || { total: 0, delivered: 0, failed: 0 }
    });
  } catch (error) {
    console.error('Error in /api/user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
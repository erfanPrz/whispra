const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { bot } = require('./telegram');
const connectDB = require('./db/connection');
const User = require('./models/User');
const Message = require('./models/Message');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Backend is working!' });
});

// Connect user with Telegram
app.post('/api/connect', async (req, res) => {
  console.log('Connect endpoint hit', req.body);
  const { username, chatId } = req.body;
  
  if (!username || !chatId) {
    console.log('Missing username or chatId');
    return res.status(400).json({ error: 'Username and chatId are required' });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ username });
    console.log('User found:', user);
    
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
      console.log('New user created:', user);
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
  console.log('Message endpoint hit', req.params, req.body);
  const { username } = req.params;
  const { text } = req.body;

  if (!text) {
    console.log('Missing message text');
    return res.status(400).json({ error: 'Message text is required' });
  }

  try {
    // Find user
    const user = await User.findOne({ username });
    console.log('User found for message:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user allows messages
    if (!user.settings.allowMessages) {
      console.log('User not accepting messages');
      return res.status(403).json({ error: 'User is not accepting messages' });
    }

    // Check message length
    if (text.length > user.settings.messageLimit) {
      console.log('Message too long');
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
    console.log('Message created:', message);

    try {
      // Send message via Telegram
      await bot.sendMessage(user.chatId, `📨 New anonymous message:\n\n${text}\n\n⏰ ${new Date().toLocaleString()}`);
      console.log('Message sent to Telegram');
      
      // Update message status
      message.status = 'delivered';
      await message.save();

      // Update user stats
      user.messageCount += 1;
      user.lastMessageAt = new Date();
      await user.save();
      console.log('User stats updated');

      res.json({ 
        success: true, 
        message: 'Message sent successfully',
        data: {
          messageCount: user.messageCount
        }
      });
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      // Update message status to failed
      message.status = 'failed';
      await message.save();

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
  console.log('User info endpoint hit', req.params);
  const { username } = req.params;
  
  try {
    const user = await User.findOne({ username });
    console.log('User found for info:', user);
    
    if (!user) {
      console.log('User not found');
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
    console.log('Message stats:', messageStats);

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
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 

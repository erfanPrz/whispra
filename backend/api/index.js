const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { bot } = require('../telegram');
const { connectDB, getConnection } = require('../db/connection');
const User = require('../models/User');
const Message = require('../models/Message');

// Load environment variables
dotenv.config();

// Log all environment variables (without sensitive data)
console.log('Environment Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not Set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not Set');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize MongoDB connection
let dbConnection = null;

const initializeDB = async () => {
  if (!dbConnection) {
    try {
      console.log('Attempting to connect to MongoDB...');
      console.log('Connection string:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
      
      dbConnection = await connectDB();
      if (dbConnection) {
        console.log('MongoDB connected successfully');
        // Test database connection with a simple query
        try {
          const testUser = await User.findOne({});
          console.log('Database test query successful');
        } catch (error) {
          console.error('Database test query failed:', error);
        }
      } else {
        console.log('MongoDB connection failed or not configured');
      }
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }
  return dbConnection;
};

// Initialize database connection
initializeDB().catch(console.error);

// Test bot endpoint
app.get('/test-bot', async (req, res) => {
  try {
    console.log('Testing bot connection...');
    const botInfo = await bot.getMe();
    console.log('Bot info:', botInfo);
    
    res.json({
      status: 'success',
      bot: {
        username: botInfo.username,
        id: botInfo.id,
        first_name: botInfo.first_name
      }
    });
  } catch (error) {
    console.error('Bot test failed:', error);
    res.status(500).json({
      status: 'error',
      error: 'Bot test failed',
      details: error.message
    });
  }
});

// Test database endpoint
app.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
    
    const db = getConnection();
    if (!db) {
      // Try to establish a new connection
      console.log('No cached connection found, attempting new connection...');
      const newConnection = await connectDB();
      if (!newConnection) {
        throw new Error('Failed to establish database connection');
      }
      console.log('New connection established successfully');
    }
    
    // Test database with a simple query
    console.log('Performing test query...');
    const testUser = await User.findOne({});
    console.log('Database test query successful');
    
    res.json({
      status: 'success',
      database: {
        connected: true,
        host: db.connection.host,
        name: db.connection.name,
        state: db.connection.readyState === 1 ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      status: 'error',
      error: 'Database test failed',
      details: error.message,
      environment: process.env.NODE_ENV,
      mongodb_uri: process.env.MONGODB_URI ? 'Set' : 'Not Set'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  try {
    console.log('Root endpoint hit');
    const dbStatus = getConnection() ? 'connected' : 'disconnected';
    res.json({ 
      message: 'Welcome to the API',
      status: 'ok',
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Error in root endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  try {
    console.log('Test endpoint hit');
    const dbStatus = getConnection() ? 'connected' : 'disconnected';
    res.json({ 
      message: 'Backend is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      services: {
        telegram: process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'not configured',
        mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured'
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Connect user with Telegram
app.post('/connect', async (req, res) => {
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
    console.error('Error in /connect:', error);
    res.status(500).json({ 
      error: 'Failed to connect user',
      details: error.message
    });
  }
});

// Send anonymous message
app.post('/message/:username', async (req, res) => {
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
    console.error('Error in /message:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get user info
app.get('/user/:username', async (req, res) => {
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
    console.error('Error in /user:', error);
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

// Export the Express API
module.exports = app; 
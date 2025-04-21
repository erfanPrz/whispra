const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { connectDB, getConnection } = require('./db/connection');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Log configuration
console.log('Bot Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not Set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not Set');

// Validate required environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set');
  process.exit(1);
}

// Initialize bot without polling
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Function to ensure database connection
const ensureDatabaseConnection = async () => {
  try {
    const db = getConnection();
    if (!db || db.readyState !== 1) {
      console.log('Database not connected, attempting to connect...');
      await connectDB();
    }
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Function to safely perform database operations with retries
const safeDatabaseOperation = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Ensure database connection before operation
      const isConnected = await ensureDatabaseConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      
      // Perform the operation
      return await operation();
    } catch (error) {
      console.error(`Database operation attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Handle /start command with improved error handling
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  console.log('New user started bot:', { chatId, username });

  try {
    // Use safe database operation
    const user = await safeDatabaseOperation(async () => {
      let user = await User.findOne({ username });
      if (!user) {
        user = await User.create({
          username,
          chatId: chatId.toString(),
          settings: {
            allowMessages: true,
            messageLimit: 1000
          }
        });
        console.log('Created new user:', user);
      }
      return user;
    });

    // Generate user's link
    const frontendUrl = process.env.FRONTEND_URL || 'https://whispra-frontend.vercel.app';
    const userLink = `${frontendUrl}/${username.toLowerCase()}`;

    // Send welcome message
    const message = `
👋 Welcome to Whispra!

Your unique link to receive anonymous messages:
${userLink}

Share this link with others to receive anonymous messages.

📝 How it works:
1. Share your link with friends
2. They can send you messages anonymously
3. You'll receive them here in this chat

🔗 Quick Actions:
• /link - Get your message link again
    `.trim();

    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

  } catch (error) {
    console.error('Error in /start command:', error);
    await bot.sendMessage(chatId, 'Sorry, I\'m having trouble connecting to the database. Please try again in a few moments.');
  }
});

// Handle /link command with improved error handling
bot.onText(/\/link/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  console.log('User requested link:', { chatId, username });

  try {
    // Use safe database operation
    const user = await safeDatabaseOperation(async () => {
      let user = await User.findOne({ username });
      if (!user) {
        user = await User.create({
          username,
          chatId: chatId.toString(),
          settings: {
            allowMessages: true,
            messageLimit: 1000
          }
        });
        console.log('Created new user:', user);
      }
      return user;
    });

    // Generate user's link
    const frontendUrl = process.env.FRONTEND_URL || 'https://whispra-frontend.vercel.app';
    const userLink = `${frontendUrl}/${username.toLowerCase()}`;

    // Send link message
    const message = `
🔗 Your message link:
${userLink}

Share this link to receive anonymous messages!
    `.trim();

    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

  } catch (error) {
    console.error('Error in /link command:', error);
    await bot.sendMessage(chatId, 'Sorry, I\'m having trouble connecting to the database. Please try again in a few moments.');
  }
});

// Function to send anonymous messages to users with improved error handling
const sendMessage = async (chatId, text) => {
  try {
    const message = `📨 New anonymous message:\n\n${text}\n\n⏰ ${new Date().toLocaleString()}`;
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  bot
}; 
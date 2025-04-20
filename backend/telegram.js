const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { connectDB } = require('./db/connection');
const User = require('./models/User');

dotenv.config();

// Log environment variables
console.log('Bot Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not Set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not Set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set');
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

// Create bot instance
const bot = new TelegramBot(token, {
  polling: true
});

// Test bot connection
bot.getMe()
  .then((botInfo) => {
    console.log('Bot is running! Username:', botInfo.username);
  })
  .catch((error) => {
    console.error('Failed to start bot:', error);
  });

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  console.log('New user:', { chatId, username });

  try {
    // Connect to database
    await connectDB();
    
    // Check if user exists
    let user = await User.findOne({ username });
    
    if (!user) {
      // Create new user
      user = await User.create({
        username,
        chatId: chatId.toString(),
        settings: {
          allowMessages: true,
          messageLimit: 1000
        }
      });
      console.log('New user created:', user);
    }

    // Generate user's link
    const frontendUrl = process.env.FRONTEND_URL || 'https://whispra-nine.vercel.app';
    const userLink = `${frontendUrl}/${username.toLowerCase()}`;

    // Send welcome message with link
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
    console.error('Error:', error);
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Handle /link command
bot.onText(/\/link/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  try {
    // Connect to database
    await connectDB();
    
    // Get or create user
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
    }

    // Generate user's link
    const frontendUrl = process.env.FRONTEND_URL || 'https://whispra-nine.vercel.app';
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
    console.error('Error:', error);
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Function to send a message to a user
const sendMessage = async (chatId, text) => {
  try {
    const formattedMessage = `📨 New anonymous message:\n\n${text}\n\n⏰ ${new Date().toLocaleString()}`;
    await bot.sendMessage(chatId, formattedMessage, {
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
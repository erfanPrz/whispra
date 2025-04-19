const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { connectDB } = require('./db/connection');
const User = require('./models/User');

dotenv.config();

// Log environment variables (without exposing the token)
console.log('Telegram Bot Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not Set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not Set');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in environment variables');
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

// Create a bot instance with more options
const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
      allowed_updates: ['message', 'callback_query']
    }
  }
});

// Log bot initialization
console.log('Bot initialized with token:', token.substring(0, 5) + '...');

// Test the bot connection immediately
bot.getMe()
  .then((botInfo) => {
    console.log('Bot is running! Username:', botInfo.username);
    console.log('Bot ID:', botInfo.id);
    console.log('Bot First Name:', botInfo.first_name);
  })
  .catch((error) => {
    console.error('Failed to get bot info:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response
    });
  });

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    response: error.response
  });
});

// Handle webhook errors
bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    response: error.response
  });
});

// Handle any message
bot.on('message', (msg) => {
  console.log('Received message:', {
    chatId: msg.chat.id,
    username: msg.from.username,
    text: msg.text,
    type: msg.chat.type
  });
});

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  console.log('Received /start command from:', {
    chatId,
    username,
    firstName: msg.from.first_name,
    lastName: msg.from.last_name
  });
  
  try {
    // Ensure database connection
    const db = await connectDB();
    if (!db) {
      throw new Error('Database connection failed');
    }

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
    } else {
      // Update chatId if it has changed
      if (user.chatId !== chatId.toString()) {
        user.chatId = chatId.toString();
        await user.save();
        console.log('User chatId updated:', user);
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://whispra-nine.vercel.app';
    const userLink = `${frontendUrl}/${username.toLowerCase()}`;

    const welcomeMessage = `
👋 Welcome to Whispra!

Your anonymous message link is:
${userLink}

Share this link with others to receive anonymous messages.

📝 How it works:
1. Share your link with friends
2. They can send you messages anonymously
3. You'll receive them here in this chat

⚠️ Note: Messages are completely anonymous - we don't store any sender information.

🔗 Quick Actions:
• /help - Show this message
• /link - Get your message link
    `.trim();

    const result = await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    console.log('Welcome message sent successfully:', result.message_id);
  } catch (error) {
    console.error('Error handling /start command:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response
    });
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  console.log('Received /help command from:', {
    chatId,
    username,
    firstName: msg.from.first_name,
    lastName: msg.from.last_name
  });
  
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'https://whispra-nine.vercel.app';
    const userLink = `${frontendUrl}/${username.toLowerCase()}`;

    const helpMessage = `
🤖 Whispra Bot Commands:

• /start - Start the bot and get your message link
• /help - Show this help message
• /link - Get your message link

📝 How to use:
1. Share your message link with friends
2. They can send you anonymous messages
3. You'll receive them here in this chat

🔗 Your message link:
${userLink}
    `.trim();

    const result = await bot.sendMessage(chatId, helpMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    console.log('Help message sent successfully:', result.message_id);
  } catch (error) {
    console.error('Error handling /help command:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response
    });
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Handle /link command
bot.onText(/\/link/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  console.log('Received /link command from:', {
    chatId,
    username,
    firstName: msg.from.first_name,
    lastName: msg.from.last_name
  });
  
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'https://whispra-nine.vercel.app';
    const userLink = `${frontendUrl}/${username.toLowerCase()}`;

    const linkMessage = `
🔗 Your message link:
${userLink}

Share this link to receive anonymous messages!
    `.trim();

    const result = await bot.sendMessage(chatId, linkMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    console.log('Link message sent successfully:', result.message_id);
  } catch (error) {
    console.error('Error handling /link command:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response
    });
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Handle errors
bot.on('error', (error) => {
  console.error('Telegram bot error:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    response: error.response
  });
});

// Function to send a message to a user
const sendMessage = async (chatId, text) => {
  try {
    console.log('Attempting to send message to chatId:', chatId);
    const formattedMessage = `📨 New anonymous message:\n\n${text}\n\n⏰ ${new Date().toLocaleString()}`;
    
    const result = await bot.sendMessage(chatId, formattedMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    console.log('Message sent successfully:', result.message_id);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response
    });
    throw error;
  }
};

module.exports = {
  sendMessage,
  bot
}; 
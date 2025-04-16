const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

// Log environment variables (without exposing the token)
console.log('Telegram Bot Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not Set');

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
      timeout: 10
    }
  }
});

// Log bot initialization
console.log('Bot initialized with token:', token.substring(0, 5) + '...');

// Function to send a message to a user
const sendMessage = async (chatId, text) => {
  try {
    console.log('Attempting to send message to chatId:', chatId);
    // Format the message with emoji and timestamp
    const formattedMessage = `📨 New anonymous message:\n\n${text}\n\n⏰ ${new Date().toLocaleString()}`;
    
    const result = await bot.sendMessage(chatId, formattedMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    console.log('Message sent successfully:', result.message_id);
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response
    });
    throw error;
  }
};

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
    const welcomeMessage = `
👋 Welcome to Whispra!

Your anonymous message link is:
https://whispra-onxf.vercel.app/${username}

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
https://whispra-onxf.vercel.app/${username}
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
    const linkMessage = `
🔗 Your message link:
https://whispra-onxf.vercel.app/${username}

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

// Log when the bot is ready
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error);
});

// Test the bot on startup
console.log('Testing bot connection...');
bot.getMe()
  .then((botInfo) => {
    console.log('Bot is running! Username:', botInfo.username);
  })
  .catch((error) => {
    console.error('Failed to get bot info:', error);
  });

module.exports = {
  sendMessage,
  bot
}; 
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Function to send a message to a user
const sendMessage = async (chatId, text) => {
  try {
    // Format the message with emoji and timestamp
    const formattedMessage = `📨 New anonymous message:\n\n${text}\n\n⏰ ${new Date().toLocaleString()}`;
    
    await bot.sendMessage(chatId, formattedMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
};

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
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

    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } catch (error) {
    console.error('Error handling /start command:', error);
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
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

    await bot.sendMessage(chatId, helpMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } catch (error) {
    console.error('Error handling /help command:', error);
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Handle /link command
bot.onText(/\/link/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  try {
    const linkMessage = `
🔗 Your message link:
https://whispra-onxf.vercel.app/${username}

Share this link to receive anonymous messages!
    `.trim();

    await bot.sendMessage(chatId, linkMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } catch (error) {
    console.error('Error handling /link command:', error);
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Handle errors
bot.on('error', (error) => {
  console.error('Telegram bot error:', error);
});

module.exports = {
  sendMessage,
  bot
}; 
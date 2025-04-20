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
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in environment variables');
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

// Create a bot instance with more robust options
const bot = new TelegramBot(token, {
  polling: {
    interval: 1000, // Increased interval
    autoStart: true,
    params: {
      timeout: 30, // Increased timeout
      allowed_updates: ['message', 'callback_query']
    }
  }
});

// Track bot state
let isBotRunning = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Function to initialize bot
const initializeBot = async () => {
  try {
    console.log('Initializing bot...');
    
    // Test the bot connection
    const botInfo = await bot.getMe();
    console.log('Bot is running! Username:', botInfo.username);
    console.log('Bot ID:', botInfo.id);
    console.log('Bot First Name:', botInfo.first_name);
    
    isBotRunning = true;
    reconnectAttempts = 0;
    
    return true;
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    return false;
  }
};

// Initialize bot immediately
initializeBot().then(success => {
  if (!success && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    console.log('Retrying bot initialization...');
    setTimeout(initializeBot, 5000); // Retry after 5 seconds
    reconnectAttempts++;
  }
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
  isBotRunning = false;
  
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    console.log('Attempting to reconnect...');
    setTimeout(initializeBot, 5000);
    reconnectAttempts++;
  } else {
    console.error('Max reconnection attempts reached');
  }
});

// Handle webhook errors
bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error);
  isBotRunning = false;
  
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    console.log('Attempting to reconnect...');
    setTimeout(initializeBot, 5000);
    reconnectAttempts++;
  }
});

// Handle any message
bot.on('message', (msg) => {
  console.log('Received message:', {
    chatId: msg.chat.id,
    username: msg.from.username,
    text: msg.text,
    type: msg.chat.type,
    timestamp: new Date().toISOString()
  });
});

// Function to ensure database connection
const ensureDatabaseConnection = async () => {
  try {
    console.log('Attempting to connect to database...');
    const db = await connectDB();
    if (!db) {
      console.error('Database connection failed - no connection returned');
      return false;
    }
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Error ensuring database connection:', error);
    return false;
  }
};

// Function to send welcome message with link generation option
const sendWelcomeMessage = async (chatId, username) => {
  try {
    if (!isBotRunning) {
      console.error('Bot is not running, cannot send welcome message');
      return false;
    }

    const welcomeMessage = `
👋 Welcome to Whispra!

I'm your anonymous messaging bot. Would you like to get your unique link to receive anonymous messages?

Click the button below to get started!
    `.trim();

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Yes, get my link!', callback_data: 'generate_link' },
            { text: 'No, maybe later', callback_data: 'skip_link' }
          ]
        ]
      }
    };

    console.log('Sending welcome message to:', { chatId, username });
    const result = await bot.sendMessage(chatId, welcomeMessage, options);
    console.log('Welcome message sent successfully:', result.message_id);
    return true;
  } catch (error) {
    console.error('Error sending welcome message:', error);
    return false;
  }
};

// Handle callback queries (button clicks)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const username = callbackQuery.from.username || `user${chatId}`;
  const data = callbackQuery.data;

  console.log('Received callback query:', {
    chatId,
    username,
    data,
    timestamp: new Date().toISOString()
  });

  try {
    // Answer the callback query to remove the loading state
    await bot.answerCallbackQuery(callbackQuery.id);

    if (data === 'generate_link') {
      // Ensure database connection
      const dbConnected = await ensureDatabaseConnection();
      if (!dbConnected) {
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

      const successMessage = `
✅ Great! Your unique link has been created:

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

      await bot.sendMessage(chatId, successMessage, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    } else if (data === 'skip_link') {
      const skipMessage = `
No problem! You can get your link anytime by:
1. Using the /link command
2. Clicking the "Get Link" button in the menu
3. Sending /start again

Let me know if you change your mind! 😊
      `.trim();

      await bot.sendMessage(chatId, skipMessage);
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `user${chatId}`;
  
  console.log('Received /start command from:', {
    chatId,
    username,
    firstName: msg.from.first_name,
    lastName: msg.from.last_name,
    timestamp: new Date().toISOString()
  });
  
  try {
    if (!isBotRunning) {
      console.log('Bot is not running, attempting to reconnect...');
      const reconnected = await initializeBot();
      if (!reconnected) {
        throw new Error('Bot is not running and reconnection failed');
      }
    }

    const success = await sendWelcomeMessage(chatId, username);
    if (!success) {
      throw new Error('Failed to send welcome message');
    }
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
    if (!isBotRunning) {
      console.log('Bot is not running, attempting to reconnect...');
      const reconnected = await initializeBot();
      if (!reconnected) {
        throw new Error('Bot is not running and reconnection failed');
      }
    }

    const helpMessage = `
🤖 Whispra Bot Commands:

• /start - Start the bot and get your message link
• /help - Show this help message
• /link - Get your message link

📝 How to use:
1. Share your message link with friends
2. They can send you anonymous messages
3. You'll receive them here in this chat
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
    if (!isBotRunning) {
      console.log('Bot is not running, attempting to reconnect...');
      const reconnected = await initializeBot();
      if (!reconnected) {
        throw new Error('Bot is not running and reconnection failed');
      }
    }

    // Ensure database connection
    const dbConnected = await ensureDatabaseConnection();
    if (!dbConnected) {
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
      console.log('New user created via /link command:', user);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://whispra-nine.vercel.app';
    const userLink = `${frontendUrl}/${username.toLowerCase()}`;

    const linkMessage = `
🔗 Your message link:
${userLink}

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
  isBotRunning = false;
  
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    console.log('Attempting to reconnect...');
    setTimeout(initializeBot, 5000);
    reconnectAttempts++;
  }
});

// Function to send a message to a user
const sendMessage = async (chatId, text) => {
  try {
    if (!isBotRunning) {
      console.log('Bot is not running, attempting to reconnect...');
      const reconnected = await initializeBot();
      if (!reconnected) {
        throw new Error('Bot is not running and reconnection failed');
      }
    }

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
    throw error;
  }
};

module.exports = {
  sendMessage,
  bot
}; 
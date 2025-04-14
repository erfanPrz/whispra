# AnonX - Anonymous Telegram Messaging

AnonX is a web application that allows users to receive anonymous messages through Telegram. Users can share their unique link, and anyone can send them messages anonymously.

## Features

- 🔒 Anonymous messaging through Telegram
- 📱 Mobile-friendly interface
- 📊 Message statistics and tracking
- 🛡️ Basic message validation and error handling
- 🔄 Real-time message delivery

## Tech Stack

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express
- Messaging: Telegram Bot API
- Database: In-memory storage (can be replaced with MongoDB for production)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Telegram bot token (get it from [@BotFather](https://t.me/BotFather))

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Telegram bot token:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   PORT=3001
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Start your Telegram bot by sending `/start` to it
2. The bot will provide you with your unique anonymous message link
3. Share this link with others
4. Anyone can visit your link and send you anonymous messages
5. Messages will be delivered to your Telegram chat

## Development

### Project Structure

```
anonx/
├── backend/            # Express server and Telegram bot
│   ├── index.js        # Main server file
│   ├── telegram.js     # Telegram bot logic
│   └── .env            # Environment variables
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   └── App.tsx     # Main application
│   └── public/         # Static files
└── README.md           # Project documentation
```

### Adding New Features

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Security Considerations

- Messages are completely anonymous - no sender information is stored
- Basic message validation is implemented
- Consider adding rate limiting for production use
- Consider implementing message moderation for production use

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
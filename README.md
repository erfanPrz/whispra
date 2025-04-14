# Whispra - Anonymous Messaging Platform

A platform that allows users to receive anonymous messages via Telegram.

## Project Structure

```
.
├── frontend/          # React frontend application
└── backend/          # Node.js backend server
```

## Deployment Instructions

### Backend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. In the project settings, add these environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   PORT=3001
   ```
5. Deploy the project

### Frontend Deployment (Vercel)

1. Create another project on Vercel
2. Import your GitHub repository
3. In the project settings, add this environment variable:
   ```
   REACT_APP_API_URL=your_backend_url
   ```
4. Deploy the project

## Local Development

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`

4. Start the development server:
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

3. Create a `.env` file based on `.env.example`

4. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

### Backend (.env)
```
PORT=3001
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
MONGODB_URI=your_mongodb_connection_string
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

## Features

- Anonymous messaging via Telegram
- Real-time message delivery
- Message statistics and analytics
- User settings and preferences
- Secure and private communication

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
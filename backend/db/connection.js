const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Log environment variables (without exposing sensitive data)
console.log('MongoDB Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

let cachedDb = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

const connectDB = async () => {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      return null;
    }

    // Validate MongoDB URI format
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      console.error('Invalid MongoDB URI format. URI should start with mongodb:// or mongodb+srv://');
      return null;
    }

    // Log connection attempt details
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string format:', process.env.MONGODB_URI.startsWith('mongodb+srv://') ? 'MongoDB Atlas' : 'MongoDB Local');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2
    });

    // Log successful connection details
    console.log('MongoDB Connection Details:');
    console.log('- Host:', conn.connection.host);
    console.log('- Database:', conn.connection.name);
    console.log('- Port:', conn.connection.port);
    console.log('- User:', conn.connection.user || 'Not specified');
    console.log('- State:', conn.connection.readyState === 1 ? 'Connected' : 'Disconnected');

    // Set up connection event handlers
    conn.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
      connectionAttempts = 0;
    });

    conn.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      if (connectionAttempts < MAX_RETRIES) {
        connectionAttempts++;
        console.log(`Retrying connection (attempt ${connectionAttempts}/${MAX_RETRIES})...`);
        setTimeout(connectDB, 5000); // Retry after 5 seconds
      }
    });

    conn.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      if (connectionAttempts < MAX_RETRIES) {
        connectionAttempts++;
        console.log(`Retrying connection (attempt ${connectionAttempts}/${MAX_RETRIES})...`);
        setTimeout(connectDB, 5000);
      }
    });

    cachedDb = conn;
    return conn;
  } catch (error) {
    // Enhanced error logging
    console.error('MongoDB Connection Error Details:');
    console.error('- Error Name:', error.name);
    console.error('- Error Code:', error.code);
    console.error('- Error Message:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('Network Error: Could not resolve the hostname');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection Timeout: Could not connect to the server');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection Refused: Server is not accepting connections');
    } else if (error.name === 'MongoParseError') {
      console.error('Invalid Connection String: Check the format of your MONGODB_URI');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Server Selection Error: Could not find a suitable server');
    }

    if (connectionAttempts < MAX_RETRIES) {
      connectionAttempts++;
      console.log(`Retrying connection (attempt ${connectionAttempts}/${MAX_RETRIES})...`);
      setTimeout(connectDB, 5000);
    }

    return null;
  }
};

// Export both the function and the cached connection
module.exports = {
  connectDB,
  getConnection: () => cachedDb
};

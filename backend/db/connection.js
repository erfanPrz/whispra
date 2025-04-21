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
const RETRY_DELAY = 5000; // 5 seconds

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
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      retryReads: true,
      retryWrites: true
    });

    // Log successful connection details
    console.log('MongoDB Connection Details:');
    console.log('- Host:', conn.connection.host);
    console.log('- Database:', conn.connection.name);
    console.log('- State:', conn.connection.readyState === 1 ? 'connected' : 'disconnected');

    cachedDb = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    if (connectionAttempts < MAX_RETRIES) {
      connectionAttempts++;
      console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds... (Attempt ${connectionAttempts}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB();
    }
    
    console.error('Max retries reached. Could not connect to MongoDB');
    return null;
  }
};

const getConnection = () => {
  return cachedDb;
};

module.exports = {
  connectDB,
  getConnection
};

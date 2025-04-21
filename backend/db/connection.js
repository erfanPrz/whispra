const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Log environment variables (without exposing sensitive data)
console.log('MongoDB Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

let cachedDb = null;
let connectionAttempts = 0;
const MAX_RETRIES = 5; // Increased from 3 to 5
const RETRY_DELAY = 3000; // Reduced from 5s to 3s

// Configure mongoose options
mongoose.set('strictQuery', true);

const connectDB = async () => {
  if (cachedDb && cachedDb.connection.readyState === 1) {
    console.log('Using existing database connection');
    return cachedDb;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Validate MongoDB URI format
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format. URI should start with mongodb:// or mongodb+srv://');
    }

    // Log connection attempt details
    console.log(`Attempting to connect to MongoDB... (Attempt ${connectionAttempts + 1}/${MAX_RETRIES})`);
    console.log('Connection string format:', process.env.MONGODB_URI.startsWith('mongodb+srv://') ? 'MongoDB Atlas' : 'MongoDB Local');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Increased from 10s to 15s
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      retryReads: true,
      retryWrites: true,
      connectTimeoutMS: 15000, // Added explicit connect timeout
      heartbeatFrequencyMS: 10000, // Added heartbeat
      maxIdleTimeMS: 30000 // Added max idle time
    });

    // Log successful connection details
    console.log('MongoDB Connection Details:');
    console.log('- Host:', conn.connection.host);
    console.log('- Database:', conn.connection.name);
    console.log('- State:', conn.connection.readyState === 1 ? 'connected' : 'disconnected');
    console.log('- Pool Size:', conn.connection.poolSize);

    cachedDb = conn;
    connectionAttempts = 0; // Reset attempts on successful connection
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
  if (!cachedDb || cachedDb.connection.readyState !== 1) {
    console.log('No active database connection');
    return null;
  }
  return cachedDb;
};

// Add connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  cachedDb = null;
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing mongoose connection:', err);
    process.exit(1);
  }
});

module.exports = {
  connectDB,
  getConnection
};

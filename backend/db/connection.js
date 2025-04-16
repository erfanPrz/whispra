const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let cachedDb = null;

l const connectDB = async () => {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Using database:', process.env.MONGODB_URI.split('/').pop().split('?')[0]);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);

    cachedDb = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Error details:', error);
    throw error;
  }
};

module.exports = connectDB;

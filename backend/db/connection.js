const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Using database:', process.env.MONGODB_URI.split('/').pop().split('?')[0]);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 
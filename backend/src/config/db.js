const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pathnexis');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In development, continue without DB for demo purposes
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Running in demo mode without database');
      return null;
    }
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

let dbConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || '';
  if (!uri || uri.includes('<username>') || uri.includes('xxxxx')) {
    console.warn('⚠️  MONGODB_URI not set — running in no-DB mode (in-memory OTP store).');
    return;
  }
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    dbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Continuing without MongoDB — in-memory OTP store will be used.');
  }
};

const isDbConnected = () => dbConnected;

module.exports = { connectDB, isDbConnected };

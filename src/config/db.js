const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries} failed:`, err.message);
      if (retries === maxRetries) {
        console.error('💥 Could not connect to MongoDB after max retries. Exiting...');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 5000)); // 5s backoff
    }
  }
};

// Only auto-reconnect in production (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting reconnect...');
    connectDB();
  });
}

module.exports = connectDB;
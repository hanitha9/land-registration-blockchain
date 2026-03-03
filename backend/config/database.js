const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Keep it simple - if no URI is provided, use the default local Docker port without auth
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/landregistry';
    
    console.log(`Connecting to MongoDB...`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Removed auth properties that were causing the crash
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
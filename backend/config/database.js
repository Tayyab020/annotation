const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI ||'mongodb+srv://tayyabhussain070:crazy302%40@cluster0.bpwrdg9.mongodb.net/nova')
      // "mongodb://localhost:27017/virtual_tour" ||
      // 'mongodb+srv://tayyabhussain070:crazy302%40@cluster0.bpwrdg9.mongodb.net/nova_app' );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
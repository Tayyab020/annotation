module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI ||'mongodb+srv://tayyabhussain070:crazy302%40@cluster0.bpwrdg9.mongodb.net/nova',
  //  "mongodb://localhost:27017/virtual_tour",
  JWT_SECRET: process.env.JWT_SECRET || 'tyb',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyBKzvIMKSfeqZEUCbwZmcNgpQDkn0ac7Zc',
};
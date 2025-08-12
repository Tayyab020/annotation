module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/virtual_tour",
  JWT_SECRET: process.env.JWT_SECRET || 'tyb',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyCj3sWo5FObS7XUvLmmDF9zBbo88BAQdHo',
  DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
};

//  'mongodb+srv://tayyabhussain070:crazy302%40@cluster0.bpwrdg9.mongodb.net/nova_app'
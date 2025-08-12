const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxxvqqcbd',
  api_key: process.env.CLOUDINARY_API_KEY || '664511295759937',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'T5rx4GbXAYylXSip623SnXUYUcQ',
});

module.exports = cloudinary;

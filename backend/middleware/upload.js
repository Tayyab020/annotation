const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';

// Create storage configuration function to avoid initialization issues
const createStorage = () => {
  if (isServerless) {
    // Use memory storage for serverless environments
    return multer.memoryStorage();
  } else {
    // Ensure uploads directory exists only in local development
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Use disk storage for local development
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/");
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });
  }
};

// File filter for videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mkv|mov|wmv|flv|webm|m4v/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Only video files are allowed (mp4, avi, mkv, mov, wmv, flv, webm, m4v)"
      )
    );
  }
};

// Create multer instance lazily
const createUpload = () => {
  return multer({
    storage: createStorage(),
    limits: {
      fileSize: isServerless ? 10 * 1024 * 1024 : 500 * 1024 * 1024, // 10MB for serverless, 500MB for local
    },
    fileFilter: fileFilter,
  });
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${isServerless ? '10MB' : '500MB'}`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Only one video file allowed",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "video" for video uploads',
      });
    }
  }

  if (err.message.includes("Only video files are allowed")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

module.exports = {
  createUpload,
  handleMulterError,
};

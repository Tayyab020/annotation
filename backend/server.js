const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");
const { errorHandler } = require("./middleware");
const {
  authRoutes,
  userRoutes,
  videoRoutes,
  annotationRoutes,
  aiRoutes,
} = require("./routes/index");
const config = require("./config/config");

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setTimeout(5 * 60 * 1000); // 5 min timeout
  next();
});

// CORS middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["http://localhost:3000", "http://localhost:5173"] // Add your frontend URLs here
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// Logging middleware
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nova API Server is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/annotations", annotationRoutes);
app.use("/api/ai", aiRoutes);

// Serve uploaded files statically (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static("uploads"));
}

// Handle 404 routes
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down server due to uncaught exception");
  process.exit(1);
});

module.exports = app;

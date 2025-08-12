# Nova Backend API

A RESTful API server built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 User Management (Admin & Regular Users)
- 📹 Video Upload & Management (100MB limit, multiple formats)
- 📝 Manual & AI-Powered Annotations
- 🤖 OpenAI Integration for Smart Annotations
- 🛡️ Input Validation & Security
- 📁 File Upload with Multer
- 🗃️ MongoDB Integration with Mongoose
- 🔄 CORS Support
- 📊 Request Logging
- 🎯 RESTful API Design

## Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection
│   └── config.js        # App configuration
├── controllers/
│   ├── authController.js # Authentication logic
│   ├── userController.js # User management
│   └── index.js         # Export all controllers
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── errorHandler.js  # Global error handling
│   ├── validation.js    # Input validation
│   └── index.js         # Export all middleware
├── models/
│   ├── User.js          # User model
│   └── index.js         # Export all models
├── routes/
│   ├── authRoutes.js    # Authentication routes
│   ├── userRoutes.js    # User management routes
│   └── index.js         # Export all routes
├── .gitignore
├── package.json
├── README.md
└── server.js            # App entry point
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment variables (optional - defaults are set):
```bash
# Create .env file in backend/ directory
PORT=5000
MONGODB_URI=mongodb+srv://tayyabhussain070:crazy302%40@cluster0.bpwrdg9.mongodb.net/nova_app
JWT_SECRET=your_jwt_secret_key_here_please_change_in_production
NODE_ENV=development
```

3. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Video Management
- `POST /api/videos/upload` - Upload video file (Protected)
- `GET /api/videos` - Get user's videos (Protected)
- `GET /api/videos/:id` - Get single video (Protected)
- `PUT /api/videos/:id` - Update video metadata (Protected)
- `DELETE /api/videos/:id` - Delete video (Protected)
- `GET /uploads/:filename` - Access uploaded video files

### Annotations
- `POST /api/annotations` - Create annotation (Protected)
- `GET /api/annotations/:videoId` - Get video annotations (Protected)
- `GET /api/annotations/single/:id` - Get single annotation (Protected)
- `PUT /api/annotations/:id` - Update annotation (Protected)
- `DELETE /api/annotations/:id` - Delete annotation (Protected)

### AI Features
- `POST /api/ai/annotate` - Generate AI annotations (Protected)
- `POST /api/ai/save-annotations` - Save AI annotations to DB (Protected)
- `POST /api/ai/suggest` - Get AI suggestions for partial annotations (Protected)

### User Management (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## MongoDB Connection

The app is configured to connect to MongoDB using the provided connection string:
```
mongodb+srv://tayyabhussain070:crazy302%40@cluster0.bpwrdg9.mongodb.net/nova_app
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| MONGODB_URI | mongodb+srv://... | MongoDB connection string |
| JWT_SECRET | default_secret | JWT signing secret |
| NODE_ENV | development | Environment mode |

## Error Handling

The API includes comprehensive error handling:
- Input validation errors
- MongoDB errors (duplicate keys, validation, etc.)
- JWT authentication errors
- Generic server errors

All errors return a consistent JSON format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- CORS configuration
- Request rate limiting ready

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

Server will start on `http://localhost:5000`
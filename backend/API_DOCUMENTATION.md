# Nova Video Annotation API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Routes

### Register User
**POST** `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

### Login User
**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Get Current User
**GET** `/auth/me` (Protected)

### Update Profile
**PUT** `/auth/profile` (Protected)

---

## Video Routes

### Upload Video
**POST** `/videos/upload` (Protected)

**Form Data:**
- `video`: Video file (max 100MB)
- `title`: Video title
- `description`: Video description (optional)

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "id": "video_id",
    "title": "My Video",
    "description": "Video description",
    "filename": "video-1234567890.mp4",
    "originalName": "my_video.mp4",
    "fileSize": 12345678,
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User Videos
**GET** `/videos` (Protected)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Get Single Video
**GET** `/videos/:id` (Protected)

### Update Video
**PUT** `/videos/:id` (Protected)

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

### Delete Video
**DELETE** `/videos/:id` (Protected)

---

## Annotation Routes

### Create Annotation
**POST** `/annotations` (Protected)

```json
{
  "videoId": "video_id",
  "startTime": 10.5,
  "endTime": 15.2,
  "label": "action_name",
  "text": "Detailed description",
  "confidence": 0.95
}
```

### Get Video Annotations
**GET** `/annotations/:videoId` (Protected)

### Get Single Annotation
**GET** `/annotations/single/:id` (Protected)

### Update Annotation
**PUT** `/annotations/:id` (Protected)

### Delete Annotation
**DELETE** `/annotations/:id` (Protected)

---

## AI Routes

### Generate AI Annotations
**POST** `/ai/annotate` (Protected)

```json
{
  "videoId": "video_id",
  "taskDescription": "Analyze behavioral patterns in this meeting recording",
  "initialAnnotations": [
    {
      "startTime": 5.0,
      "endTime": 10.0,
      "label": "greeting",
      "text": "Participants saying hello"
    }
  ],
  "frameAnalysis": {
    "frames": ["frame_data"],
    "objects_detected": ["person", "table", "laptop"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI annotations generated successfully",
  "data": {
    "annotations": [
      {
        "startTime": 15.0,
        "endTime": 25.0,
        "label": "discussion",
        "text": "Group discussion about project requirements",
        "confidence": 0.85
      }
    ],
    "videoId": "video_id",
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "model": "gpt-4"
  }
}
```

### Save AI Annotations
**POST** `/ai/save-annotations` (Protected)

```json
{
  "videoId": "video_id",
  "annotations": [
    {
      "startTime": 15.0,
      "endTime": 25.0,
      "label": "discussion",
      "text": "AI-generated annotation",
      "confidence": 0.85
    }
  ]
}
```

### Get AI Suggestions
**POST** `/ai/suggest` (Protected)

```json
{
  "videoId": "video_id",
  "partialAnnotation": {
    "startTime": 30.0,
    "label": "meeting"
  },
  "context": "Corporate meeting analysis"
}
```

---

## User Management (Admin Only)

### Get All Users
**GET** `/users` (Protected - Admin)

### Get Single User
**GET** `/users/:id` (Protected - Admin)

### Create User
**POST** `/users` (Protected - Admin)

### Update User
**PUT** `/users/:id` (Protected - Admin)

### Delete User
**DELETE** `/users/:id` (Protected - Admin)

---

## File Access

### Access Uploaded Videos
**GET** `/uploads/:filename`

Example: `http://localhost:5000/uploads/video-1234567890.mp4`

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://tayyabhussain070:crazy302%40@cluster0.bpwrdg9.mongodb.net/nova_app
JWT_SECRET=your_jwt_secret_key_here_please_change_in_production
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Testing with cURL

### Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Upload a video:
```bash
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/your/video.mp4" \
  -F "title=My Test Video" \
  -F "description=This is a test video"
```

### Create an annotation:
```bash
curl -X POST http://localhost:5000/api/annotations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "videoId": "VIDEO_ID",
    "startTime": 10.5,
    "endTime": 15.2,
    "label": "test_action",
    "text": "This is a test annotation"
  }'
```
# 🚀 Cloudinary Setup Guide for VidAnnotate

## Why Cloudinary?

**Cloudinary** is the perfect choice for your video annotation app because:

✅ **Video Optimization**: Automatic compression and format conversion  
✅ **Global CDN**: Fast video delivery worldwide  
✅ **Free Tier**: 25GB storage + 25GB bandwidth/month  
✅ **Video Processing**: Built-in analysis capabilities  
✅ **Easy Integration**: Simple API for uploads  
✅ **Scalability**: Handles large video files efficiently  

## 🔧 Setup Steps

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up For Free"
3. Complete registration
4. Verify your email

### 2. Get API Credentials

1. Login to Cloudinary Dashboard
2. Go to **Dashboard** → **API Environment Variables**
3. Copy these values:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

### 3. Update Environment Variables

Add to your `backend/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_WEBHOOK_URL=https://your-domain.com/webhook/cloudinary
```

### 4. Install Dependencies

```bash
cd backend
npm install cloudinary
```

### 5. Test Upload

The system will now:
- Upload videos to Cloudinary automatically
- Generate optimized versions (720p, 480p)
- Store cloud URLs in database
- Fallback to local storage if Cloudinary fails

## 📱 Frontend Integration

The frontend automatically detects Cloudinary URLs and uses them for video playback:

```typescript
// Video source is automatically handled
<video>
  <source src={video.cloudinaryUrl || `/uploads/${video.filename}`} />
</video>
```

## 🔄 Migration from Local Storage

Existing videos will continue to work. New uploads will use Cloudinary.

## 💰 Cost Analysis

**Free Tier (25GB/month):**
- Perfect for development and small projects
- Handles ~100 HD videos per month

**Paid Plans:**
- $89/month: 225GB storage + 225GB bandwidth
- $224/month: 1TB storage + 1TB bandwidth

## 🚨 Important Notes

1. **Video Formats**: MP4, MOV, AVI, WebM supported
2. **File Size**: Up to 10GB per video
3. **Processing**: Videos are optimized automatically
4. **Backup**: Local storage remains as fallback
5. **Security**: API keys are environment variables

## 🎯 Benefits for Your App

- **Faster Loading**: Global CDN delivery
- **Better Quality**: Automatic optimization
- **Scalability**: Handle more users
- **Reliability**: 99.9% uptime guarantee
- **Analytics**: Video performance insights

## 🔍 Troubleshooting

**Common Issues:**
- API key errors → Check environment variables
- Upload failures → Verify cloud name
- Large file errors → Check file size limits

**Support:**
- Cloudinary Documentation: [docs.cloudinary.com](https://docs.cloudinary.com)
- Community Forum: [support.cloudinary.com](https://support.cloudinary.com)

---

**Ready to deploy?** Your app now supports both local and cloud storage with automatic fallback! 🎉

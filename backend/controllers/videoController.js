const Video = require('../models/Video.js');
const cloudinary = require('../config/cloudinary.js');
const fs = require('fs');

// Upload video with Cloudinary support
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    const { title, description } = req.body;
    const userId = req.user.id;

    // Upload to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'vidannotate',
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        chunk_size: 6000000, // 6MB chunks for large videos
        eager: [
          { width: 1280, height: 720, crop: 'scale', quality: 'auto' },
          { width: 854, height: 480, crop: 'scale', quality: 'auto' }
        ],
        eager_async: true
      });

      // Delete local file after Cloudinary upload
      fs.unlinkSync(req.file.path);

      // Create video record with Cloudinary data
      const newVideo = new Video({
        user: userId,
        title: title || req.file.originalname,
        description: description || `Uploaded video: ${req.file.originalname}`,
        filename: cloudinaryResult.public_id,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        duration: cloudinaryResult.duration,
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newVideo.save();

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully to Cloudinary',
        data: newVideo
      });

    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      
      // Fallback to local storage
      const newVideo = new Video({
        user: userId,
        title: title || req.file.originalname,
        description: description || `Uploaded video: ${req.file.originalname}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newVideo.save();

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully (local storage fallback)',
        data: newVideo
      });
    }

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
};

// Get all videos for a user
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      videos,
      total: videos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: error.message
    });
  }
};

// Get a single video
const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    if (video.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video'
      });
    }
    
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video',
      error: error.message
    });
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    if (video.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }
    
    video.title = title || video.title;
    video.description = description || video.description;
    video.updatedAt = new Date();
    
    await video.save();
    
    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update video',
      error: error.message
    });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    if (video.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }
    
    // Delete from Cloudinary if exists
    if (video.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' });
        console.log('Video deleted from Cloudinary:', video.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
      }
    }
    
    // Delete local file if exists (fallback storage)
    if (video.filename && !video.cloudinaryPublicId) {
      try {
        fs.unlinkSync(`./uploads/${video.filename}`);
        console.log('Local video file deleted:', video.filename);
      } catch (fsError) {
        console.error('Failed to delete local file:', fsError);
      }
    }
    
    await Video.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message
    });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideo,
  updateVideo,
  deleteVideo
};
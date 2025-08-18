const express = require('express');
const { videoController } = require('../controllers');
const { protect, createUpload, handleMulterError } = require('../middleware');

const router = express.Router();

// All video routes require authentication
router.use(protect);

// Video upload route
router.post('/upload', createUpload().single('video'), handleMulterError, videoController.uploadVideo);

// CRUD routes for videos
router
  .route('/')
  .get(videoController.getVideos);

router
  .route('/:id')
  .get(videoController.getVideo)
  .put(videoController.updateVideo)
  .delete(videoController.deleteVideo);

module.exports = router;
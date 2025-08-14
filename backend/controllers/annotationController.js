const { Annotation, Video } = require('../models');

// @desc    Create annotation
// @route   POST /api/annotations
// @access  Private
const createAnnotation = async (req, res, next) => {
  try {
    const { videoId, startTime, endTime, label, text, type, confidence } = req.body;

    // Verify video belongs to user
    const video = await Video.findOne({
      _id: videoId,
      user: req.user.id
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const annotation = await Annotation.create({
      user: req.user.id,
      video: videoId,
      startTime,
      endTime,
      label,
      text,
      type: type || 'manual',
      confidence: confidence || 1
    });

    await annotation.populate('video', 'title');

    res.status(201).json({
      success: true,
      message: 'Annotation created successfully',
      data: annotation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get annotations for a video
// @route   GET /api/annotations/:videoId
// @access  Private
const getAnnotations = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    // Verify video belongs to user
    const video = await Video.findOne({
      _id: videoId,
      user: req.user.id
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const annotations = await Annotation.find({ video: videoId })
      .sort({ startTime: 1 })
      .populate('user', 'name')
      .populate('video', 'title');

    res.status(200).json({
      success: true,
      count: annotations.length,
      data: annotations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single annotation
// @route   GET /api/annotations/single/:id
// @access  Private
const getAnnotation = async (req, res, next) => {
  try {
    const annotation = await Annotation.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('video', 'title').populate('user', 'name');

    if (!annotation) {
      return res.status(404).json({
        success: false,
        message: 'Annotation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: annotation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update annotation
// @route   PUT /api/annotations/:id
// @access  Private
const updateAnnotation = async (req, res, next) => {
  try {
    const { startTime, endTime, label, text, confidence } = req.body;

    const annotation = await Annotation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { startTime, endTime, label, text, confidence },
      { new: true, runValidators: true }
    ).populate('video', 'title');

    if (!annotation) {
      return res.status(404).json({
        success: false,
        message: 'Annotation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Annotation updated successfully',
      data: annotation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete annotation
// @route   DELETE /api/annotations/:id
// @access  Private
const deleteAnnotation = async (req, res, next) => {
  try {
    const annotation = await Annotation.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!annotation) {
      return res.status(404).json({
        success: false,
        message: 'Annotation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Annotation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all annotations for a user
// @route   GET /api/annotations/all
// @access  Private
const getAllAnnotations = async (req, res, next) => {
  try {
    const annotations = await Annotation.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('video', 'title filename cloudinaryUrl')
      .populate('user', 'name');

    res.status(200).json({
      success: true,
      count: annotations.length,
      data: annotations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnotation,
  getAnnotations,
  getAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAllAnnotations
};
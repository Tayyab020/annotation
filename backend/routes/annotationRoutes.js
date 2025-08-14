const express = require('express');
const { annotationController } = require('../controllers');
const { protect, checkValidation } = require('../middleware');
const { body } = require('express-validator');

const router = express.Router();

// All annotation routes require authentication
router.use(protect);

// Validation for creating/updating annotations
const validateAnnotation = [
  body('videoId')
    .notEmpty()
    .withMessage('Video ID is required')
    .isMongoId()
    .withMessage('Invalid video ID format'),
  
  body('startTime')
    .isNumeric()
    .withMessage('Start time must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Start time cannot be negative');
      }
      return true;
    }),
  
  body('endTime')
    .isNumeric()
    .withMessage('End time must be a number')
    .custom((value, { req }) => {
      if (value < 0) {
        throw new Error('End time cannot be negative');
      }
      if (value <= req.body.startTime) {
        throw new Error('End time must be greater than start time');
      }
      return true;
    }),
  
  body('label')
    .notEmpty()
    .withMessage('Label is required')
    .isLength({ max: 50 })
    .withMessage('Label cannot be more than 50 characters'),
  
  body('text')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Text cannot be more than 1000 characters'),
  
  body('confidence')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be between 0 and 1'),
  
  checkValidation
];

// Create annotation
router.post('/', validateAnnotation, annotationController.createAnnotation);

// Get all annotations for user
router.get('/all', annotationController.getAllAnnotations);

// Get annotations for a specific video
router.get('/:videoId', annotationController.getAnnotations);

// Get single annotation
router.get('/single/:id', annotationController.getAnnotation);

// Update annotation
router.put('/:id', validateAnnotation, annotationController.updateAnnotation);

// Delete annotation
router.delete('/:id', annotationController.deleteAnnotation);

module.exports = router;
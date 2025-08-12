const express = require('express');
const { aiController } = require('../controllers');
const { protect, checkValidation } = require('../middleware');
const { body } = require('express-validator');

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Validation for AI annotation requests
const validateAIAnnotationRequest = [
  body('videoId')
    .notEmpty()
    .withMessage('Video ID is required')
    .isMongoId()
    .withMessage('Invalid video ID format'),
  
  body('taskDescription')
    .notEmpty()
    .withMessage('Task description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Task description must be between 10 and 1000 characters'),
  
  body('initialAnnotations')
    .optional()
    .isArray()
    .withMessage('Initial annotations must be an array'),
  
  checkValidation
];

// Validation for saving AI annotations
const validateSaveAnnotations = [
  body('videoId')
    .notEmpty()
    .withMessage('Video ID is required')
    .isMongoId()
    .withMessage('Invalid video ID format'),
  
  body('annotations')
    .isArray({ min: 1 })
    .withMessage('Annotations array is required and must contain at least one annotation'),
  
  body('annotations.*.startTime')
    .isNumeric()
    .withMessage('Start time must be a number'),
  
  body('annotations.*.endTime')
    .isNumeric()
    .withMessage('End time must be a number'),
  
  body('annotations.*.label')
    .notEmpty()
    .withMessage('Label is required'),
  
  checkValidation
];

// Generate AI annotations
router.post('/annotate', validateAIAnnotationRequest, aiController.annotateWithAI);

// Test AI service
router.get('/test', aiController.testAIService);

// Save AI-generated annotations to database
router.post('/save-annotations', validateSaveAnnotations, aiController.saveAIAnnotations);

// Get AI suggestions for partial annotations
router.post('/suggest', [
  body('videoId')
    .notEmpty()
    .withMessage('Video ID is required')
    .isMongoId()
    .withMessage('Invalid video ID format'),
  
  body('partialAnnotation')
    .notEmpty()
    .withMessage('Partial annotation is required'),
  
  checkValidation
], aiController.getAISuggestions);

module.exports = router;
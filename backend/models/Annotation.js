const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  startTime: {
    type: Number,
    required: [true, 'Start time is required'],
    min: [0, 'Start time cannot be negative']
  },
  endTime: {
    type: Number,
    required: [true, 'End time is required'],
    min: [0, 'End time cannot be negative']
  },
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true,
    maxlength: [50, 'Label cannot be more than 50 characters']
  },
  text: {
    type: String,
    trim: true,
    maxlength: [1000, 'Text cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['manual', 'ai-generated'],
    default: 'manual'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1
  }
}, {
  timestamps: true
});

// Validation to ensure endTime is greater than startTime
annotationSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be greater than start time'));
  }
  next();
});

module.exports = mongoose.model('Annotation', annotationSchema);
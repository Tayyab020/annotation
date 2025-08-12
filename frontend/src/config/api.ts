// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
  },
  
  // Videos
  VIDEOS: {
    BASE: '/videos',
    UPLOAD: '/videos/upload',
    BY_ID: (id: string) => `/videos/${id}`,
  },
  
  // Annotations
  ANNOTATIONS: {
    BASE: '/annotations',
    BY_VIDEO: (videoId: string) => `/annotations/${videoId}`,
    BY_ID: (id: string) => `/annotations/single/${id}`,
    UPDATE: (id: string) => `/annotations/${id}`,
    DELETE: (id: string) => `/annotations/${id}`,
  },
  
  // AI Features
  AI: {
    ANNOTATE: '/ai/annotate',
    SAVE_ANNOTATIONS: '/ai/save-annotations',
    SUGGEST: '/ai/suggest',
  },
  
  // Users (Admin)
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ACCEPTED_VIDEO_TYPES: [
    'video/mp4',
    'video/avi',
    'video/mkv',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/m4v',
  ],
  ACCEPTED_VIDEO_EXTENSIONS: [
    '.mp4',
    '.avi',
    '.mkv',
    '.mov',
    '.wmv',
    '.flv',
    '.webm',
    '.m4v',
  ],
} as const;

// Request timeout configuration
export const REQUEST_CONFIG = {
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  UPLOAD_TIMEOUT: 300000, // 5 minutes
  AI_TIMEOUT: 30000, // 30 seconds
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'nova_auth_token',
  USER_DATA: 'nova_user_data',
  SETTINGS: 'nova_settings',
  RECENT_VIDEOS: 'nova_recent_videos',
} as const;

// App configuration
export const APP_CONFIG = {
  NAME: 'Nova',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered Video Annotation Platform',
  SUPPORT_EMAIL: 'support@nova.app',
  
  // Feature flags
  FEATURES: {
    AI_ANNOTATIONS: true,
    BULK_UPLOAD: true,
    EXPORT_ANNOTATIONS: true,
    REAL_TIME_COLLABORATION: false, // Future feature
    VIDEO_STREAMING: false, // Future feature
  },
  
  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: 256,
    HEADER_HEIGHT: 64,
    PAGINATION_LIMIT: 12,
    TIMELINE_HEIGHT: 48,
    ANNOTATION_MIN_DURATION: 0.5, // seconds
    ANNOTATION_MAX_DURATION: 300, // 5 minutes
  },
  
  // Video player configuration
  VIDEO_PLAYER: {
    DEFAULT_VOLUME: 0.5,
    SEEK_STEP: 10, // seconds
    PLAYBACK_RATES: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2],
    KEYBOARD_SHORTCUTS: {
      PLAY_PAUSE: 'Space',
      SEEK_FORWARD: 'ArrowRight',
      SEEK_BACKWARD: 'ArrowLeft',
      VOLUME_UP: 'ArrowUp',
      VOLUME_DOWN: 'ArrowDown',
      MUTE: 'M',
      FULLSCREEN: 'F',
    },
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FILE_TOO_LARGE: `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: 'Please select a valid video file.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  LOGIN_REQUIRED: 'Please log in to continue.',
  UPLOAD_FAILED: 'Video upload failed. Please try again.',
  AI_SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Account created successfully!',
  UPLOAD_SUCCESS: 'Video uploaded successfully!',
  ANNOTATION_CREATED: 'Annotation created successfully!',
  ANNOTATION_UPDATED: 'Annotation updated successfully!',
  ANNOTATION_DELETED: 'Annotation deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  AI_ANNOTATIONS_GENERATED: 'AI annotations generated successfully!',
} as const;
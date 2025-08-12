// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Video Types
export interface Video {
  _id: string;
  user: string | User;
  title: string;
  description?: string;
  filename: string;
  originalName: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  // Cloudinary fields
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoUpload {
  title: string;
  description?: string;
  file: File;
}

// Annotation Types
export interface Annotation {
  _id: string;
  user: string | User;
  video: string | Video;
  startTime: number;
  endTime: number;
  label: string;
  text: string;
  type: 'manual' | 'ai-generated';
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnotation {
  videoId: string;
  startTime: number;
  endTime: number;
  label: string;
  text: string;
  confidence?: number;
}

// AI Types
export interface AIAnnotationRequest {
  videoId: string;
  taskDescription: string;
  initialAnnotations?: Partial<Annotation>[];
  frameAnalysis?: {
    frames: string[];
    objects_detected: string[];
    scene_description?: string;
  };
}

export interface AIAnnotationResponse {
  annotations: Partial<Annotation>[];
  videoId: string;
  generatedAt: string;
  model: string;
  warning?: string;
}

export interface AISuggestionRequest {
  videoId: string;
  partialAnnotation: {
    startTime?: number;
    endTime?: number;
    label?: string;
    text?: string;
  };
  context: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Video Player Types
export interface VideoPlayerRef {
  currentTime: number;
  duration: number;
  playing: boolean;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
}

export interface TimelinePosition {
  x: number;
  time: number;
  percentage: number;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Settings Types
export interface AppSettings {
  autoSave: boolean;
  aiSuggestions: boolean;
  darkMode: boolean;
  videoQuality: 'auto' | 'high' | 'medium' | 'low';
  annotationDefaults: {
    confidence: number;
    type: 'manual' | 'ai-generated';
  };
}
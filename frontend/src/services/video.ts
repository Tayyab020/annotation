import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Video, VideoUpload, ApiResponse } from '../types';

class VideoService {
  // Upload video
  async uploadVideo(
    videoData: VideoUpload,
    onProgress?: (progress: number) => void
  ): Promise<Video> {
    const formData = new FormData();
    formData.append('video', videoData.file);
    formData.append('title', videoData.title);
    if (videoData.description) {
      formData.append('description', videoData.description);
    }

    const response = await apiService.uploadFile<Video>(
      API_ENDPOINTS.VIDEOS.UPLOAD,
      formData,
      onProgress
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Video upload failed');
  }

  // Get user's videos
  async getVideos(page = 1, limit = 12): Promise<{
    videos: Video[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const response = await apiService.get<{
      videos: Video[];
      total: number;
    }>(`${API_ENDPOINTS.VIDEOS.BASE}?page=${page}&limit=${limit}`);

    if (response.success && response.videos) {
      const totalPages = Math.ceil(response.total / limit);
      return {
        videos: response.videos,
        total: response.total,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }

    throw new Error(response.message || 'Failed to fetch videos');
  }

  // Get single video
  async getVideo(videoId: string): Promise<Video> {
    const response = await apiService.get<Video>(
      API_ENDPOINTS.VIDEOS.BY_ID(videoId)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch video');
  }

  // Update video metadata
  async updateVideo(
    videoId: string,
    updateData: Pick<Video, 'title' | 'description'>
  ): Promise<Video> {
    const response = await apiService.put<Video>(
      API_ENDPOINTS.VIDEOS.BY_ID(videoId),
      updateData
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update video');
  }

  // Delete video
  async deleteVideo(videoId: string): Promise<void> {
    const response = await apiService.delete(
      API_ENDPOINTS.VIDEOS.BY_ID(videoId)
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete video');
    }
  }

  // Get video URL for playback
  getVideoUrl(filename: string): string {
    return `${API_ENDPOINTS.VIDEOS.BASE.replace('/api', '')}/uploads/${filename}`;
  }

  // Validate video file
  validateVideoFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mkv',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/m4v',
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 100MB',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a valid video file (MP4, AVI, MKV, MOV, WMV, FLV, WebM, M4V)',
      };
    }

    return { isValid: true };
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Format video duration
  formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Convert time to seconds
  timeToSeconds(timeString: string): number {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }

  // Get recent videos from localStorage
  getRecentVideos(): Video[] {
    try {
      const recent = localStorage.getItem('nova_recent_videos');
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  }

  // Add video to recent list
  addToRecent(video: Video): void {
    try {
      const recent = this.getRecentVideos();
      const filtered = recent.filter(v => v._id !== video._id);
      const updated = [video, ...filtered].slice(0, 10); // Keep last 10
      localStorage.setItem('nova_recent_videos', JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  }
}

// Create singleton instance
export const videoService = new VideoService();
export default videoService;
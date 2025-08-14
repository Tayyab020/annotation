import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Annotation, CreateAnnotation, ApiResponse } from '../types';

class AnnotationService {
  // Create annotation
  async createAnnotation(annotationData: CreateAnnotation): Promise<Annotation> {
    const response = await apiService.post<Annotation>(
      API_ENDPOINTS.ANNOTATIONS.BASE,
      annotationData
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to create annotation');
  }

  // Get annotations for a video
  async getVideoAnnotations(videoId: string): Promise<Annotation[]> {
    const response = await apiService.get<Annotation[]>(
      API_ENDPOINTS.ANNOTATIONS.BY_VIDEO(videoId)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch annotations');
  }

  // Get all annotations for user
  async getAllAnnotations(): Promise<Annotation[]> {
    const response = await apiService.get<Annotation[]>(
      API_ENDPOINTS.ANNOTATIONS.ALL
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch annotations');
  }

  // Get single annotation
  async getAnnotation(annotationId: string): Promise<Annotation> {
    const response = await apiService.get<Annotation>(
      API_ENDPOINTS.ANNOTATIONS.BY_ID(annotationId)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch annotation');
  }

  // Update annotation
  async updateAnnotation(
    annotationId: string,
    updateData: Partial<CreateAnnotation>
  ): Promise<Annotation> {
    const response = await apiService.put<Annotation>(
      API_ENDPOINTS.ANNOTATIONS.UPDATE(annotationId),
      updateData
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update annotation');
  }

  // Delete annotation
  async deleteAnnotation(annotationId: string): Promise<void> {
    const response = await apiService.delete(
      API_ENDPOINTS.ANNOTATIONS.DELETE(annotationId)
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete annotation');
    }
  }

  // Validate annotation data
  validateAnnotation(data: CreateAnnotation): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.videoId) {
      errors.push('Video ID is required');
    }

    if (data.startTime < 0) {
      errors.push('Start time cannot be negative');
    }

    if (data.endTime <= data.startTime) {
      errors.push('End time must be greater than start time');
    }

    if (!data.label || data.label.trim().length === 0) {
      errors.push('Label is required');
    }

    if (data.label && data.label.length > 50) {
      errors.push('Label cannot be more than 50 characters');
    }

    if (data.text && data.text.length > 1000) {
      errors.push('Text cannot be more than 1000 characters');
    }

    if (data.confidence !== undefined && (data.confidence < 0 || data.confidence > 1)) {
      errors.push('Confidence must be between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Sort annotations by start time
  sortAnnotations(annotations: Annotation[]): Annotation[] {
    return [...annotations].sort((a, b) => a.startTime - b.startTime);
  }

  // Find overlapping annotations
  findOverlappingAnnotations(
    annotations: Annotation[],
    startTime: number,
    endTime: number,
    excludeId?: string
  ): Annotation[] {
    return annotations.filter(annotation => {
      if (excludeId && annotation._id === excludeId) {
        return false;
      }

      return (
        (startTime < annotation.endTime && endTime > annotation.startTime)
      );
    });
  }

  // Get annotation duration
  getAnnotationDuration(annotation: Annotation): number {
    return annotation.endTime - annotation.startTime;
  }

  // Format annotation time range
  formatTimeRange(annotation: Annotation): string {
    const formatTime = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return `${formatTime(annotation.startTime)} - ${formatTime(annotation.endTime)}`;
  }

  // Get annotation color based on type and confidence
  getAnnotationColor(annotation: Annotation): string {
    if (annotation.type === 'ai-generated') {
      // Color based on confidence for AI annotations
      if (annotation.confidence >= 0.8) {
        return 'bg-green-500'; // High confidence
      } else if (annotation.confidence >= 0.6) {
        return 'bg-yellow-500'; // Medium confidence
      } else {
        return 'bg-orange-500'; // Low confidence
      }
    } else {
      return 'bg-blue-500'; // Manual annotations
    }
  }

  // Export annotations to JSON
  exportAnnotations(annotations: Annotation[]): string {
    const exportData = {
      exported_at: new Date().toISOString(),
      total_annotations: annotations.length,
      annotations: annotations.map(annotation => ({
        id: annotation._id,
        startTime: annotation.startTime,
        endTime: annotation.endTime,
        duration: this.getAnnotationDuration(annotation),
        label: annotation.label,
        text: annotation.text,
        type: annotation.type,
        confidence: annotation.confidence,
        timeRange: this.formatTimeRange(annotation),
        createdAt: annotation.createdAt,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import annotations from JSON
  parseImportedAnnotations(jsonString: string, videoId: string): CreateAnnotation[] {
    try {
      const data = JSON.parse(jsonString);
      
      if (!Array.isArray(data.annotations)) {
        throw new Error('Invalid format: annotations array not found');
      }

      return data.annotations.map((item: any) => ({
        videoId,
        startTime: Number(item.startTime),
        endTime: Number(item.endTime),
        label: String(item.label),
        text: String(item.text || ''),
        confidence: item.confidence ? Number(item.confidence) : 1,
      }));
    } catch (error) {
      throw new Error('Failed to parse annotation file: ' + (error as Error).message);
    }
  }

  // Get annotation statistics
  getAnnotationStats(annotations: Annotation[]): {
    total: number;
    manual: number;
    aiGenerated: number;
    totalDuration: number;
    averageDuration: number;
    labels: Record<string, number>;
  } {
    const stats = {
      total: annotations.length,
      manual: 0,
      aiGenerated: 0,
      totalDuration: 0,
      averageDuration: 0,
      labels: {} as Record<string, number>,
    };

    annotations.forEach(annotation => {
      if (annotation.type === 'manual') {
        stats.manual++;
      } else {
        stats.aiGenerated++;
      }

      const duration = this.getAnnotationDuration(annotation);
      stats.totalDuration += duration;

      // Count labels
      const label = annotation.label.toLowerCase();
      stats.labels[label] = (stats.labels[label] || 0) + 1;
    });

    stats.averageDuration = stats.total > 0 ? stats.totalDuration / stats.total : 0;

    return stats;
  }
}

// Create singleton instance
export const annotationService = new AnnotationService();
export default annotationService;
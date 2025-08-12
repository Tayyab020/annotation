import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';
import type { 
  AIAnnotationRequest, 
  AIAnnotationResponse, 
  AISuggestionRequest, 
  Annotation, 
  CreateAnnotation 
} from '../types';

class AIService {
  // Generate AI annotations
  async generateAnnotations(request: AIAnnotationRequest): Promise<AIAnnotationResponse> {
    const response = await apiService.aiRequest<AIAnnotationResponse>(
      API_ENDPOINTS.AI.ANNOTATE,
      request
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to generate AI annotations');
  }

  // Save AI-generated annotations to database
  async saveAIAnnotations(videoId: string, annotations: Partial<Annotation>[]): Promise<Annotation[]> {
    const response = await apiService.post<Annotation[]>(
      API_ENDPOINTS.AI.SAVE_ANNOTATIONS,
      {
        videoId,
        annotations,
      }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to save AI annotations');
  }

  // Get AI suggestions for partial annotation
  async getSuggestions(request: AISuggestionRequest): Promise<any[]> {
    const response = await apiService.aiRequest<any[]>(
      API_ENDPOINTS.AI.SUGGEST,
      request
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get AI suggestions');
  }

  // Prepare annotation data for AI analysis
  prepareAnnotationData(annotations: Annotation[]): Partial<Annotation>[] {
    return annotations.map(annotation => ({
      startTime: annotation.startTime,
      endTime: annotation.endTime,
      label: annotation.label,
      text: annotation.text,
      confidence: annotation.confidence,
    }));
  }

  // Generate task description templates
  getTaskDescriptionTemplates(): Record<string, string> {
    return {
      meeting: 'Analyze behavioral patterns in this meeting recording. Focus on identifying greetings, discussions, decision-making moments, and conclusions. Look for non-verbal communication and engagement levels.',
      
      interview: 'Analyze this interview recording. Identify question-answer segments, emotional responses, body language cues, and key discussion topics. Note confidence levels and communication patterns.',
      
      presentation: 'Analyze this presentation recording. Identify different presentation segments, audience engagement moments, Q&A sessions, and speaker confidence levels. Note visual aid usage and interaction patterns.',
      
      training: 'Analyze this training session. Identify instructional segments, practical demonstrations, student-teacher interactions, and comprehension indicators. Note engagement levels and learning milestones.',
      
      conference: 'Analyze this conference session. Identify speaker transitions, key topics, audience reactions, and networking moments. Note presentation styles and audience engagement patterns.',
      
      workshop: 'Analyze this workshop recording. Identify hands-on activities, group discussions, instructor guidance, and participant interactions. Note skill development moments and collaboration patterns.',
      
      webinar: 'Analyze this webinar recording. Identify content delivery segments, interactive elements, Q&A sessions, and participant engagement. Note technical issues and communication effectiveness.',
      
      therapy: 'Analyze this therapy session (with appropriate consent). Identify different therapeutic techniques, emotional expressions, breakthrough moments, and communication patterns while maintaining confidentiality.',
      
      custom: 'Provide a custom description of what you want the AI to analyze in this video...',
    };
  }

  // Generate context suggestions based on video metadata
  generateContextSuggestions(videoTitle: string, videoDescription?: string): string[] {
    const suggestions: string[] = [];
    const title = videoTitle.toLowerCase();
    const description = videoDescription?.toLowerCase() || '';
    const combined = `${title} ${description}`;

    // Meeting-related keywords
    if (combined.includes('meeting') || combined.includes('standup') || combined.includes('scrum')) {
      suggestions.push('Corporate team meeting with agenda discussion and decision-making');
      suggestions.push('Daily standup meeting with progress updates and blockers');
    }

    // Interview-related keywords
    if (combined.includes('interview') || combined.includes('candidate')) {
      suggestions.push('Job interview with behavioral and technical questions');
      suggestions.push('Research interview for data collection and analysis');
    }

    // Training-related keywords
    if (combined.includes('training') || combined.includes('tutorial') || combined.includes('lesson')) {
      suggestions.push('Educational training session with hands-on demonstrations');
      suggestions.push('Professional development workshop with interactive elements');
    }

    // Presentation-related keywords
    if (combined.includes('presentation') || combined.includes('pitch') || combined.includes('demo')) {
      suggestions.push('Business presentation with slides and audience Q&A');
      suggestions.push('Product demonstration with feature explanations');
    }

    // Default suggestions if no specific keywords found
    if (suggestions.length === 0) {
      suggestions.push('Professional video content with multiple speakers');
      suggestions.push('Educational content with instructional elements');
      suggestions.push('Business communication with structured discussion');
    }

    return suggestions;
  }

  // Validate AI request data
  validateAIRequest(request: AIAnnotationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.videoId) {
      errors.push('Video ID is required');
    }

    if (!request.taskDescription || request.taskDescription.trim().length < 10) {
      errors.push('Task description must be at least 10 characters long');
    }

    if (request.taskDescription && request.taskDescription.length > 1000) {
      errors.push('Task description cannot be more than 1000 characters');
    }

    if (request.initialAnnotations) {
      request.initialAnnotations.forEach((annotation, index) => {
        if (annotation.startTime !== undefined && annotation.endTime !== undefined) {
          if (annotation.startTime < 0) {
            errors.push(`Initial annotation ${index + 1}: Start time cannot be negative`);
          }
          if (annotation.endTime <= annotation.startTime) {
            errors.push(`Initial annotation ${index + 1}: End time must be greater than start time`);
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Process AI response and format annotations
  processAIResponse(aiResponse: AIAnnotationResponse, videoId: string): CreateAnnotation[] {
    if (!aiResponse.annotations || !Array.isArray(aiResponse.annotations)) {
      return [];
    }

    return aiResponse.annotations
      .filter(annotation => 
        annotation.startTime !== undefined &&
        annotation.endTime !== undefined &&
        annotation.label &&
        annotation.startTime >= 0 &&
        annotation.endTime > annotation.startTime
      )
      .map(annotation => ({
        videoId,
        startTime: annotation.startTime!,
        endTime: annotation.endTime!,
        label: annotation.label!,
        text: annotation.text || '',
        confidence: Math.min(Math.max(annotation.confidence || 0.5, 0.1), 1.0),
      }));
  }

  // Get confidence level description
  getConfidenceDescription(confidence: number): string {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  }

  // Get confidence color
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    if (confidence >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  }

  // Check if AI features are available
  isAIAvailable(): boolean {
    // This could be enhanced to check API availability
    return true;
  }

  // Get AI usage statistics
  getAIUsageStats(annotations: Annotation[]): {
    totalAI: number;
    averageConfidence: number;
    highConfidenceCount: number;
    lowConfidenceCount: number;
  } {
    const aiAnnotations = annotations.filter(a => a.type === 'ai-generated');
    
    const stats = {
      totalAI: aiAnnotations.length,
      averageConfidence: 0,
      highConfidenceCount: 0,
      lowConfidenceCount: 0,
    };

    if (aiAnnotations.length > 0) {
      const totalConfidence = aiAnnotations.reduce((sum, a) => sum + a.confidence, 0);
      stats.averageConfidence = totalConfidence / aiAnnotations.length;
      stats.highConfidenceCount = aiAnnotations.filter(a => a.confidence >= 0.8).length;
      stats.lowConfidenceCount = aiAnnotations.filter(a => a.confidence < 0.6).length;
    }

    return stats;
  }
}

// Create singleton instance
export const aiService = new AIService();
export default aiService;
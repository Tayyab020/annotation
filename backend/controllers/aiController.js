const { Annotation, Video } = require('../models');
const fs = require('fs');
const path = require('path');
// Gemini (Google Generative AI)
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || config.GEMINI_API_KEY);
const providerName = 'gemini';

// @desc    Generate AI annotations
// @route   POST /api/ai/annotate
// @access  Private
const annotateWithAI = async (req, res) => {
  try {
    const { videoId, taskDescription } = req.body;

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

    console.log('Video found for AI analysis:', {
      videoId: video._id,
      title: video.title,
      filename: video.filename,
      cloudinaryUrl: video.cloudinaryUrl,
      cloudinaryPublicId: video.cloudinaryPublicId,
      mimeType: video.mimeType,
      duration: video.duration,
      user: video.user
    });

    // Get existing annotations for context
    const existingAnnotations = await Annotation.find({ video: videoId })
      .sort({ startTime: 1 });

    console.log('Existing annotations found:', existingAnnotations.length);

    // Construct detailed instruction for video analysis
    const instruction = [
      'You are a video annotation assistant. Analyze the attached video and return ONLY a JSON array of annotation objects.',
      '',
      'Video Information:',
      `- Title: ${video.title}`,
      `- Description: ${video.description || 'No description'}`,
      `- Duration: ${video.duration || 'Unknown'} seconds`,
      '',
      'Task Description:',
      taskDescription || 'Generate comprehensive behavioral annotations for this video',
      '',
      'Existing Manual Annotations (avoid overlapping with these, but focus primarily on video content):',
      JSON.stringify(existingAnnotations.map(a => ({
        startTime: a.startTime,
        endTime: a.endTime,
        label: a.label,
        text: a.text
      })), null, 2),
      '',
      'IMPORTANT: Focus 80% on analyzing the actual video content and 20% on avoiding conflicts with manual annotations.',
      'Your primary goal is to understand what is happening in the video, not just avoid overlaps.',
      '',
      'Rules:',
      '1. Return ONLY valid JSON array, no other text',
      '2. Each annotation must have: startTime, endTime, label, text, confidence',
      '3. Times must be in seconds (0.0 to video duration)',
      '4. NO overlapping time segments - each segment must be exactly 10 seconds',
      '5. Keep text descriptions SHORT and CONCISE (max 15-20 words)',
      '6. Use clear, action-focused labels based on what you actually see in the video',
      '7. Confidence scores: 0.1 (low) to 1.0 (high)',
      '8. Generate annotations at EXACT 10-second intervals: 0-10s, 10-20s, 20-30s, etc.',
      '9. Each annotation must cover exactly 10 seconds (startTime: 0, endTime: 10), (startTime: 10, endTime: 20), etc.',
      '10. Describe what you actually observe in the video - be specific about actions, expressions, movements',
      '11. If video is shorter than 10 seconds, create 1 annotation covering the entire duration',
      '12. If video duration is not divisible by 10, the last annotation can be shorter (e.g., 20-23s for a 23-second video)',
      '13. NEVER use decimal timestamps - use whole numbers for startTime and endTime',
      '14. Focus on behavioral patterns, gestures, expressions, interactions, and visual elements',
      '',
      'Expected JSON format:',
      '[{"startTime": 0, "endTime": 10, "label": "action_name", "text": "Brief description", "confidence": 0.85}]'
    ].join('\n');

    try {
              // For Cloudinary videos, we need to download and process the video
        if (video.cloudinaryUrl) {
          console.log('Processing Cloudinary video with Gemini:', { 
            cloudinaryUrl: video.cloudinaryUrl, 
            title: video.title,
            duration: video.duration 
          });

          // Download video from Cloudinary to process with Gemini
          const https = require('https');
          const { URL } = require('url');
          
          console.log('Downloading video from Cloudinary for AI analysis...');
          
          // Download video as buffer
          const downloadVideo = () => {
            return new Promise((resolve, reject) => {
              const url = new URL(video.cloudinaryUrl);
              https.get(url, (response) => {
                if (response.statusCode !== 200) {
                  reject(new Error(`Failed to download video: ${response.statusCode}`));
                  return;
                }
                
                const chunks = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => {
                  const buffer = Buffer.concat(chunks);
                  resolve(buffer);
                });
                response.on('error', reject);
              }).on('error', reject);
            });
          };

          try {
            const videoBuffer = await downloadVideo();
            const base64Video = videoBuffer.toString('base64');
            
            console.log('Video downloaded successfully, processing with Gemini...');
            
            // Use the actual video data with Gemini
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            console.log('Gemini model initialized, calling generateContent with video data...');
            
            const result = await model.generateContent([
              {
                inlineData: {
                  mimeType: video.mimeType || 'video/mp4',
                  data: base64Video,
                },
              },
              { text: instruction }
            ]);

            console.log('Gemini response received successfully');
            const aiResponse = result.response.text() || '[]';
            console.log('Gemini response:', aiResponse);
            
            // Parse the AI response
            let aiAnnotations;
            try {
              // Clean the response by removing markdown code blocks if present
              let cleanResponse = aiResponse;
              if (cleanResponse.includes('```json')) {
                cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```/, '');
              } else if (cleanResponse.includes('```')) {
                cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/\s*```/, '');
              }
              
              aiAnnotations = JSON.parse(cleanResponse);
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              // Try to extract JSON from response if it's wrapped in text
              const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                aiAnnotations = JSON.parse(jsonMatch[0]);
              } else {
                throw new Error('Invalid JSON response from AI');
              }
            }

            // Validate and clean the annotations
            const validAnnotations = aiAnnotations
              .filter(annotation => 
                annotation.startTime >= 0 && 
                annotation.endTime > annotation.startTime &&
                annotation.label && 
                annotation.text
              )
              .map(annotation => ({
                ...annotation,
                confidence: Math.min(Math.max(annotation.confidence || 0.5, 0.1), 1.0)
              }));

            res.status(200).json({
              success: true,
              message: 'AI annotations generated successfully',
              data: {
                annotations: validAnnotations,
                videoId,
                generatedAt: new Date(),
                model: 'gemini-1.5-flash',
                provider: providerName
              }
            });

          } catch (downloadError) {
            console.error('Failed to download Cloudinary video:', downloadError);
            throw new Error('Failed to download video from Cloudinary for AI analysis');
          }

      } else {
        // Fallback for local videos
        const filePath = path.join(process.cwd(), 'uploads', video.filename);
        const mimeType = video.mimeType || 'video/mp4';

        // Check if local file exists
        if (!fs.existsSync(filePath)) {
          throw new Error('Video file not found locally and no Cloudinary URL available');
        }

        // Get file stats for size information
        const fileStats = fs.statSync(filePath);
        const fileSize = fileStats.size;

        console.log('Processing local video with Gemini:', { filePath, mimeType, filename: video.filename, fileSize });

        // Read file as base64 for inline processing
        const videoBuffer = fs.readFileSync(filePath);
        const base64Video = videoBuffer.toString('base64');

        // Generate content with inline video data
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log('Gemini model initialized, calling generateContent...');
        
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Video,
            },
          },
          { text: instruction }
        ]);

        console.log('Gemini response received successfully');
        const aiResponse = result.response.text() || '[]';
        console.log('Gemini response:', aiResponse);
        
        // Parse the AI response
        let aiAnnotations;
        try {
          // Clean the response by removing markdown code blocks if present
          let cleanResponse = aiResponse;
          if (cleanResponse.includes('```json')) {
            cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```/, '');
          } else if (cleanResponse.includes('```')) {
            cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/\s*```/, '');
          }
          
          aiAnnotations = JSON.parse(cleanResponse);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          // Try to extract JSON from response if it's wrapped in text
          const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            aiAnnotations = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Invalid JSON response from AI');
          }
        }

        // Validate and clean the annotations
        const validAnnotations = aiAnnotations
          .filter(annotation => 
            annotation.startTime >= 0 && 
            annotation.endTime > annotation.startTime &&
            annotation.label && 
            annotation.text
          )
          .map(annotation => ({
            ...annotation,
            confidence: Math.min(Math.max(annotation.confidence || 0.5, 0.1), 1.0)
          }));

        res.status(200).json({
          success: true,
          message: 'AI annotations generated successfully',
          data: {
            annotations: validAnnotations,
            videoId,
            generatedAt: new Date(),
            model: 'gemini-1.5-flash',
            provider: providerName
          }
        });
      }

    } catch (aiError) {
      console.error('AI Provider Error Details:', { 
        provider: providerName, 
        error: aiError,
        errorMessage: aiError?.message,
        errorStatus: aiError?.status,
        errorCode: aiError?.code,
        stack: aiError?.stack
      });
      
      const apiMessage = aiError?.error?.message || aiError?.message || 'AI provider error';
      const isBalance = aiError?.status === 402 || /insufficient/i.test(apiMessage);
      const isAuthError = aiError?.status === 401 || /unauthorized/i.test(apiMessage) || /invalid.*key/i.test(apiMessage);
      
      console.log('Error Analysis:', { apiMessage, isBalance, isAuthError });
      
      // Create realistic sample annotations based on video duration
      const videoDuration = video.duration || 30; // Default to 30 seconds if unknown
      const sampleAnnotations = [];
      
      // Generate 10-second interval annotations with realistic content
      for (let i = 0; i < videoDuration; i += 10) {
        const endTime = Math.min(i + 10, videoDuration);
        const segmentNumber = Math.floor(i/10) + 1;
        
        // Create realistic annotation content based on segment
        let label, text;
        if (segmentNumber === 1) {
          label = 'opening_scene';
          text = 'Video begins with initial content and setup';
        } else if (segmentNumber === 2) {
          label = 'main_content';
          text = 'Primary content and discussion continues';
        } else if (segmentNumber === 3) {
          label = 'development';
          text = 'Content develops with more details and interaction';
        } else if (segmentNumber === 4) {
          label = 'climax';
          text = 'Key moments and important information presented';
        } else {
          label = 'conclusion';
          text = 'Final segment with summary and closing remarks';
        }
        
        sampleAnnotations.push({
          startTime: i,
          endTime: endTime,
          label: label,
          text: text,
          confidence: 0.7
        });
      }
      
      // If no duration, create at least one annotation
      if (sampleAnnotations.length === 0) {
        sampleAnnotations.push({
          startTime: 0,
          endTime: 10,
          label: 'video_content',
          text: 'Video content analysis and annotation',
          confidence: 0.7
        });
      }

      res.status(200).json({
        success: true,
        message: isBalance ? 'AI provider insufficient balance, providing sample annotations' : 
                 isAuthError ? 'AI provider authentication failed, providing sample annotations' :
                 'AI service temporarily unavailable, providing sample annotations',
        data: {
          annotations: sampleAnnotations,
          videoId,
          generatedAt: new Date(),
          model: providerName,
          provider: providerName,
          warning: isBalance ? 'Insufficient balance on AI provider account' : 
                   isAuthError ? 'Authentication failed - check API key' :
                   'AI service temporarily unavailable',
          debug: {
            errorType: isBalance ? 'balance' : isAuthError ? 'auth' : 'service',
            originalError: apiMessage,
            fallbackUsed: true
          }
        }
      });
    }

  } catch (error) {
    console.error('AI annotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI annotations',
      error: error.message
    });
  }
};

// @desc    Get AI suggestions
// @route   POST /api/ai/suggest
// @access  Private
const getAISuggestions = async (req, res) => {
  try {
    const { videoId, partialAnnotation, context } = req.body;

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

    const prompt = `
You are an annotation assistant. Based on the partial annotation provided, suggest completions.

Video: ${video.title}
Partial Annotation: ${JSON.stringify(partialAnnotation)}
Context: ${context}

Provide 3-5 suggestions for completing this annotation. Return as JSON array with fields: label, text, confidence.
`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const suggestions = JSON.parse(result.response.text() || '[]');

      res.status(200).json({
        success: true,
        data: suggestions
      });

    } catch (aiError) {
      const apiMessage = aiError?.error?.message || aiError?.message || 'AI provider error';
      const isBalance = aiError?.status === 402 || /insufficient/i.test(apiMessage);
      // Fallback suggestions
      const fallbackSuggestions = [
        {
          label: 'behavior_observation',
          text: isBalance ? 'Provider balance insufficient' : 'General behavioral observation',
          confidence: 0.3
        }
      ];

      res.status(200).json({
        success: true,
        data: fallbackSuggestions,
        warning: isBalance ? 'Insufficient balance on AI provider account' : 'AI service temporarily unavailable',
        provider: providerName
      });
    }

  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI suggestions',
      error: error.message
    });
  }
};

// @desc    Save AI annotations
// @route   POST /api/ai/save
// @access  Private
const saveAIAnnotations = async (req, res) => {
  try {
    const { videoId, annotations } = req.body;

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

    // Save annotations to database
    const savedAnnotations = [];
    for (const annotation of annotations) {
      const newAnnotation = new Annotation({
        user: req.user.id,
        video: videoId,
        startTime: annotation.startTime,
        endTime: annotation.endTime,
        label: annotation.label,
        text: annotation.text,
        type: 'ai-generated',
        confidence: annotation.confidence || 0.5
        
      });
      
      await newAnnotation.save();
      savedAnnotations.push(newAnnotation);
    }

    res.status(201).json({
      success: true,
      message: 'AI annotations saved successfully',
      data: savedAnnotations
    });

  } catch (error) {
    console.error('Save AI annotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save AI annotations',
      error: error.message
    });
  }
};

// @desc    Test AI service
// @route   GET /api/ai/test
// @access  Private
const testAIService = async (req, res) => {
  try {
    console.log('Testing AI service...');
    console.log('GEMINI_API_KEY available:', !!process.env.GEMINI_API_KEY);
    console.log('Config GEMINI_API_KEY available:', !!config.GEMINI_API_KEY);
    
    const apiKey = process.env.GEMINI_API_KEY || config.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'No Gemini API key found',
        error: 'GEMINI_API_KEY environment variable is not set'
      });
    }

    // Test Gemini connection
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Hello! Please respond with 'AI service is working' and nothing else.");
      const response = result.response.text();
      
      console.log('Gemini test successful:', response);
      
      res.status(200).json({
        success: true,
        message: 'AI service test successful',
        data: {
          response: response,
          model: 'gemini-1.5-flash',
          provider: providerName,
          timestamp: new Date()
        }
      });
    } catch (geminiError) {
      console.error('Gemini test failed:', geminiError);
      res.status(500).json({
        success: false,
        message: 'AI service test failed',
        error: geminiError.message,
        details: {
          provider: providerName,
          model: 'gemini-1.5-flash',
          apiKeyLength: apiKey ? apiKey.length : 0
        }
      });
    }
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test AI service',
      error: error.message
    });
  }
};

module.exports = {
  annotateWithAI,
  getAISuggestions,
  saveAIAnnotations,
  testAIService
};
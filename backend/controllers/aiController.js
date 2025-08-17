const { Annotation, Video } = require("../models");
const fs = require("fs");
const path = require("path");
// Gemini (Google Generative AI)
const {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} = require("@google/genai");

const config = require("../config/config");

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
});

// Provider name for consistency
const providerName = "gemini";

// In-memory storage for AI annotation status
const aiAnnotationStatus = new Map();

// Video compression function using FFmpeg (if available)
const compressVideo = async (inputPath, outputPath, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if FFmpeg is available
      const ffmpeg = require("fluent-ffmpeg");

      const {
        width = 720,
        quality = "auto",
        format = "mp4",
        fps = 24,
        crf = 28,
      } = options;

      console.log(`🎬 Compressing video: ${path.basename(inputPath)}`);
      console.log(`⚙️ Settings: ${width}p, ${format}, ${fps}fps, CRF:${crf}`);
      console.log(`📁 Input: ${inputPath}`);
      console.log(`📁 Output: ${outputPath}`);

      ffmpeg(inputPath)
        .videoCodec("libx264") // Use H.264 codec for video compression
        .outputOptions([
          `-crf ${crf}`, // Set quality: lower CRF = higher quality
          `-preset fast`, // Trade-off between compression speed and efficiency
          `-vf scale=${width}:-2`, // Resize to specified width, maintain aspect ratio
          `-r ${fps}`, // Set frame rate
          `-movflags +faststart`, // Optimize for streaming
        ])
        .format(format)
        .on("progress", (progress) => {
          if (progress.percent) {
            console.log(
              `📊 Compression progress: ${Math.round(progress.percent)}%`
            );
          }
        })
        .on("end", () => {
          const inputStats = fs.statSync(inputPath);
          const outputStats = fs.statSync(outputPath);
          const compressionRatio = (
            ((inputStats.size - outputStats.size) / inputStats.size) *
            100
          ).toFixed(1);

          console.log(`✅ Video compression complete!`);
          console.log(
            `📊 Size reduction: ${compressionRatio}% (${(
              inputStats.size /
              1024 /
              1024
            ).toFixed(1)}MB → ${(outputStats.size / 1024 / 1024).toFixed(1)}MB)`
          );
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error("❌ Compression error:", err.message);
          console.error(
            "❌ FFmpeg stderr:",
            err.stderr || "No stderr available"
          );
          console.error(
            "❌ FFmpeg stdout:",
            err.stdout || "No stdout available"
          );
          reject(err);
        })
        .save(outputPath);
    } catch (ffmpegError) {
      console.log(
        "⚠️  FFmpeg not available - video compression will be disabled"
      );
      console.log("📖 Install FFmpeg: https://ffmpeg.org/download.html");
      console.log("🔍 Error details:", ffmpegError.message);
      reject(new Error("FFmpeg not available"));
    }
  });
};

// Helper function to download video from Cloudinary
const downloadVideoFromCloudinary = async (cloudinaryUrl) => {
  const https = require("https");
  const { URL } = require("url");

  return new Promise((resolve, reject) => {
    const url = new URL(cloudinaryUrl);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download video: ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
        response.on("error", reject);
      })
      .on("error", reject);
  });
};

// Helper function to check video file compatibility
const checkVideoCompatibility = async (filePath, mimeType) => {
  try {
    console.log("🔍 Checking video file compatibility:", filePath);
    const fileStats = fs.statSync(filePath);
    const fileSizeMB = fileStats.size / (1024 * 1024);

    // Check if file is readable
    try {
      const accessfile = fs.accessSync(filePath, fs.constants.R_OK);
      console.log(`accessfile : ${accessfile}`);
      console.log(`✅ File is readable: ${filePath}`);
    } catch (accessError) {
      throw new Error(`File is not readable: ${accessError.message}`);
    }

    // Validate MIME type
    const validMimeTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
    ];
    if (!validMimeTypes.includes(mimeType)) {
      console.warn(
        `⚠️  Warning: MIME type ${mimeType} may not be supported by Gemini. Using video/mp4 instead.`
      );
      return "video/mp4";
    }

    return mimeType;
  } catch (error) {
    throw new Error(`Video compatibility check failed: ${error.message}`);
  }
};

// Helper function to create temporary file
const createTempFile = async (videoBuffer, videoTitle, filename) => {
  const tempDir = "temp_uploads";
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = path.join(tempDir, `${Date.now()}_${videoTitle}`);
  fs.writeFileSync(tempFilePath, videoBuffer);

  return tempFilePath;
};

// Helper function to compress video before upload (if FFmpeg available)
// const compressVideoForGemini = async (inputPath, options = {}) => {
//   try {
//     const compressedDir = "compressed_videos";
//     if (!fs.existsSync(compressedDir)) {
//       fs.mkdirSync(compressedDir, { recursive: true });
//     }

//     const compressedFilePath = path.join(
//       compressedDir,
//       `compressed_${Date.now()}_${path.basename(inputPath)}`
//     );

//     console.log(`\n🎬 STARTING VIDEO COMPRESSION FOR GEMINI:`);
//     console.log(
//       `�� Original file: ${(fs.statSync(inputPath).size / 1024 / 1024).toFixed(
//         2
//       )} MB`
//     );
//     console.log(
//       `🎯 Target: ${options.width || 720}p, CRF: ${options.crf || 28}`
//     );
//     console.log(`⏳ Compressing...`);

//     await compressVideo(inputPath, compressedFilePath, {
//       width: options.width || 720,
//       quality: options.quality || "auto",
//       format: "mp4",
//       fps: options.fps || 24,
//       crf: options.crf || 28,
//     });

//     const originalSize = fs.statSync(inputPath).size;
//     const compressedSize = fs.statSync(compressedFilePath).size;
//     const compressionRatio = (
//       ((originalSize - compressedSize) / originalSize) *
//       100
//     ).toFixed(1);

//     console.log(`\n✅ COMPRESSION COMPLETE:`);
//     console.log(`📊 BEFORE: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
//     console.log(`📊 AFTER:  ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
//     console.log(`📉 REDUCTION: ${compressionRatio}%`);
//     console.log(`🎉 Video compressed successfully for Gemini!`);

//     return {
//       path: compressedFilePath,
//       originalSize,
//       compressedSize,
//       compressionRatio,
//     };
//   } catch (compressionError) {
//     console.error(
//       "❌ Video compression failed, using original file:",
//       compressionError.message
//     );

//     if (compressionError.message.includes("FFmpeg not available")) {
//       console.log(
//         "⚠️  FFmpeg not installed - please install FFmpeg to enable video compression"
//       );
//       console.log("�� Installation guide: https://ffmpeg.org/download.html");
//       console.log("🔄 Continuing with original video file...");
//     } else {
//       console.log(
//         "⚠️  Compression error - continuing with original video file..."
//       );
//     }

//     // Return original file info
//     const originalSize = fs.statSync(inputPath).size;
//     return {
//       path: inputPath,
//       originalSize,
//       compressedSize: originalSize,
//       compressionRatio: 0,
//     };
//   }
// };

// Helper function to upload file to Gemini
const uploadFileToGemini = async (filePath, mimeType) => {
  try {
    console.log(`\n🚀 UPLOADING FILE TO GEMINI:`, filePath);
    // Ensure the file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileStats = fs.statSync(filePath);
    if (fileStats.size === 0) {
      throw new Error("File is empty");
    }

    // Validate MIME type
    const validMimeTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
    ];
    if (!validMimeTypes.includes(mimeType)) {
      console.warn(
        `⚠️  Warning: MIME type ${mimeType} may not be supported by Gemini. Using video/mp4 instead.`
      );
      mimeType = "video/mp4";
    }

    // Try to read a small portion of the file to ensure it's not corrupted
    try {
      const testRead = fs.readFileSync(filePath, { start: 0, end: 1024 });
      console.log(
        "✅ File read test successful, first 1KB:",
        testRead.length,
        "bytes"
      );
    } catch (readError) {
      throw new Error(`File read test failed: ${readError.message}`);
    }

    // Normalize file path for Gemini API (convert backslashes to forward slashes)
    const normalizedPath = filePath.replace(/\\/g, "/");

    console.log("normalizedPath", normalizedPath, mimeType);
    // Upload to Gemini with proper error handling (using same pattern as working code)
    const myfile = await ai.files.upload({
      file: normalizedPath,
      config: {
        mimeType: mimeType,
        // displayName: path.basename(filePath),
      },
    });

    console.log("✅ File uploaded to Gemini successfully:", myfile);
    return myfile;
  } catch (error) {
    console.error("❌ Gemini file upload failed:", error);
    console.error("Error details:", {
      status: error.status,
      code: error.code,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Provide more specific error information
    if (error.status === 400) {
      if (error.message.includes("invalid argument")) {
        const fileStats = fs.statSync(filePath);
        throw new Error(
          `Invalid file format or size. File: ${path.basename(
            filePath
          )}, Size: ${(fileStats.size / 1024 / 1024).toFixed(
            2
          )}MB, Type: ${mimeType}. This may be due to unsupported video codec or format.`
        );
      } else if (error.message.includes("file size")) {
        throw new Error(
          `File size exceeds Gemini limits. Current size: ${(
            fs.statSync(filePath).size /
            1024 /
            1024
          ).toFixed(2)}MB`
        );
      }
    } else if (error.status === 413) {
      throw new Error("File too large for Gemini API");
    } else if (error.status === 401) {
      throw new Error(
        "Authentication failed. Please check your GOOGLE_API_KEY"
      );
    } else if (error.status === 403) {
      throw new Error("Access denied. Please check your API permissions");
    }

    throw new Error(`Gemini upload failed: ${error.message}`);
  }
};

// Helper function to monitor Gemini file status
const monitorGeminiFileStatus = async (myfile, videoId) => {
  return new Promise((resolve, reject) => {
    let waitTime = 0;
    const maxWaitTime = 300000; // 5 minutes max wait
    const checkInterval = 3000; // Check every 3 seconds

    const statusMonitor = setInterval(async () => {
      try {
        const fileStatus = await ai.files.get({ name: myfile.name });
        console.log(
          `📊 File status: ${fileStatus.state} (${Math.round(
            waitTime / 1000
          )}s elapsed)`
        );

        // Update status every 10 seconds
        if (videoId && waitTime % 5000 === 0) {
          const progress = Math.min(50 + Math.floor(waitTime / 5000) * 5, 75);
          aiAnnotationStatus.set(videoId, {
            ...aiAnnotationStatus.get(videoId),
            status: 'processing',
            message: `Gemini processing video (${Math.round(waitTime / 1000)}s elapsed)`,
            progress: `${progress}%`,
            step: 'gemini_processing',
            elapsedSeconds: Math.round(waitTime / 1000)
          });
        }

        if (fileStatus.state === "ACTIVE") {
          clearInterval(statusMonitor);
          resolve(fileStatus);
        } else if (fileStatus.state === "FAILED") {
          clearInterval(statusMonitor);
          reject(new Error("File processing failed on Gemini"));
        } else if (waitTime >= maxWaitTime) {
          clearInterval(statusMonitor);
          reject(new Error("Max wait time exceeded (5 minutes)"));
        }

        waitTime += checkInterval;
      } catch (statusError) {
        console.log("⏳ Status check error, continuing to monitor...");
        waitTime += checkInterval;
      }
    }, checkInterval);
  });
};

// Helper function to generate AI annotations
const generateAIAnnotations = async (myfile, instruction) => {
  try {
    console.log("🤖 Generating AI annotations...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
        instruction,
      ]),
    });

    const annotation = response.text;
    console.log("AI annotation response:", annotation);
    console.log(`✅ AI analysis complete!`);

    return annotation;
  } catch (aiError) {
    console.error("AI annotation error:", aiError);
    throw aiError;
  }
};

// Helper function to parse and validate annotations
const parseAndValidateAnnotations = async (annotation) => {
  let aiAnnotations;
  try {
    // Clean the response by removing markdown code blocks if present
    let cleanResponse = annotation;
    if (cleanResponse.includes("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/\s*```/, "");
    } else if (cleanResponse.includes("```")) {
      cleanResponse = cleanResponse.replace(/```\s*/, "").replace(/\s*```/, "");
    }

    aiAnnotations = JSON.parse(cleanResponse);
    console.log(`📝 Parsed ${aiAnnotations.length} annotations`);
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    // Try to extract JSON from response if it's wrapped in text
    const jsonMatch = annotation.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      aiAnnotations = JSON.parse(jsonMatch[0]);
      console.log(
        `📝 Extracted ${aiAnnotations.length} annotations from response`
      );
    } else {
      throw new Error("Invalid JSON response from AI");
    }
  }

  // Validate and clean the annotations
  const validAnnotations = aiAnnotations
    .filter(
      (annotation) =>
        annotation.startTime >= 0 &&
        annotation.endTime > annotation.startTime &&
        annotation.label &&
        annotation.text
    )
    .map((annotation) => ({
      ...annotation,
      confidence: Math.min(Math.max(annotation.confidence || 0.5, 0.1), 1.0),
    }));

  // Build summary info (instead of res.write)
  const summary = {
    total: aiAnnotations.length,
    valid: validAnnotations.length,
    invalid: aiAnnotations.length - validAnnotations.length,
    samples: validAnnotations.slice(0, 3).map((ann) => ({
      range: `${ann.startTime}s-${ann.endTime}s`,
      label: ann.label,
      text: ann.text,
    })),
  };

  console.log("🎯 VALIDATION COMPLETE:", summary);

  return { validAnnotations, summary };
};

// Helper function to create fallback annotations
const createFallbackAnnotations = (videoDuration) => {
  const sampleAnnotations = [];

  // Generate 10-second interval annotations with realistic content
  for (let i = 0; i < videoDuration; i += 10) {
    const endTime = Math.min(i + 10, videoDuration);
    const segmentNumber = Math.floor(i / 10) + 1;

    // Create realistic annotation content based on segment
    let label, text;
    if (segmentNumber === 1) {
      label = "opening_scene";
      text = "Video begins with initial content and setup";
    } else if (segmentNumber === 2) {
      label = "main_content";
      text = "Primary content and discussion continues";
    } else if (segmentNumber === 3) {
      label = "development";
      text = "Content develops with more details and interaction";
    } else if (segmentNumber === 4) {
      label = "climax";
      text = "Key moments and important information presented";
    } else {
      label = "conclusion";
      text = "Final segment with summary and closing remarks";
    }

    sampleAnnotations.push({
      startTime: i,
      endTime: endTime,
      label: label,
      text: text,
      confidence: 0.7,
    });
  }

  // If no duration, create at least one annotation
  if (sampleAnnotations.length === 0) {
    sampleAnnotations.push({
      startTime: 0,
      endTime: 10,
      label: "video_content",
      text: "Video content analysis and annotation",
      confidence: 0.7,
    });
  }

  return sampleAnnotations;
};

// Main function to process Cloudinary videos
const processCloudinaryVideo = async (video, instruction, videoId) => {
  let tempFilePath = null;
  let compressedFilePath = null;

  try {
    // Update status - downloading
    aiAnnotationStatus.set(videoId, {
      ...aiAnnotationStatus.get(videoId),
      status: 'processing',
      message: 'Downloading video from Cloudinary',
      progress: 20,
      step: 'downloading_video'
    });

    console.log("🌐 Downloading video from Cloudinary...");

    const videoBuffer = await downloadVideoFromCloudinary(video.cloudinaryUrl);
    const fileSize = videoBuffer.length;

    // Create temporary file
    tempFilePath = await createTempFile(
      videoBuffer,
      video.title,
      video.filename
    );
    console.log(`📁 Temporary file created for processing`);

    // Update status - temp file created
    aiAnnotationStatus.set(videoId, {
      ...aiAnnotationStatus.get(videoId),
      status: 'processing',
      message: 'Video downloaded and temp file created',
      progress: 30,
      step: 'temp_file_created'
    });

    // Check video compatibility before upload
    console.log("🔍 Checking video compatibility...");
    const compatibleMimeType = await checkVideoCompatibility(
      tempFilePath,
      video.mimeType
    );

    compressedFilePath = tempFilePath;

    // Update status - uploading to Gemini
    aiAnnotationStatus.set(videoId, {
      ...aiAnnotationStatus.get(videoId),
      status: 'processing',
      message: 'Uploading video to Gemini',
      progress: 40,
      step: 'uploading_to_gemini'
    });

    const myfile = await uploadFileToGemini(tempFilePath, compatibleMimeType);

    // Update status - monitoring processing
    aiAnnotationStatus.set(videoId, {
      ...aiAnnotationStatus.get(videoId),
      status: 'processing',
      message: 'Video uploaded to Gemini, monitoring processing status',
      progress: 50,
      step: 'monitoring_processing'
    });

    // Monitor file status
    console.log("⏳ Monitoring file processing status...");
    await monitorGeminiFileStatus(myfile, videoId);

    console.log("🎉 File is now ACTIVE and ready!");

    // Update status - generating annotations
    aiAnnotationStatus.set(videoId, {
      ...aiAnnotationStatus.get(videoId),
      status: 'processing',
      message: 'Generating AI annotations',
      progress: 80,
      step: 'generating_annotations'
    });

    // Generate AI annotations
    const annotation = await generateAIAnnotations(myfile, instruction);

    // Parse and validate
    const validAnnotations = await parseAndValidateAnnotations(annotation);

    // Update status - finalizing
    aiAnnotationStatus.set(videoId, {
      ...aiAnnotationStatus.get(videoId),
      status: 'processing',
      message: 'AI analysis complete, finalizing results',
      progress: 95,
      step: 'finalizing_results'
    });

    // Final summary
    console.log(`\n🎉 AI ANALYSIS COMPLETE!`);
    console.log(`📁 Video: ${video.title}`);
    console.log(`📊 Annotations generated: ${validAnnotations.length}`);
    console.log(`🤖 Model: gemini-2.5-flash`);
    console.log(`⏰ Generated at: ${new Date().toISOString()}`);

    return validAnnotations;
  } catch (error) {
    throw error;
  } finally {
    // Clean up temp files
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("✅ Original temp file cleaned up");
      } catch (cleanupError) {
        console.error("❌ Cleanup error:", cleanupError);
      }
    }
  }
};

// Main function to process local videos
const processLocalVideo = async (video, instruction, videoId) => {
  let tempFilePath = null;
  let compressedFilePath = null;

  try {
    const filePath = path.join(process.cwd(), "uploads", video.filename);
    const mimeType = video.mimeType || "video/mp4";

    // Check if local file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(
        "Video file not found locally and no Cloudinary URL available"
      );
    }

    // Get file stats for size information
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
    console.log(`Processing local video: ${fileStats}`);

    // res.write(`📁 Processing local video: ${video.filename}\n`); // This line was removed from the original file
    // res.write(` File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB\n`); // This line was removed from the original file

    // Create temporary file
    tempFilePath = await createTempFile(
      fs.readFileSync(filePath),
      video.title,
      video.filename
    );
    // res.write(`📁 Temporary file created for processing\n`); // This line was removed from the original file

    // Check video compatibility before upload
    // res.write("🔍 Checking video compatibility...\n"); // This line was removed from the original file
    const compatibleMimeType = await checkVideoCompatibility(
      tempFilePath,
      mimeType
    );
    // res.write(`✅ Video compatibility verified\n`); // This line was removed from the original file

    // Compress video for better Gemini compatibility
    // res.write("🎬 Compressing video for Gemini compatibility...\n"); // This line was removed from the original file
    // const compressionResult = await compressVideoForGemini(tempFilePath, { // This line was removed from the original file
    //   width: 720,  // Reduce to 720p for better compatibility // This line was removed from the original file
    //   crf: 28,     // Good quality with reasonable file size // This line was removed from the original file
    //   fps: 24      // Standard frame rate // This line was removed from the original file
    // }); // This line was removed from the original file

    // if (compressionResult.compressionRatio > 0) { // This line was removed from the original file
    //   res.write(`✅ Video compressed: ${compressionResult.compressionRatio}% smaller\n`); // This line was removed from the original file
    //   compressedFilePath = compressionResult.path; // This line was removed from the original file
    // } else { // This line was removed from the original file
    //   res.write(`ℹ️  Using original video (no compression)\n`); // This line was removed from the original file
    //   compressedFilePath = tempFilePath; // This line was removed from the original file
    // } // This line was removed from the original file

    // Upload to Gemini
    // res.write("🚀 Uploading to Gemini Files API...\n"); // This line was removed from the original file
    const myfile = await uploadFileToGemini(tempFilePath, compatibleMimeType);
    // res.write(`✅ File uploaded to Gemini: ${myfile.name}\n`); // This line was removed from the original file

    // Monitor file status
    // res.write("⏳ Monitoring file processing status...\n"); // This line was removed from the original file
    await monitorGeminiFileStatus(myfile, videoId);

    // res.write(" File is now ACTIVE and ready!\n"); // This line was removed from the original file

    // Generate AI annotations
    const annotation = await generateAIAnnotations(myfile, instruction);

    // Parse and validate
    const validAnnotations = await parseAndValidateAnnotations(annotation);

    // Final summary
    // res.write(`\n🎉 AI ANALYSIS COMPLETE!\n`); // This line was removed from the original file
    // res.write(`📁 Video: ${video.title}\n`); // This line was removed from the original file
    // res.write(`📊 Annotations generated: ${validAnnotations.length}\n`); // This line was removed from the original file
    // res.write(`🤖 Model: gemini-2.5-flash\n`); // This line was removed from the original file
    // res.write(`⏰ Generated at: ${new Date().toISOString()}\n`); // This line was removed from the original file

    return validAnnotations;
  } catch (error) {
    throw error;
  } finally {
    // Clean up temp files
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("✅ Original temp file cleaned up");
      } catch (cleanupError) {
        console.error("❌ Cleanup error:", cleanupError);
      }
    }

    if (
      compressedFilePath &&
      compressedFilePath !== tempFilePath &&
      fs.existsSync(compressedFilePath)
    ) {
      try {
        fs.unlinkSync(compressedFilePath);
        console.log("✅ Compressed temp file cleaned up");
      } catch (cleanupError) {
        console.error("❌ Compressed file cleanup error:", cleanupError);
      }
    }
  }
};

// @desc    Generate AI annotations
// @route   POST /api/ai/annotate
// @access  Private
const annotateWithAI = async (req, res) => {
  try {
    const { videoId, taskDescription } = req.body;

    // Verify video belongs to user
    const video = await Video.findOne({
      _id: videoId,
      user: req.user.id,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Get existing annotations for context
    const existingAnnotations = await Annotation.find({ video: videoId }).sort({
      startTime: 1,
    });

    console.log("Existing annotations found:", existingAnnotations.length);

    // Construct detailed instruction for video analysis
    const instruction = [
      "You are a video annotation assistant. Analyze the attached video and return ONLY a JSON array of annotation objects.",

      "",
      "Video Information:",
      `- Title: ${video.title}`,
      `- Description: ${video.description || "No description"}`,
      `- Duration: ${video.duration || "Unknown"} seconds`,

      "",
      "Task Description:",
      taskDescription ||
        "Generate comprehensive behavioral annotations for this video",

      "",
      "Guidelines:",
      "1. Return ONLY valid JSON array, no other text.",
      "2. Each annotation must have: startTime, endTime, label, text, confidence.",
      "3. Times must be in seconds (0.0 to video duration), minutes (0.0 to video duration) or hours (0.0 to video duration) which ever is appropriate.",
      "4. Do NOT use fixed  intervals.",
      "5. Instead, create annotations based on meaningful scene or activity changes or behaviours.",
      "6. If the video is long (> 5 minutes), use larger segments (5m) unless clear actions require shorter ones.",
      "7. Keep text descriptions CONCISE.",
      "8. Use clear, action-focused labels .",
      "9. Confidence scores: 0.1 (low) to 1.0 (high).",
      "10. Never overlap time segments — each annotation should cover a unique range.",
      "11. If no significant change occurs for a while, merge into a longer annotation.",
      "12. Describe what is actually happening: actions, expressions, movements, interactions,behaviours.",
      "13. Dont not make too much annotations , if video is long make less annotations as possible 10-12 annotations is enough for long videos",

      "",
      "Expected JSON format:",
      '[{"startTime": 0, "endTime": 12, "label": "Action", "text": "Brief description", "confidence": 0.9}]',
    ].join("\n");

    // Initialize status for this video
    aiAnnotationStatus.set(videoId, {
      status: 'processing',
      message: 'AI analysis started',
      progress: 0,
      step: 'initializing',
      startedAt: new Date(),
      videoId,
      model: 'gemini-2.5-flash',
      provider: providerName
    });

    // Send immediate response with status ID
    res.status(202).json({
      success: true,
      message: "AI analysis started",
      data: {
        statusId: videoId,
        status: 'processing',
        message: 'AI analysis started',
        progress: 0,
        step: 'initializing',
        startedAt: new Date(),
        model: 'gemini-2.5-flash',
        provider: providerName
      }
    });

    // Continue processing in background
    processVideoInBackground(video, instruction, videoId, taskDescription, existingAnnotations);

  } catch (error) {
    console.error("AI annotation error:", error);
    
    // Send error response to frontend
    return res.status(500).json({
      success: false,
      message: "AI annotation failed",
      error: error.message,
      data: {
        videoId: req.body.videoId,
        generatedAt: new Date(),
        model: "gemini-2.5-flash",
        provider: providerName,
      },
    });
  }
};

// Background processing function
const processVideoInBackground = async (video, instruction, videoId, taskDescription, existingAnnotations) => {
  try {
    // Update status
    aiAnnotationStatus.set(videoId, {
      ...aiAnnotationStatus.get(videoId),
      status: 'processing',
      message: 'Starting video processing',
      progress: 10,
      step: 'video_processing_started'
    });

    let validAnnotations;

    // Process video based on source
    if (video.cloudinaryUrl) {
      console.log("Processing Cloudinary video with Gemini:", {
        cloudinaryUrl: video.cloudinaryUrl,
        title: video.title,
        duration: video.duration,
      });

      validAnnotations = await processCloudinaryVideo(video, instruction, videoId);
    } else {
      console.log("Processing local video with Gemini");
      validAnnotations = await processLocalVideo(video, instruction, videoId);
    }

    console.log("Came back from cloudinary or local video processing");
    console.log("sending response", validAnnotations);

    // Update status to completed
    aiAnnotationStatus.set(videoId, {
      status: 'completed',
      message: 'AI analysis completed successfully',
      progress: 100,
      step: 'completed',
      completedAt: new Date(),
      annotations: validAnnotations.validAnnotations,
      videoId,
      model: 'gemini-2.5-flash',
      provider: providerName
    });

  } catch (aiError) {
    console.error("AI Provider Error Details:", {
      error: aiError,
      errorMessage: aiError?.message,
      errorStatus: aiError?.status,
      errorCode: aiError?.code,
      stack: aiError?.stack,
    });

    const apiMessage = aiError?.message || "AI provider error";

    console.log(`\n⚠️  AI SERVICE ERROR: ${apiMessage}`);
    console.log(`🔧 AI service temporarily unavailable`);

    // Update status to error
    aiAnnotationStatus.set(videoId, {
      status: 'error',
      message: 'AI analysis failed',
      error: apiMessage,
      progress: 0,
      step: 'error',
      errorAt: new Date(),
      videoId,
      model: 'gemini-2.5-flash',
      provider: providerName
    });
  }
};

// @desc    Get AI annotation status
// @route   GET /api/ai/status/:videoId
// @access  Private
const getAIAnnotationStatus = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Verify video belongs to user
    const video = await Video.findOne({
      _id: videoId,
      user: req.user.id,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const status = aiAnnotationStatus.get(videoId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        message: "No AI annotation status found for this video",
      });
    }

    res.status(200).json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error("Get AI status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI annotation status",
      error: error.message,
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
      user: req.user.id,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
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
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: prompt }],
      });

      const suggestions = JSON.parse(response.text || "[]");

      res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (aiError) {
      const apiMessage =
        aiError?.error?.message || aiError?.message || "AI provider error";
      const isBalance =
        aiError?.status === 402 || /insufficient/i.test(apiMessage);
      // Fallback suggestions
      const fallbackSuggestions = [
        {
          label: "behavior_observation",
          text: isBalance
            ? "Provider balance insufficient"
            : "General behavioral observation",
          confidence: 0.3,
        },
      ];

      res.status(200).json({
        success: true,
        data: fallbackSuggestions,
        warning: isBalance
          ? "Insufficient balance on AI provider account"
          : "AI service temporarily unavailable",
        provider: providerName,
      });
    }
  } catch (error) {
    console.error("AI suggestion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI suggestions",
      error: error.message,
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
      user: req.user.id,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
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
        type: "ai-generated",
        confidence: annotation.confidence || 0.5,
      });

      await newAnnotation.save();
      savedAnnotations.push(newAnnotation);
    }

    res.status(201).json({
      success: true,
      message: "AI annotations saved successfully",
      data: savedAnnotations,
    });
  } catch (error) {
    console.error("Save AI annotations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save AI annotations",
      error: error.message,
    });
  }
};

// @desc    Test AI service
// @route   GET /api/ai/test
// @access  Private
const testAIService = async (req, res) => {
  try {
    console.log("Testing AI service...");
    console.log("GOOGLE_API_KEY available:", !!process.env.GOOGLE_API_KEY);
    console.log("Config GOOGLE_API_KEY available:", !!config.GOOGLE_API_KEY);

    const apiKey = process.env.GOOGLE_API_KEY || config.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "No Google API key found",
        error: "GOOGLE_API_KEY environment variable is not set",
      });
    }

    // Test Gemini connection
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            text: "Hello! Please respond with 'AI service is working' and nothing else.",
          },
        ],
      });

      const result = response.text;
      console.log("Gemini test successful:", result);

      res.status(200).json({
        success: true,
        message: "AI service test successful",
        data: {
          response: result,
          model: "gemini-2.5-flash",
          provider: providerName,
          timestamp: new Date(),
        },
      });
    } catch (geminiError) {
      console.error("Gemini test failed:", geminiError);
      res.status(500).json({
        success: false,
        message: "AI service test failed",
        error: geminiError.message,
        details: {
          provider: providerName,
          model: "gemini-2.5-flash",
          apiKeyLength: apiKey ? apiKey.length : 0,
        },
      });
    }
  } catch (error) {
    console.error("AI test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test AI service",
      error: error.message,
    });
  }
};

module.exports = {
  annotateWithAI,
  getAISuggestions,
  saveAIAnnotations,
  testAIService,
  getAIAnnotationStatus,
};

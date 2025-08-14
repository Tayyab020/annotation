import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { videoService } from "../../services/video";
import { annotationService } from "../../services/annotation";
import { aiService } from "../../services/ai";
import { Video, Annotation, CreateAnnotation, LoadingState } from "../../types";
import toast from "react-hot-toast";

const VideoPlayer: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [showAIForm, setShowAIForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(
    null
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnnotations, setAiAnnotations] = useState<any[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state
  const [annotationForm, setAnnotationForm] = useState<CreateAnnotation>({
    videoId: videoId || "",
    startTime: 0,
    endTime: 5,
    label: "",
    text: "",
  });

  const [aiForm, setAiForm] = useState({
    taskDescription:
      "Generate comprehensive behavioral annotations for this video",
  });

  useEffect(() => {
    if (videoId) {
      fetchVideoData();
    }
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      const [videoData, annotationsData] = await Promise.all([
        videoService.getVideo(videoId!),
        annotationService.getVideoAnnotations(videoId!),
      ]);
      setVideo(videoData);
      setAnnotations(annotationsData);
    } catch (error) {
      toast.error("Failed to load video data");
    } finally {
      setLoading({ isLoading: false });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnnotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newAnnotation = await annotationService.createAnnotation({
        ...annotationForm,
        videoId: videoId!,
      });

      setAnnotations((prev) => [...prev, newAnnotation]);
      setShowAnnotationForm(false);
      setAnnotationForm({
        videoId: videoId || "",
        startTime: 0,
        endTime: 5,
        label: "",
        text: "",
      });

      toast.success("Annotation created successfully!");
    } catch (error) {
      toast.error("Failed to create annotation");
      console.error("Error creating annotation:", error);
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      // Check if it's a temporary annotation (AI-generated that hasn't been saved yet)
      if (annotationId.startsWith("temp_")) {
        // Remove from local state only
        setAnnotations((prev) => prev.filter((a) => a._id !== annotationId));
        toast.success("Annotation removed!");
        return;
      }

      // For saved annotations, delete from database
      await annotationService.deleteAnnotation(annotationId);
      setAnnotations((prev) => prev.filter((a) => a._id !== annotationId));
      toast.success("Annotation deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete annotation");
      console.error("Error deleting annotation:", error);
    }
  };

  const handleEditAnnotation = async (
    annotationId: string,
    updatedData: Partial<CreateAnnotation>
  ) => {
    try {
      const updatedAnnotation = await annotationService.updateAnnotation(
        annotationId,
        updatedData
      );
      setAnnotations((prev) =>
        prev.map((a) => (a._id === annotationId ? updatedAnnotation : a))
      );
      toast.success("Annotation updated successfully!");
    } catch (error) {
      toast.error("Failed to update annotation");
      console.error("Error updating annotation:", error);
    }
  };

  const handleAIGenerate = async () => {
    setAiLoading(true);
    try {
      const result = await aiService.generateAnnotations({
        videoId: videoId!,
        taskDescription: aiForm.taskDescription,
      });

      if (result.annotations) {
        setAiAnnotations(result.annotations);
        toast.success(`AI generated ${result.annotations.length} annotations!`);
      } else {
        toast.error("Failed to generate AI annotations");
      }
    } catch (error) {
      toast.error("AI service error");
    } finally {
      setAiLoading(false);
      setShowAIForm(false);
    }
  };

  const handleSaveAIAnnotations = async () => {
    try {
      const result = await aiService.saveAIAnnotations(videoId!, aiAnnotations);

      if (result) {
        setAnnotations((prev) => [...prev, ...result]);
        setAiAnnotations([]);
        setShowAIForm(false);
        toast.success("AI annotations saved successfully!");
      }
    } catch (error) {
      toast.error("Failed to save AI annotations");
    }
  };

  const handleAcceptAIAnnotation = (annotation: any, index: number) => {
    // Add the accepted annotation to the main annotations list
    const newAnnotation = {
      ...annotation,
      _id: `temp_${Date.now()}_${index}`, // Temporary ID for tracking
      type: "ai-generated" as const,
      createdAt: new Date().toISOString(),
    };

    setAnnotations((prev) => [...prev, newAnnotation]);

    // Remove from AI annotations
    setAiAnnotations((prev) => prev.filter((_, i) => i !== index));

    toast.success(
      `Annotation "${annotation.label}" accepted and added to annotations!`
    );
  };

  const handleRejectAIAnnotation = (index: number) => {
    setAiAnnotations((prev) => prev.filter((_, i) => i !== index));
    toast.success(`Annotation rejected!`);
  };

  const handleAcceptAllAIAnnotations = () => {
    // Add all AI annotations to the main annotations list with temporary IDs
    const acceptedAnnotations = aiAnnotations.map((annotation, index) => ({
      ...annotation,
      _id: `temp_${Date.now()}_${index}`, // Temporary ID for tracking
      type: "ai-generated" as const,
      createdAt: new Date().toISOString(),
    }));

    setAnnotations((prev) => [...prev, ...acceptedAnnotations]);
    setAiAnnotations([]); // Clear AI annotations
    toast.success(`Accepted ${acceptedAnnotations.length} AI annotations!`);
  };

  const handleRejectAllAIAnnotations = () => {
    setAiAnnotations([]);
    toast.success(`Rejected all AI annotations!`);
  };

  const handleSaveAllAnnotations = async () => {
    if (annotations.length === 0) {
      toast.error("No annotations to save");
      return;
    }

    try {
      setSaveLoading(true);

      // Save each annotation individually using the existing createAnnotation method
      const savedAnnotations = [];
      const annotationsToSave = annotations.filter(
        (a) => a._id.startsWith("temp_") || !a._id
      );

      for (let i = 0; i < annotationsToSave.length; i++) {
        const annotation = annotationsToSave[i];

        if (annotation._id && !annotation._id.startsWith("temp_")) {
          // Already exists in DB, skip
          savedAnnotations.push(annotation);
        } else {
          // New annotation or temporary AI annotation, create it
          const savedAnnotation = await annotationService.createAnnotation({
            videoId: videoId!,
            startTime: annotation.startTime,
            endTime: annotation.endTime,
            label: annotation.label,
            text: annotation.text,
            confidence: annotation.confidence || 1,
          });
          savedAnnotations.push(savedAnnotation);

          // Show progress toast
          toast.success(
            `Saved annotation ${i + 1} of ${annotationsToSave.length}: ${
              annotation.label
            }`,
            {
              duration: 1000,
            }
          );
        }
      }

      // Add existing saved annotations
      const existingAnnotations = annotations.filter(
        (a) => a._id && !a._id.startsWith("temp_")
      );
      const allSavedAnnotations = [...existingAnnotations, ...savedAnnotations];

      // Update state with saved annotations (replace temp IDs with real ones)
      setAnnotations(allSavedAnnotations);
      toast.success(
        `All annotations saved successfully! (${allSavedAnnotations.length} total)`
      );
    } catch (error) {
      toast.error("Failed to save annotations");
      console.error("Error saving annotations:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditAnnotationClick = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setAnnotationForm({
      videoId:
        typeof annotation.video === "string"
          ? annotation.video
          : annotation.video._id,
      startTime: annotation.startTime,
      endTime: annotation.endTime,
      label: annotation.label,
      text: annotation.text,
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnotation) return;

    try {
      await handleEditAnnotation(editingAnnotation._id, annotationForm);
      setShowEditForm(false);
      setEditingAnnotation(null);
      setAnnotationForm({
        videoId: videoId || "",
        startTime: 0,
        endTime: 5,
        label: "",
        text: "",
      });
    } catch (error) {
      console.error("Error updating annotation:", error);
    }
  };

  if (loading.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-secondary">
          Video not found
        </h2>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-imdb-black min-h-screen ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/videos">
          <button className="p-3 text-white/70 hover:text-white hover:bg-imdb-black-lighter/50 rounded-xl transition-all duration-200">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-white">{video.title}</h1>
        <div className="w-10 h-10"></div> {/* Placeholder for back button */}
      </div>

      {/* Video Player Section */}
      <div className="card-gradient max-w-3xl mx-auto p-6 space-y-6">
        {/* Video Container */}
        <div className="relative bg-imdb-black rounded-2xl overflow-hidden mb-4 shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-auto"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source
              src={
                video.cloudinaryUrl ||
                `http://localhost:5000/uploads/${video.filename}`
              }
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          {/* Play/Pause Overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all duration-200"
          >
            {!isPlaying && (
              <div className="w-20 h-20 bg-imdb-gold/90 rounded-full flex items-center justify-center shadow-2xl shadow-glow">
                <PlayIcon className="w-10 h-10 text-imdb-black" />
              </div>
            )}
          </button>

          {/* Annotation Markers */}
          {annotations.map((annotation) => (
            <div
              key={annotation._id}
              className="absolute top-0 w-1 bg-imdb-gold cursor-pointer hover:bg-imdb-gold-light transition-all duration-200 hover:w-2"
              style={{
                left: `${(annotation.startTime / duration) * 100}%`,
                height: "100%",
              }}
              title={`${annotation.label}: ${annotation.text}`}
            />
          ))}
        </div>

        {/* Video Controls */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="video-progress"
            />
            <div className="flex justify-between text-sm text-white/60 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="p-4 bg-imdb-gold text-imdb-black rounded-2xl hover:bg-imdb-gold-light transition-all duration-200 shadow-lg hover:shadow-glow"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-3 text-white/70 hover:text-white hover:bg-imdb-black-lighter/50 rounded-xl transition-all duration-200"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-imdb-black-lighter rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            <button className="p-3 text-white/70 hover:text-white hover:bg-imdb-black-lighter/50 rounded-xl transition-all duration-200">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Annotations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-100 overflow-y-auto">
        {/* Manual Annotations */}
        <div className="card-gradient ">
          <h2 className="text-2xl font-bold text-white">Manual Annotations</h2>

          {annotations.length === 0 ? (
            <div className="text-center pt-4">
              <DocumentTextIcon className="w-10 h-10 text-imdb-black-lighter mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-6">
                No annotations yet. Create your first one!
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-4 pb-4 max-h-[600px] overflow-y-auto">
              {annotations.map((annotation) => (
                <div key={annotation._id} className="annotation-card ">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-imdb-gold bg-imdb-gold/10 px-3 py-1 rounded-lg">
                        {annotation.label}
                      </span>
                      {annotation._id.startsWith("temp_") && (
                        <span className="text-xs text-warning bg-warning/20 px-2 py-1 rounded-lg flex items-center">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          Unsaved
                        </span>
                      )}
                      {annotation.type === "ai-generated" &&
                        !annotation._id.startsWith("temp_") && (
                          <span className="text-xs text-imdb-gold bg-imdb-gold/20 px-2 py-1 rounded-lg flex items-center">
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            AI
                          </span>
                        )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAnnotationClick(annotation)}
                        className="p-2 text-imdb-gold hover:bg-imdb-gold/10 rounded-lg transition-colors duration-200"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnotation(annotation._id)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors duration-200"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-white mb-3">{annotation.text}</p>
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>
                      {formatTime(annotation.startTime)} -{" "}
                      {formatTime(annotation.endTime)}
                    </span>
                    <span className="capitalize">{annotation.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center">
            <button
              onClick={() => setShowAnnotationForm(true)}
              className="btn-primary"
            >
              <div className="flex">
                <PlusIcon className="w-5 h-5 mr-2" />
                <span> Add Annotation</span>
              </div>
            </button>
          </div>
        </div>

        {/* AI Annotations */}
        <div className="card-gradient">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">AI Annotations</h2>
            {aiAnnotations.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={handleAcceptAllAIAnnotations}
                  className="px-3 py-1 bg-success/20 text-success text-sm font-semibold rounded-lg hover:bg-success/30 transition-colors duration-200"
                >
                  Accept All ({aiAnnotations.length})
                </button>
                <button
                  onClick={handleRejectAllAIAnnotations}
                  className="px-3 py-1 bg-error/20 text-error text-sm font-semibold rounded-lg hover:bg-error/30 transition-colors duration-200"
                >
                  Reject All ({aiAnnotations.length})
                </button>
              </div>
            )}
          </div>

          {aiAnnotations.length > 0 ? (
            <div className="space-y-4 py-4">
              {aiAnnotations.map((annotation, index) => (
                <div
                  key={index}
                  className="annotation-card bg-gradient-to-r from-imdb-gold/5 to-imdb-gold-light/5 border-imdb-gold/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-imdb-gold bg-imdb-gold/20 px-3 py-1 rounded-lg">
                      {annotation.label}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-imdb-gold bg-imdb-gold/10 px-2 py-1 rounded-lg">
                        {Math.round(annotation.confidence * 100)}% confidence
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() =>
                            handleAcceptAIAnnotation(annotation, index)
                          }
                          className="p-1.5 bg-success/20 text-success hover:bg-success/30 rounded-lg transition-colors duration-200"
                          title="Accept annotation"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRejectAIAnnotation(index)}
                          className="p-1.5 bg-error/20 text-error hover:bg-error/30 rounded-lg transition-colors duration-200"
                          title="Reject annotation"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-white mb-3">{annotation.text}</p>
                  <div className="text-sm text-white/60">
                    {formatTime(annotation.startTime)} -{" "}
                    {formatTime(annotation.endTime)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center pt-4 ">
              <SparklesIcon className="w-10 h-10 text-imdb-black-lighter mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-6">
                Use AI to generate annotations automatically
              </p>
            </div>
          )}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowAIForm(true)}
              className="btn-secondary"
            >
              <div className="flex">
                <SparklesIcon className="w-5 h-5 mr-2" />
                <span>Generate AI Annotations</span>
              </div>
            </button>
          </div>
        </div>

        {/* Save All Annotations Button */}
        <div className="flex flex-col items-center space-y-4">
          {annotations.some((a) => a._id.startsWith("temp_")) && (
            <div className="text-center">
              <p className="text-sm text-warning bg-warning/10 px-4 py-2 rounded-lg border border-warning/20">
                💾 You have unsaved annotations. Click "Save All Annotations" to
                persist them to the database.
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {saveLoading && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>Saving annotations...</span>
                <span>
                  {
                    annotations.filter(
                      (a) => a._id.startsWith("temp_") || !a._id
                    ).length
                  }{" "}
                  remaining
                </span>
              </div>
              <div className="w-full bg-imdb-black-lighter rounded-full h-2">
                <div
                  className="bg-imdb-gold h-2 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      (annotations.filter(
                        (a) => a._id && !a._id.startsWith("temp_")
                      ).length /
                        Math.max(1, annotations.length)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={handleSaveAllAnnotations}
            disabled={saveLoading || annotations.length === 0}
            className="btn-primary py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-imdb-black mr-2"></div>
                Saving All Annotations...
              </div>
            ) : (
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                <span>Save All Annotations ({annotations.length})</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Annotation Form Modal */}
      {showAnnotationForm && (
        <div
          className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAnnotationForm(false)}
        >
          <div
            className="modal-content bg-imdb-black-light rounded-2xl shadow-lg border border-imdb-black-lighter max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-glow">
                <PlusIcon className="w-10 h-10 text-imdb-black" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">
                Create New Annotation
              </h3>
              <p className="text-white/60 text-lg">
                Add a detailed annotation to mark important moments in your
                video
              </p>
            </div>

            <form onSubmit={handleAnnotationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Annotation Label
                  </label>
                  <input
                    type="text"
                    value={annotationForm.label}
                    onChange={(e) =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="e.g., person_smiles, gesture_wave, action_walk"
                    required
                  />
                  <p className="text-xs text-white/50 mt-2">
                    Use descriptive, action-focused labels
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Current Video Time
                  </label>
                  <div className="bg-imdb-black-lighter rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-imdb-gold">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-sm text-white/60">
                      Click to set current time
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Description
                </label>
                <textarea
                  value={annotationForm.text}
                  onChange={(e) =>
                    setAnnotationForm((prev) => ({
                      ...prev,
                      text: e.target.value,
                    }))
                  }
                  className="input-field"
                  rows={4}
                  placeholder="Describe what's happening at this moment in detail..."
                  required
                />
                <p className="text-xs text-white/50 mt-2">
                  Be specific about behaviors, actions, and context
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Start Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={annotationForm.startTime}
                    onChange={(e) =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        startTime: parseFloat(e.target.value),
                      }))
                    }
                    className="input-field"
                    min="0"
                    step="0.1"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        startTime: currentTime,
                      }))
                    }
                    className="text-xs text-imdb-gold hover:text-imdb-gold-light mt-1"
                  >
                    Use Current Time
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    End Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={annotationForm.endTime}
                    onChange={(e) =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        endTime: parseFloat(e.target.value),
                      }))
                    }
                    className="input-field"
                    min="0"
                    step="0.1"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        endTime: currentTime + 5,
                      }))
                    }
                    className="text-xs text-imdb-gold hover:text-imdb-gold-light mt-1"
                  >
                    +5 seconds from start
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-imdb-gold/10 to-imdb-gold-light/10 rounded-xl p-4 border border-imdb-gold/20">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-imdb-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-imdb-black">
                      💡
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-imdb-gold mb-1">
                      Annotation Tips
                    </p>
                    <ul className="text-xs text-white/70 space-y-1">
                      <li>• Use clear, descriptive labels</li>
                      <li>• Set precise start and end times</li>
                      <li>• Include behavioral context</li>
                      <li>• Keep descriptions concise but informative</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAnnotationForm(false)}
                  className="flex-1 btn-outline py-4 text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-4 text-lg"
                >
                  <div className="flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    <span>Create Annotation</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Form Modal */}
      {showAIForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-glow">
                <SparklesIcon className="w-8 h-8 text-imdb-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Generate AI Annotations
              </h3>
              <p className="text-white/60">
                Let AI analyze your video and create annotations automatically
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Task Description
                </label>
                <textarea
                  value={aiForm.taskDescription}
                  onChange={(e) =>
                    setAiForm((prev) => ({
                      ...prev,
                      taskDescription: e.target.value,
                    }))
                  }
                  className="input-field"
                  rows={4}
                  placeholder="Describe what you want AI to analyze (e.g., 'Generate comprehensive behavioral annotations for this video')"
                />
                <p className="text-xs text-white/50 mt-2">
                  Be specific about what behaviors or patterns you want the AI
                  to focus on
                </p>
              </div>

              <div className="bg-gradient-to-r from-imdb-gold/10 to-imdb-gold-light/10 rounded-xl p-4 border border-imdb-gold/20">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-imdb-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-imdb-black">i</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-imdb-gold mb-1">
                      AI Analysis Features
                    </p>
                    <ul className="text-xs text-white/70 space-y-1">
                      <li>• Behavioral pattern detection</li>
                      <li>• Gesture and movement analysis</li>
                      <li>• Timeline-based annotations</li>
                      <li>• Confidence scoring for accuracy</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAIForm(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="flex-1 btn-primary"
                >
                  {aiLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-imdb-black mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      Generate AI Annotations
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Annotation Modal */}
      {showEditForm && editingAnnotation && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-glow">
                <PencilIcon className="w-10 h-10 text-imdb-black" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">
                Edit Annotation
              </h3>
              <p className="text-white/60 text-lg">
                Update your annotation details
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Annotation Label
                  </label>
                  <input
                    type="text"
                    value={annotationForm.label}
                    onChange={(e) =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="e.g., person_smiles, gesture_wave, action_walk"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Current Video Time
                  </label>
                  <div className="bg-imdb-black-lighter rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-imdb-gold">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-sm text-white/60">
                      Click to set current time
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Description
                </label>
                <textarea
                  value={annotationForm.text}
                  onChange={(e) =>
                    setAnnotationForm((prev) => ({
                      ...prev,
                      text: e.target.value,
                    }))
                  }
                  className="input-field"
                  rows={4}
                  placeholder="Describe what's happening at this moment in detail..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Start Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={annotationForm.startTime}
                    onChange={(e) =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        startTime: parseFloat(e.target.value),
                      }))
                    }
                    className="input-field"
                    min="0"
                    step="0.1"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        startTime: currentTime,
                      }))
                    }
                    className="text-xs text-imdb-gold hover:text-imdb-gold-light mt-1"
                  >
                    Use Current Time
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    End Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={annotationForm.endTime}
                    onChange={(e) =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        endTime: parseFloat(e.target.value),
                      }))
                    }
                    className="input-field"
                    min="0"
                    step="0.1"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAnnotationForm((prev) => ({
                        ...prev,
                        endTime: currentTime + 5,
                      }))
                    }
                    className="text-xs text-imdb-gold hover:text-imdb-gold-light mt-1"
                  >
                    +5 seconds from start
                  </button>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 btn-outline py-4 text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-4 text-lg"
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Update Annotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

import React, { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlayIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClockIcon,
  CalendarIcon,
  PlusIcon,
  ArrowLeftIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { annotationService } from "../../services/annotation";
import { videoService } from "../../services/video";
import { Video } from "../../types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface VideoWithAnnotationCount extends Video {
  annotationCount: number;
}

const AnnotationHistory: React.FC = () => {
  const [videos, setVideos] = useState<VideoWithAnnotationCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "date" | "annotations">(
    "date"
  );
  const [selectedVideo, setSelectedVideo] =
    useState<VideoWithAnnotationCount | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      console.log("Starting to fetch videos...");

      const videosResponse = await videoService.getVideos();
      console.log("Video service response:", videosResponse);

      const videosData = videosResponse.videos;
      console.log("Videos data extracted:", videosData);

      if (!videosData || !Array.isArray(videosData)) {
        console.error("Invalid videos data:", videosData);
        toast.error("Invalid video data received");
        return;
      }

      // Get annotation count for each video
      console.log("Starting to fetch annotation counts...");
      const videosWithCounts = await Promise.allSettled(
        videosData.map(async (video: Video, index: number) => {
          console.log(
            `Processing video ${index + 1}/${videosData.length}:`,
            video._id
          );
          try {
            console.log(
              `Calling annotationService.getVideoAnnotations(${video._id})`
            );
            const annotations = await annotationService.getVideoAnnotations(
              video._id
            );
            console.log(`Annotations for video ${video._id}:`, annotations);
            return {
              ...video,
              annotationCount: annotations.length,
            };
          } catch (error) {
            console.warn(
              `Failed to get annotations for video ${video._id}:`,
              error
            );
            // Return video with 0 annotations if annotation fetch fails
            return {
              ...video,
              annotationCount: 0,
            };
          }
        })
      );

      // Process results, handling both fulfilled and rejected promises
      const processedVideos = videosWithCounts.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          console.warn(`Video ${index} failed to process:`, result.reason);
          // Return video with 0 annotations if processing failed
          return {
            ...videosData[index],
            annotationCount: 0,
          };
        }
      });

      console.log("Final processed videos:", processedVideos);
      setVideos(processedVideos);
      toast.success(`Successfully loaded ${processedVideos.length} videos`);
    } catch (error) {
      console.error("Error in fetchVideos:", error);
      // Even if there's an error, try to show videos with 0 annotations
      try {
        console.log("Attempting fallback video fetch...");
        const videosResponse = await videoService.getVideos();
        const fallbackVideos = videosResponse.videos.map((video) => ({
          ...video,
          annotationCount: 0,
        }));
        setVideos(fallbackVideos);
        toast.error("Failed to fetch annotation counts, showing videos only");
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        toast.error("Failed to fetch videos");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate thumbnail URL from Cloudinary video
  const generateThumbnailUrl = (cloudinaryUrl: string, publicId: string) => {
    if (!cloudinaryUrl || !publicId) return null;

    // Extract the base URL and generate thumbnail
    const baseUrl = cloudinaryUrl.split("/upload/")[0];
    const thumbnailUrl = `${baseUrl}/upload/w_400,h_225,c_fill,q_auto,f_auto/${publicId}.jpg`;

    return thumbnailUrl;
  };

  // Check if a URL is an image
  const isImageUrl = (url: string) => {
    if (!url) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  // Generate video preview frame URL
  const generateVideoPreviewUrl = (cloudinaryUrl: string, publicId: string) => {
    if (!cloudinaryUrl || !publicId) return null;

    // Extract the base URL and generate video preview frame
    const baseUrl = cloudinaryUrl.split("/upload/")[0];

    // Try different thumbnail generation strategies
    const strategies = [
      // Strategy 1: Standard thumbnail
      `${baseUrl}/upload/w_400,h_225,c_fill,q_auto,f_auto/${publicId}.jpg`,
      // Strategy 2: Video frame at 1 second
      `${baseUrl}/upload/w_400,h_225,c_fill,q_auto,f_auto,so_1/${publicId}.jpg`,
      // Strategy 3: Video frame at 0.5 seconds
      `${baseUrl}/upload/w_400,h_225,c_fill,q_auto,f_auto,so_0.5/${publicId}.jpg`,
      // Strategy 4: Simple thumbnail
      `${baseUrl}/upload/w_400,h_225/${publicId}.jpg`,
    ];

    return strategies[0]; // Return first strategy for now
  };

  const filteredAndSortedVideos = videos
    .filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "annotations":
          return b.annotationCount - a.annotationCount;
        default:
          return 0;
      }
    });

  const navigation = useNavigate();
  const handleVideoClick = (video: VideoWithAnnotationCount) => {
    console.log("Video clicked:", video);
    navigation(`/videos/${video._id}`);
  //  setSelectedVideo(video);
  };

  const handleBackToVideos = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-imdb-gold"></div>
      </div>
    );
  }

  // If a video is selected, show the video player with annotations
  if (selectedVideo) {
    return (
      <div className="p-8 space-y-8 bg-imdb-black min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToVideos}
            className="p-3 text-white/70 hover:text-white hover:bg-imdb-black-lighter/50 rounded-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">
            {selectedVideo.title}
          </h1>
          <div className="w-10 h-10"></div> {/* Placeholder for balance */}
        </div>

        {/* Video Player Section */}
        <div className="card-gradient max-w-3xl mx-auto p-6 space-y-6">
          {/* Video Container */}
          <div className="relative bg-imdb-black rounded-2xl overflow-hidden mb-4 shadow-2xl">
            <video className="w-full h-auto" controls preload="metadata">
              <source
                src={
                  selectedVideo.cloudinaryUrl ||
                  `http://localhost:5000/uploads/${selectedVideo.filename}`
                }
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {selectedVideo.title}
              </h2>
              <span className="text-sm text-imdb-gold bg-imdb-gold/10 px-3 py-1 rounded-lg">
                {selectedVideo.annotationCount} annotation
                {selectedVideo.annotationCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-white/60">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>
                  {selectedVideo.duration
                    ? formatDuration(selectedVideo.duration)
                    : "Unknown duration"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(selectedVideo.createdAt)}</span>
              </div>
            </div>

            {selectedVideo.description && (
              <p className="text-white/80">{selectedVideo.description}</p>
            )}
          </div>
        </div>

        {/* Annotations Section */}
        <div className="max-w-4xl mx-auto">
          <div className="card-gradient p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Annotations</h2>
              <button className="btn-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Annotation
              </button>
            </div>

            {selectedVideo.annotationCount === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-imdb-black-lighter mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No annotations yet
                </h3>
                <p className="text-white/60 mb-6">
                  Start creating annotations for this video
                </p>
                <button className="btn-primary">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add First Annotation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-white/60 text-center py-8">
                  This video has {selectedVideo.annotationCount} annotation
                  {selectedVideo.annotationCount !== 1 ? "s" : ""}. Click "Add
                  Annotation" to create new ones or view existing ones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main videos grid view
  return (
    <div className="p-8 space-y-8 bg-imdb-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Video Library</h1>
          <p className="text-white/60 text-lg">
            Browse and annotate your videos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-gradient p-6 text-center">
            <div className="text-3xl font-bold text-imdb-gold mb-2">
              {videos.length}
            </div>
            <div className="text-white/70">Total Videos</div>
          </div>
          <div className="card-gradient p-6 text-center">
            <div className="text-3xl font-bold text-imdb-gold mb-2">
              {videos.reduce((sum, video) => sum + video.annotationCount, 0)}
            </div>
            <div className="text-white/70">Total Annotations</div>
          </div>
          <div className="card-gradient p-6 text-center">
            <div className="text-3xl font-bold text-imdb-gold mb-2">
              {videos.filter((v) => v.annotationCount > 0).length}
            </div>
            <div className="text-white/70">Videos with Annotations</div>
          </div>
          <div className="card-gradient p-6 text-center">
            <div className="text-3xl font-bold text-imdb-gold mb-2">
              {videos.filter((v) => v.annotationCount === 0).length}
            </div>
            <div className="text-white/70">Videos to Annotate</div>
          </div>
        </div>

        {/* Debug Info - Remove this in production */}

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-10 pr-4 py-3 bg-imdb-black-lighter border border-imdb-black-lighter/50 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-imdb-gold/50 focus:border-imdb-gold"
            />
            <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-4">
            <label className="text-white/70 text-sm">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-imdb-black-lighter border border-imdb-black-lighter/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-imdb-gold/50"
            >
              <option value="date">Date Added</option>
              <option value="title">Title</option>
              <option value="annotations">Annotation Count</option>
            </select>
          </div>
        </div>

        {/* Videos Grid */}
        {filteredAndSortedVideos.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-imdb-black-lighter mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No videos found" : "No videos yet"}
            </h3>
            <p className="text-white/60">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Upload your first video to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredAndSortedVideos.map((video) => {
              console.log("Rendering video:", {
                id: video._id,
                title: video.title,
                cloudinaryUrl: video.cloudinaryUrl,
                filename: video.filename,
                hasThumbnail: !!video.cloudinaryUrl,
              });

              return (
                <div
                  key={video._id}
                  className="group cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Video Card */}
                  <div
                    className="card-gradient overflow-hidden hover:scale-105  transition-all duration-300 hover:shadow-2xl hover:shadow-imdb-gold/20 p-0"
                    style={{ background: "black",border:'none' }}
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video overflow-hidden">
                      {/* Try to show thumbnail first */}
                      {(() => {
                        // Generate thumbnail from Cloudinary video
                        const thumbnailUrl =
                          video.cloudinaryUrl && video.cloudinaryPublicId
                            ? generateVideoPreviewUrl(
                                video.cloudinaryUrl,
                                video.cloudinaryPublicId
                              )
                            : null;

                        if (thumbnailUrl) {
                          return (
                            <img
                              src={thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback if thumbnail fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                          );
                        }
                        return null;
                      })()}

                      {/* Fallback Thumbnail - Always present but hidden if image loads */}
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          video.cloudinaryUrl && video.cloudinaryPublicId
                            ? "hidden"
                            : ""
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-imdb-gold/30 to-imdb-gold-light/30 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-imdb-gold/50">
                            <PlayIcon className="w-10 h-10 text-imdb-gold" />
                          </div>
                          <div className="text-sm text-imdb-gold font-medium mb-1">
                            {video.title.length > 20
                              ? video.title.substring(0, 20) + "..."
                              : video.title}
                          </div>
                          <div className="text-xs text-imdb-gold/70 font-medium">
                            {video.filename
                              ? video.filename.split(".").pop()?.toUpperCase()
                              : "VIDEO"}
                          </div>
                          {/* Show video info */}
                          <div className="text-xs text-imdb-gold/50 mt-2">
                            {video.duration
                              ? `${formatDuration(video.duration)}`
                              : "Video"}
                          </div>
                        </div>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 bg-imdb-gold/90 rounded-full flex items-center justify-center shadow-2xl">
                          <PlayIcon className="w-8 h-8 text-imdb-black" />
                        </div>
                      </div>

                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}

                      {/* Annotation Count Badge */}
                      {video.annotationCount > 0 && (
                        <div className="absolute top-2 left-2 bg-imdb-gold text-imdb-black text-xs px-2 py-1 rounded font-semibold">
                          {video.annotationCount} annotation
                          {video.annotationCount !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-4 space-y-3">
                      {/* Title */}
                      <h3 className="text-white font-semibold line-clamp-2 group-hover:text-imdb-gold transition-colors duration-200">
                        {video.title}
                      </h3>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <EyeIcon className="w-4 h-4" />
                          <span>View</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationHistory;

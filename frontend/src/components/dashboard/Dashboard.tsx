import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { videoService } from "../../services/video";
import { annotationService } from "../../services/annotation";
import {
  VideoCameraIcon,
  DocumentTextIcon,
  ClockIcon,
  PlusIcon,
  PlayIcon,
  PencilIcon,
  SparklesIcon,
  ChartBarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import VideoUpload from "../video/VideoUpload";
import { Video, Annotation } from "../../types";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalAnnotations: 0,
    totalDuration: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [videosResponse, annotationsData] = await Promise.all([
        videoService.getVideos(),
        annotationService.getVideoAnnotations("all"),
      ]);

      setVideos(videosResponse.videos);

      const totalDuration = videosResponse.videos.reduce(
        (sum: number, video: Video) => sum + (video.duration || 0),
        0
      );
      const recentActivity = annotationsData.filter((a: Annotation) => {
        const createdAt = new Date(a.createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return createdAt > oneDayAgo;
      }).length;

      setStats({
        totalVideos: videosResponse.videos.length,
        totalAnnotations: annotationsData.length,
        totalDuration,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (videoId: string) => {
    setShowUploadModal(false);
    fetchDashboardData();
    navigate(`/videos/${videoId}`, { state: { from: '/dashboard' } });
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/videos/${videoId}`, { state: { from: '/dashboard' } });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-imdb-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-imdb-black min-h-screen">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome back,{" "}
          <span className="text-gradient">{user?.name || "User"}</span>! 👋
        </h1>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Ready to create amazing video annotations? Let's analyze some content
          and discover insights together.
        </p>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-imdb-gold/10 to-imdb-gold/5 border-imdb-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-imdb-gold">Total Videos</p>
              <p className="text-4xl font-bold text-white">
                {stats.totalVideos}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center shadow-lg shadow-glow">
              <VideoCameraIcon className="w-7 h-7 text-imdb-black" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-imdb-gold">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span>+12% from last week</span>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-imdb-gold/10 to-imdb-gold/5 border-imdb-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-imdb-gold">
                Total Annotations
              </p>
              <p className="text-4xl font-bold text-white">
                {stats.totalAnnotations}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center shadow-lg shadow-glow">
              <DocumentTextIcon className="w-7 h-7 text-imdb-black" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-imdb-gold">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span>+8% from last week</span>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-imdb-gold/10 to-imdb-gold/5 border-imdb-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-imdb-gold">
                Total Duration
              </p>
              <p className="text-4xl font-bold text-white">
                {formatDuration(stats.totalDuration)}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center shadow-lg shadow-glow">
              <ClockIcon className="w-7 h-7 text-imdb-black" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-imdb-gold">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span>+15% from last week</span>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-imdb-gold/10 to-imdb-gold/5 border-imdb-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-imdb-gold">
                Today's Activity
              </p>
              <p className="text-4xl font-bold text-white">
                {stats.recentActivity}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center shadow-lg shadow-glow">
              <FireIcon className="w-7 h-7 text-imdb-black" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-imdb-gold">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span>+5% from yesterday</span>
          </div>
        </div>
      </div> */}

      {/* Quick Actions & Recent Videos */}

      <VideoUpload
        onCancel={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* AI Insights Section */}
      <div className="card-gradient border-2 border-gradient">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-glow-lg">
            <SparklesIcon className="w-12 h-12 text-imdb-black" />
          </div>
          <h2 className="text-4xl font-bold text-gradient mb-4">
            AI-Powered Insights
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Let our advanced AI analyze your videos and discover behavioral
            patterns, engagement metrics, and actionable insights automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-2xl border border-imdb-black-lighter shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChartBarIcon className="w-8 h-8 text-imdb-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Behavioral Analysis
            </h3>
            <p className="text-white/70">
              Automatically detect and analyze human behaviors, gestures, and
              interactions
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-2xl border border-imdb-black-lighter shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ClockIcon className="w-8 h-8 text-imdb-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Timeline Insights
            </h3>
            <p className="text-white/70">
              Get detailed annotations with precise timestamps and confidence
              scores
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-2xl border border-imdb-black-lighter shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ArrowTrendingUpIcon className="w-8 h-8 text-imdb-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Performance Metrics
            </h3>
            <p className="text-white/70">
              Track engagement, attention spans, and interaction patterns over
              time
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {/* {showUploadModal && ( */}

      {/* )} */}
    </div>
  );
};

export default Dashboard;

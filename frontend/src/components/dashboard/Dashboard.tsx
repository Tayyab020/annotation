import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { videoService } from '../../services/video';
import { annotationService } from '../../services/annotation';
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
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import VideoUpload from '../video/VideoUpload';
import { Video, Annotation } from '../../types';

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
    recentActivity: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [videosResponse, annotationsData] = await Promise.all([
        videoService.getVideos(),
        annotationService.getVideoAnnotations('all')
      ]);

      setVideos(videosResponse.videos);
      
      const totalDuration = videosResponse.videos.reduce((sum: number, video: Video) => sum + (video.duration || 0), 0);
      const recentActivity = annotationsData.filter((a: Annotation) => {
        const createdAt = new Date(a.createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return createdAt > oneDayAgo;
      }).length;

      setStats({
        totalVideos: videosResponse.videos.length,
        totalAnnotations: annotationsData.length,
        totalDuration,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (videoId: string) => {
    setShowUploadModal(false);
    fetchDashboardData();
    navigate(`/videos/${videoId}`);
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/videos/${videoId}`);
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
          Welcome back, <span className="text-gradient">{user?.name || 'User'}</span>! 👋
        </h1>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Ready to create amazing video annotations? Let's analyze some content and discover insights together.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-imdb-gold/10 to-imdb-gold/5 border-imdb-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-imdb-gold">Total Videos</p>
              <p className="text-4xl font-bold text-white">{stats.totalVideos}</p>
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
              <p className="text-sm font-medium text-imdb-gold">Total Annotations</p>
              <p className="text-4xl font-bold text-white">{stats.totalAnnotations}</p>
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
              <p className="text-sm font-medium text-imdb-gold">Total Duration</p>
              <p className="text-4xl font-bold text-white">{formatDuration(stats.totalDuration)}</p>
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
              <p className="text-sm font-medium text-imdb-gold">Today's Activity</p>
              <p className="text-4xl font-bold text-white">{stats.recentActivity}</p>
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
      </div>

      {/* Quick Actions & Recent Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card-gradient">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <div className="w-12 h-12 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-imdb-black" />
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full btn-primary flex items-center justify-center py-4 text-lg"
            >
              <PlusIcon className="w-6 h-6 mr-3" />
              Upload New Video
            </button>
            
            <button className="w-full btn-secondary flex items-center justify-center py-4 text-lg">
              <SparklesIcon className="w-6 h-6 mr-3" />
              Generate AI Annotations
            </button>
            
            <button className="w-full btn-outline flex items-center justify-center py-4 text-lg">
              <ChartBarIcon className="w-6 h-6 mr-3" />
              View Analytics
            </button>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="card-gradient">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Videos</h2>
            <button 
              onClick={() => navigate('/videos')}
              className="btn-ghost"
            >
              View All
            </button>
          </div>
          
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <VideoCameraIcon className="w-20 h-20 text-imdb-black-lighter mx-auto mb-4" />
              <p className="text-white/60 mb-6 text-lg">No videos uploaded yet</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                Upload Your First Video
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.slice(0, 4).map((video) => (
                <div 
                  key={video._id} 
                  className="bg-gradient-to-r from-imdb-black-lighter to-imdb-black-light rounded-xl p-4 border border-imdb-black-lighter hover:border-imdb-gold/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => handleVideoClick(video._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                        <VideoCameraIcon className="w-6 h-6 text-imdb-black" />
                      </div>
                      <div>
                        <p className="font-semibold text-white truncate group-hover:text-imdb-gold transition-colors duration-300">
                          {video.title}
                        </p>
                        <p className="text-sm text-white/60">
                          {video.duration ? formatDuration(video.duration) : 'Unknown duration'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 text-white/60 hover:text-imdb-gold hover:bg-imdb-black-lighter/50 rounded-lg transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoClick(video._id);
                        }}
                      >
                        <PlayIcon className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 text-white/60 hover:text-imdb-gold hover:bg-imdb-black-lighter/50 rounded-lg transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoClick(video._id);
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {videos.length > 4 && (
                <button 
                  onClick={() => navigate('/videos')}
                  className="w-full btn-ghost py-4 text-imdb-gold hover:text-imdb-gold-light"
                >
                  View All Videos ({videos.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
            Let our advanced AI analyze your videos and discover behavioral patterns, 
            engagement metrics, and actionable insights automatically.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-2xl border border-imdb-black-lighter shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChartBarIcon className="w-8 h-8 text-imdb-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Behavioral Analysis</h3>
            <p className="text-white/70">
              Automatically detect and analyze human behaviors, gestures, and interactions
            </p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-2xl border border-imdb-black-lighter shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ClockIcon className="w-8 h-8 text-imdb-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Timeline Insights</h3>
            <p className="text-white/70">
              Get detailed annotations with precise timestamps and confidence scores
            </p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-2xl border border-imdb-black-lighter shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ArrowTrendingUpIcon className="w-8 h-8 text-imdb-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Performance Metrics</h3>
            <p className="text-white/70">
              Track engagement, attention spans, and interaction patterns over time
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Upload New Video</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-imdb-black-lighter/50 rounded-xl transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <VideoUpload
              onCancel={() => setShowUploadModal(false)}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
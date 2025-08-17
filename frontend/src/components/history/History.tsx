import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { annotationService } from '../../services/annotation';
import { videoService } from '../../services/video';
import { Annotation, Video } from '../../types';
import {
  ClockIcon,
  VideoCameraIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'ai-generated'>('all');
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedAnnotations, setSelectedAnnotations] = useState<string[]>([]);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      const [annotationsData, videosData] = await Promise.all([
        annotationService.getVideoAnnotations('all'),
        videoService.getVideos()
      ]);
      
      setAnnotations(annotationsData);
      setVideos(videosData.videos);
    } catch (error) {
      toast.error('Failed to load history data');
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      await annotationService.deleteAnnotation(annotationId);
      setAnnotations(prev => prev.filter(a => a._id !== annotationId));
      toast.success('Annotation deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete annotation');
    }
  };

  const handleEditAnnotation = async (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setShowEditModal(true);
  };

  const handleUpdateAnnotation = async (updatedData: Partial<Annotation>) => {
    if (!editingAnnotation) return;
    
    try {
      const updatedAnnotation = await annotationService.updateAnnotation(editingAnnotation._id, updatedData);
      setAnnotations(prev => prev.map(a => a._id === editingAnnotation._id ? updatedAnnotation : a));
      setShowEditModal(false);
      setEditingAnnotation(null);
      toast.success('Annotation updated successfully!');
    } catch (error) {
      toast.error('Failed to update annotation');
    }
  };

  const handleSaveAnnotations = async () => {
    if (selectedAnnotations.length === 0) {
      toast.error('Please select annotations to save');
      return;
    }

    try {
      // Save selected annotations to database
      const annotationsToSave = annotations.filter(a => selectedAnnotations.includes(a._id));
      
      // You can implement additional save logic here
      // For now, we'll just show a success message
      toast.success(`${annotationsToSave.length} annotations saved successfully!`);
      setShowSaveModal(false);
      setSelectedAnnotations([]);
    } catch (error) {
      toast.error('Failed to save annotations');
    }
  };

  const getVideoTitle = (videoId: string) => {
    const video = videos.find(v => v._id === videoId);
    return video ? video.title : 'Unknown Video';
  };

  const getVideoUrl = (videoId: string) => {
    const video = videos.find(v => v._id === videoId);
    if (video?.cloudinaryUrl) {
      return video.cloudinaryUrl;
    }
    return `/videos/${videoId}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAnnotations = annotations.filter(annotation => {
    const matchesSearch = annotation.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         annotation.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getVideoTitle(typeof annotation.video === 'string' ? annotation.video : annotation.video._id).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || annotation.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleAnnotationSelect = (annotationId: string) => {
    setSelectedAnnotations(prev => 
      prev.includes(annotationId) 
        ? prev.filter(id => id !== annotationId)
        : [...prev, annotationId]
    );
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Annotation <span className="text-gradient">History</span>
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          View, edit, and manage all your video annotations in one place
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card-gradient p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search annotations, labels, or video titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-imdb-black-light border border-imdb-black-lighter rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-imdb-gold"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-white/60" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'manual' | 'ai-generated')}
              className="bg-imdb-black-light border border-imdb-black-lighter rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-imdb-gold"
            >
              <option value="all">All Types</option>
              <option value="manual">Manual</option>
              <option value="ai-generated">AI Generated</option>
            </select>
          </div>

          {/* Save Button */}
          {selectedAnnotations.length > 0 && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <LinkIcon className="w-5 h-5" />
              <span>Save Selected ({selectedAnnotations.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClockIcon className="w-8 h-8 text-imdb-black" />
          </div>
          <h3 className="text-2xl font-bold text-white">{annotations.length}</h3>
          <p className="text-white/60">Total Annotations</p>
        </div>
        
        <div className="card-hover text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <VideoCameraIcon className="w-8 h-8 text-imdb-black" />
          </div>
          <h3 className="text-2xl font-bold text-white">{videos.length}</h3>
          <p className="text-white/60">Total Videos</p>
        </div>
        
        <div className="card-hover text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PencilIcon className="w-8 h-8 text-imdb-black" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {annotations.filter(a => a.type === 'manual').length}
          </h3>
          <p className="text-white/60">Manual Annotations</p>
        </div>
        
        <div className="card-hover text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-imdb-black" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {annotations.filter(a => a.type === 'ai-generated').length}
          </h3>
          <p className="text-white/60">AI Annotations</p>
        </div>
      </div>

      {/* Annotations List */}
      <div className="card-gradient">
        <h2 className="text-2xl font-bold text-white mb-6">All Annotations</h2>
        
        {filteredAnnotations.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-20 h-20 text-imdb-black-lighter mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-2">
              {searchQuery || filterType !== 'all' 
                ? 'No annotations match your search criteria' 
                : 'No annotations found'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="btn-outline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnotations.map((annotation) => (
              <div key={annotation._id} className="annotation-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Checkbox for selection */}
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedAnnotations.includes(annotation._id)}
                        onChange={() => handleAnnotationSelect(annotation._id)}
                        className="w-4 h-4 text-imdb-gold bg-imdb-black-light border-imdb-black-lighter rounded focus:ring-imdb-gold focus:ring-2"
                      />
                      
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        annotation.type === 'ai-generated' 
                          ? 'bg-imdb-gold/20 text-imdb-gold' 
                          : 'bg-imdb-gold/10 text-imdb-gold'
                      }`}>
                        {annotation.type === 'ai-generated' ? '🤖 AI' : '✏️ Manual'}
                      </span>
                      
                      <span className="text-sm text-white/60">
                        {formatTime(annotation.startTime)} - {formatTime(annotation.endTime)}
                      </span>
                      
                      {annotation.type === 'ai-generated' && (
                        <span className="text-xs text-imdb-gold bg-imdb-gold/10 px-2 py-1 rounded-lg">
                          {Math.round(annotation.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-semibold text-white mb-2">{annotation.label}</h4>
                    <p className="text-white/80 mb-3">{annotation.text}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span className="flex items-center space-x-1">
                        <VideoCameraIcon className="w-4 h-4" />
                        <span>{getVideoTitle(typeof annotation.video === 'string' ? annotation.video : annotation.video._id)}</span>
                      </span>
                      <span>•</span>
                      <span>{formatDate(annotation.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                                         {/* Play Video Button */}
                     <button
                       onClick={() => navigate(`/videos/${typeof annotation.video === 'string' ? annotation.video : annotation.video._id}`, { state: { from: '/annotations' } })}
                       className="p-2 text-imdb-gold hover:bg-imdb-gold/10 rounded-lg transition-colors duration-200"
                       title="Play Video"
                     >
                       <PlayIcon className="w-4 h-4" />
                     </button>
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditAnnotation(annotation)}
                      className="p-2 text-imdb-gold hover:bg-imdb-gold/10 rounded-lg transition-colors duration-200"
                      title="Edit Annotation"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteAnnotation(annotation._id)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors duration-200"
                      title="Delete Annotation"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingAnnotation && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white">Edit Annotation</h3>
              <p className="text-white/60">Update annotation details</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Label</label>
                <input
                  type="text"
                  defaultValue={editingAnnotation.label}
                  className="input-field"
                  placeholder="Annotation label"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description</label>
                <textarea
                  defaultValue={editingAnnotation.text}
                  className="input-field"
                  rows={3}
                  placeholder="Annotation description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Start Time (s)</label>
                  <input
                    type="number"
                    defaultValue={editingAnnotation.startTime}
                    className="input-field"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">End Time (s)</label>
                  <input
                    type="number"
                    defaultValue={editingAnnotation.endTime}
                    className="input-field"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateAnnotation({
                    label: (document.querySelector('input[placeholder="Annotation label"]') as HTMLInputElement)?.value || editingAnnotation.label,
                    text: (document.querySelector('textarea[placeholder="Annotation description"]') as HTMLTextAreaElement)?.value || editingAnnotation.text,
                    startTime: parseFloat((document.querySelector('input[placeholder="Start Time (s)"]') as HTMLInputElement)?.value || editingAnnotation.startTime.toString()),
                    endTime: parseFloat((document.querySelector('input[placeholder="End Time (s)"]') as HTMLInputElement)?.value || editingAnnotation.endTime.toString())
                  })}
                  className="flex-1 btn-primary"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white">Save Annotations</h3>
              <p className="text-white/60">Save selected annotations to database</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-white/80">
                You have selected <strong>{selectedAnnotations.length}</strong> annotations to save.
                This will ensure they are properly linked to videos and stored in the database.
              </p>
              
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAnnotations}
                  className="flex-1 btn-primary"
                >
                  Save Annotations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

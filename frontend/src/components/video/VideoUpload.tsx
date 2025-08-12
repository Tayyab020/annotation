import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, FilmIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { videoService } from '../../services/video';
import type { LoadingState } from '../../types';
import toast from 'react-hot-toast';

interface VideoUploadProps {
  onUploadComplete?: (videoId: string) => void;
  onCancel?: () => void;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  videoId?: string;
  error?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadComplete, onCancel }) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const videoFiles = acceptedFiles.filter(file => 
      file.type.startsWith('video/') && file.size <= 500 * 1024 * 1024 // 500MB limit
    );

    if (videoFiles.length !== acceptedFiles.length) {
      toast.error('Some files were rejected. Only video files under 500MB are allowed.');
    }

    if (videoFiles.length === 0) return;

    // Initialize upload progress for each file
    const newUploads: UploadProgress[] = videoFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploads(prev => [...prev, ...newUploads]);
    setLoadingState({ isLoading: true });

    // Upload files one by one
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      const uploadIndex = uploads.length + i;

      try {
        const result = await videoService.uploadVideo(
          {
            file,
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            description: `Uploaded video: ${file.name}`,
          },
          (progress) => {
            setUploads(prev => prev.map((upload, idx) => 
              idx === uploadIndex ? { ...upload, progress } : upload
            ));
          }
        );

        // Mark as completed
        setUploads(prev => prev.map((upload, idx) => 
          idx === uploadIndex 
            ? { ...upload, status: 'completed', progress: 100, videoId: result._id }
            : upload
        ));

        toast.success(`${file.name} uploaded successfully!`);
        
        if (onUploadComplete) {
          onUploadComplete(result._id);
        }

      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Upload failed';
        
        setUploads(prev => prev.map((upload, idx) => 
          idx === uploadIndex 
            ? { ...upload, status: 'error', error: errorMessage }
            : upload
        ));

        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    }

    setLoadingState({ isLoading: false });
  }, [uploads.length, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: true,
  });

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const completedUploads = uploads.filter(upload => upload.status === 'completed');
  const activeUploads = uploads.filter(upload => upload.status === 'uploading');

  return (
    <div className="bg-imdb-black-light rounded-2xl shadow-lg border border-imdb-black-lighter">
      {/* Header */}
      <div className="px-6 py-4 border-b border-imdb-black-lighter">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CloudArrowUpIcon className="h-8 w-8 text-imdb-gold" />
            <div>
              <h2 className="text-xl font-semibold text-white">Upload Videos</h2>
              <p className="text-sm text-white/60">
                Drag and drop video files or click to browse
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
            ${isDragActive 
              ? 'border-imdb-gold bg-imdb-gold/10' 
              : 'border-imdb-black-lighter hover:border-imdb-gold hover:bg-imdb-black-lighter/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-16 w-16 text-white/40 mb-4" />
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-imdb-gold">Drop the videos here...</p>
              <p className="text-sm text-imdb-gold/80">Release to upload</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-white mb-2">
                Drop video files here, or click to select
              </p>
              <p className="text-sm text-white/60 mb-4">
                Supports MP4, AVI, MOV, WMV, FLV, WebM, MKV (max 500MB each)
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-imdb-gold text-imdb-black rounded-xl hover:bg-imdb-gold-light transition-colors font-semibold shadow-lg hover:shadow-glow">
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Choose Files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Upload Progress</h3>
            {completedUploads.length > 0 && (
              <button
                onClick={clearCompleted}
                className="text-sm text-imdb-gold hover:text-imdb-gold-light"
              >
                Clear Completed
              </button>
            )}
          </div>

          <div className="space-y-4">
            {uploads.map((upload, index) => (
              <div key={index} className="bg-imdb-black-lighter rounded-xl p-4 border border-imdb-black-lighter hover:border-imdb-gold/50 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <FilmIcon className="h-10 w-10 text-white/40 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white truncate">
                          {upload.file.name}
                        </p>
                        <button
                          onClick={() => removeUpload(index)}
                          className="ml-2 p-1 text-white/40 hover:text-white"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center text-xs text-white/60 space-x-4 mb-2">
                        <span>{formatFileSize(upload.file.size)}</span>
                        <span>{upload.file.type}</span>
                      </div>

                      {/* Progress Bar */}
                      {upload.status === 'uploading' && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                            <span>Uploading...</span>
                            <span>{upload.progress}%</span>
                          </div>
                          <div className="w-full bg-imdb-black-lighter rounded-full h-3">
                            <div
                              className="bg-imdb-gold h-3 rounded-full transition-all duration-300"
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Status */}
                      {upload.status === 'completed' && (
                        <div className="flex items-center text-success text-sm">
                          <CheckCircleIcon className="h-4 h-4 mr-1" />
                          Upload completed successfully
                        </div>
                      )}

                      {upload.status === 'error' && (
                        <div className="text-error text-sm">
                          <p>Upload failed: {upload.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {(activeUploads.length > 0 || completedUploads.length > 0) && (
            <div className="mt-4 p-4 bg-imdb-black-lighter rounded-xl border border-imdb-black-lighter">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  {activeUploads.length > 0 && (
                    <span className="text-imdb-gold">
                      {activeUploads.length} uploading...
                    </span>
                  )}
                  {completedUploads.length > 0 && (
                    <span className="text-success">
                      {completedUploads.length} completed
                    </span>
                  )}
                </div>
                <div className="text-white/60">
                  Total: {uploads.length} file{uploads.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
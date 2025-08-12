import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'lg', 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
        </div>
        
        {/* Message */}
        {message && (
          <p className="text-gray-600 text-sm font-medium">{message}</p>
        )}
        
        {/* Nova logo/branding */}
        <div className="mt-6">
          <div className="mx-auto h-8 w-8 flex items-center justify-center rounded-full bg-primary-100">
            <span className="text-lg font-bold text-primary-600">N</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Nova</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  className = ''
}) => {
  // Determine spinner size
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  // Determine text size
  const textClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // Create the spinner component
  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
      {text && (
        <p className={`mt-2 text-white ${textClasses[size]}`}>{text}</p>
      )}
    </div>
  );

  // If fullScreen is true, center the spinner in the viewport
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;


import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = ''
}) => {
  // Define styles for different alert types
  const styles = {
    info: {
      container: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
      icon: <Info className="w-5 h-5 text-blue-400" />
    },
    success: {
      container: 'bg-green-500/20 border-green-500/30 text-green-300',
      icon: <CheckCircle className="w-5 h-5 text-green-400" />
    },
    warning: {
      container: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
      icon: <AlertCircle className="w-5 h-5 text-yellow-400" />
    },
    error: {
      container: 'bg-red-500/20 border-red-500/30 text-red-300',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />
    }
  };

  const { container, icon } = styles[type] || styles.info;

  return (
    <div className={`${container} border rounded-lg px-4 py-3 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {icon}
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          {message && (
            <div className="text-sm opacity-90">{message}</div>
          )}
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="flex-shrink-0 ml-3 -mr-1 -mt-1 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;


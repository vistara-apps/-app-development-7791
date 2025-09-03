import React, { Component } from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-red-300 mb-2">Something went wrong</h2>
              <p className="text-red-200 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {this.props.showReset && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>
          {this.props.showDetails && this.state.error && (
            <div className="mt-4 p-3 bg-red-500/5 rounded-lg overflow-auto max-h-48">
              <pre className="text-xs text-red-200 whitespace-pre-wrap">
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


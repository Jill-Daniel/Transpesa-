import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-mpesa-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please refresh the page and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-mpesa-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-mpesa-700 transition-colors"
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">Error details</summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

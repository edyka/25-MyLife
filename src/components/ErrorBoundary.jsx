import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { getTheme } from '../utils/themeConfig';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: true,
      },
    });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleResetApp = () => {
    if (confirm('This will clear all your data and restart the app. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Get current theme state from props or defaults
      const { darkMode = false, themePreset = 'emerald' } = this.props;
      const theme = getTheme(themePreset);

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          darkMode
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : `bg-gradient-to-br ${theme.onboardingLight.replace('bg-gradient-to-r', '').trim()}`
        }`}>
          <div className={`max-w-lg w-full p-8 rounded-3xl shadow-2xl ${
            darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${
                darkMode ? `bg-${themePreset}-500/20` : `bg-${themePreset}-100`
              }`}>
                <AlertTriangle className={`w-8 h-8 ${
                  darkMode ? theme.accentDark.replace('text-', 'text-') : theme.accent.replace('text-', 'text-')
                }`} />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className={`text-2xl font-bold mb-3 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Something went wrong
              </h1>
              <p className={`text-sm leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {this.state.error ? (
                  <>
                    {(() => {
                      try {
                        const { getUserFriendlyError } = require('../utils/errorMessages');
                        return getUserFriendlyError(this.state.error);
                      } catch {
                        return 'We encountered an unexpected error. Don\'t worry - your data is safe. Try refreshing the page or contact support if the problem persists.';
                      }
                    })()}
                  </>
                ) : (
                  'We encountered an unexpected error. Don\'t worry - your data is safe. Try refreshing the page or contact support if the problem persists.'
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${theme.buttonPrimary} text-white hover:scale-[1.02] active:scale-[0.98]`}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${theme.buttonSecondary} hover:scale-[1.02] active:scale-[0.98]`}
              >
                <Home className="w-4 h-4" />
                Refresh Page
              </button>

              {this.state.retryCount >= 3 && (
                <button
                  onClick={this.handleResetApp}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${theme.error.replace('from-', 'bg-').replace(' to-red-600', '')} hover:opacity-80 text-white hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <Bug className="w-4 h-4" />
                  Reset App Data
                </button>
              )}
            </div>

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={`mt-6 p-4 rounded-lg ${
                darkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}>
                <summary className={`cursor-pointer text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Debug Information
                </summary>
                <pre className={`mt-3 text-xs overflow-auto ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Retry Count */}
            {this.state.retryCount > 0 && (
              <div className={`mt-4 text-center text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Retry attempts: {this.state.retryCount}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
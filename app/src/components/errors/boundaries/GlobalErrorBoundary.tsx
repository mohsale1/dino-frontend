import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Collapse,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  errorId: string;
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      errorId: this.state.errorId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount,
    };
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Report to error tracking service (if available)
    this.reportError(errorData);
  }


  private reportError = async (errorData: any) => {
    try {
      // Here you would integrate with your error reporting service
      // For example: Sentry, LogRocket, Bugsnag, etc.
      
      // You could also send to your own error reporting endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData),
      // });
    } catch (reportingError) {
      // Error reporting failed, log to console in development
      if ((window as any).__DEV__) {
        console.error('Failed to report error:', reportingError);
      }
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
      });
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    // Chunk loading errors (common after deployments)
    if (message.includes('loading chunk') || message.includes('chunkloaderror')) {
      return 'The app has been updated. Please refresh the page to get the latest version.';
    }
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return 'There seems to be a connection problem. Please check your internet connection and try again.';
    }
    
    // Script loading errors
    if (message.includes('script') || message.includes('loading')) {
      return 'Failed to load some app resources. Please refresh the page to try again.';
    }
    
    // Memory errors
    if (message.includes('memory') || message.includes('out of memory')) {
      return 'The app is using too much memory. Please close some browser tabs and refresh the page.';
    }
    
    // Generic error
    return 'Something unexpected happened. Our team has been notified and is working on a fix.';
  };

  private getSuggestions = (error: Error): string[] => {
    const message = error.message.toLowerCase();
    
    if (message.includes('loading chunk') || message.includes('chunkloaderror')) {
      return [
        'Refresh the page to get the latest version',
        'Clear your browser cache if the problem persists',
        'Try using an incognito/private browsing window',
      ];
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable any VPN or proxy if you\'re using one',
        'Contact support if the problem continues',
      ];
    }
    
    return [
      'Try refreshing the page',
      'Clear your browser cache and cookies',
      'Try using a different browser',
      'Contact support if the issue persists',
    ];
  };

  override render() {
    const { hasError, error, errorInfo, showDetails } = this.state;

    if (hasError && error) {
      const userMessage = this.getErrorMessage(error);
      const suggestions = this.getSuggestions(error);
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <ErrorBoundaryUI
          error={error}
          errorInfo={errorInfo}
          errorId={this.state.errorId}
          userMessage={userMessage}
          suggestions={suggestions}
          showDetails={showDetails}
          canRetry={canRetry}
          retryCount={this.retryCount}
          maxRetries={this.maxRetries}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onToggleDetails={this.toggleDetails}
        />
      );
    }

    return this.props.children;
  }

}

// Separate UI component for better testing and reusability
interface ErrorBoundaryUIProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorId: string;
  userMessage: string;
  suggestions: string[];
  showDetails: boolean;
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onGoHome: () => void;
  onToggleDetails: () => void;
}

const ErrorBoundaryUI: React.FC<ErrorBoundaryUIProps> = ({
  error,
  errorInfo,
  errorId,
  userMessage,
  suggestions,
  showDetails,
  canRetry,
  retryCount,
  maxRetries,
  onRetry,
  onGoHome,
  onToggleDetails,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Center card */}
      <Box
        sx={{
          maxWidth: 520,
          width: '100%',
          bgcolor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Top accent strip */}
        <Box sx={{ height: '4px', bgcolor: '#ef4444' }} />

        {/* Card body */}
        <Box sx={{ px: 3.5, pt: 3, pb: 3 }}>
          {/* Icon box */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <ErrorOutline sx={{ fontSize: 26, color: '#ef4444' }} />
          </Box>

          {/* Title */}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#1C1C1E',
              textAlign: 'center',
            }}
          >
            Something went wrong
          </Typography>

          {/* User message */}
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: '#64748b',
              lineHeight: 1.7,
              textAlign: 'center',
              mt: 1,
              mb: 2.5,
              maxWidth: 420,
              mx: 'auto',
            }}
          >
            {userMessage}
          </Typography>

          {/* Suggestions box */}
          <Box
            sx={{
              bgcolor: '#f8fafc',
              border: '1px solid #e0e0e0',
              borderRadius: 1.5,
              p: 2,
              mb: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#94a3b8',
                mb: 1,
              }}
            >
              What you can try
            </Typography>
            <Stack spacing={0.75}>
              {suggestions.map((suggestion, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#1976D2',
                      flexShrink: 0,
                      mt: 0.6,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.83rem',
                      color: '#475569',
                      lineHeight: 1.6,
                    }}
                  >
                    {suggestion}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Action buttons */}
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            gap={1.25}
            justifyContent="center"
            sx={{ mb: 2.5 }}
          >
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={onGoHome}
              sx={{
                borderColor: '#e0e0e0',
                color: '#64748b',
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 2.5,
                py: 0.875,
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#1976D2',
                  color: '#1976D2',
                  boxShadow: 'none',
                },
              }}
            >
              Go Home
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onRetry}
              sx={{
                bgcolor: '#1976D2',
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                px: 2.5,
                py: 0.875,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#1565C0',
                  boxShadow: 'none',
                },
              }}
            >
              {canRetry ? `Try Again (${maxRetries - retryCount} left)` : 'Reload Page'}
            </Button>
          </Stack>

          {/* Technical details toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="text"
              onClick={onToggleDetails}
              startIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
              sx={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: '#64748b',
                },
              }}
            >
              {showDetails ? 'Hide technical details' : 'Show technical details'}
            </Button>
          </Box>

          {/* Collapse panel */}
          <Collapse in={showDetails}>
            <Box
              sx={{
                mt: 1.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e0e0e0',
                borderRadius: 1.5,
                p: 2,
              }}
            >
              {/* Error ID row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Error ID:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    color: '#475569',
                    fontFamily: 'monospace',
                  }}
                >
                  {errorId}
                </Typography>
              </Box>

              {/* Error name + message */}
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#374151',
                  mt: 1,
                }}
              >
                <strong>{error.name}:</strong> {error.message}
              </Typography>

              {/* Stack trace */}
              {error.stack && (
                <Box
                  component="pre"
                  sx={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    bgcolor: '#f1f5f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 1.5,
                    mt: 1,
                    overflow: 'auto',
                    maxHeight: 160,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: '#475569',
                    m: 0,
                  }}
                >
                  {error.stack}
                </Box>
              )}
            </Box>
          </Collapse>

          {/* Footer */}
          <Box
            sx={{
              borderTop: '1px solid #f1f5f9',
              pt: 2,
              mt: 0.5,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              If this problem continues, please contact our support team with the Error ID above.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GlobalErrorBoundary;

import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Block as BlockIcon,
  CloudOff as CloudOffIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export type ErrorType = 
  | 'not-found'
  | 'forbidden'
  | 'unauthorized'
  | 'access-denied'
  | 'server-error'
  | 'network-error'
  | 'validation-error'
  | 'venue-error'
  | 'workspace-error'
  | 'generic';

interface GenericErrorPageProps {
  type?: ErrorType;
  errorCode?: string | number;
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
  children?: React.ReactNode;
}

const GenericErrorPage: React.FC<GenericErrorPageProps> = ({
  type = 'generic',
  errorCode,
  title,
  message,
  onRetry,
  showRetry = true,
  showGoBack = true,
  showGoHome = true,
  children,
}) => {
  const navigate = useNavigate();

  const getErrorConfig = () => {
    switch (type) {
      case 'not-found':
        return {
          icon: <ErrorIcon sx={{ fontSize: 80 }} />,
          code: '404',
          title: 'Page Not Found',
          message: 'The page you are looking for does not exist.',
          color: 'warning.main',
        };
      case 'forbidden':
        return {
          icon: <BlockIcon sx={{ fontSize: 80 }} />,
          code: '403',
          title: 'Access Forbidden',
          message: 'You do not have permission to access this resource.',
          color: 'error.main',
        };
      case 'unauthorized':
        return {
          icon: <WarningIcon sx={{ fontSize: 80 }} />,
          code: '401',
          title: 'Unauthorized',
          message: 'Please log in to access this page.',
          color: 'warning.main',
        };
      case 'access-denied':
        return {
          icon: <BlockIcon sx={{ fontSize: 80 }} />,
          code: '403',
          title: 'Access Denied',
          message: 'You do not have permission to access this page.',
          color: 'error.main',
        };
      case 'server-error':
        return {
          icon: <BugReportIcon sx={{ fontSize: 80 }} />,
          code: '500',
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          color: 'error.main',
        };
      case 'network-error':
        return {
          icon: <CloudOffIcon sx={{ fontSize: 80 }} />,
          code: 'NET',
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          color: 'error.main',
        };
      case 'venue-error':
        return {
          icon: <InfoIcon sx={{ fontSize: 80 }} />,
          code: 'VENUE',
          title: 'No Venue Assigned',
          message: 'You need to be assigned to a venue to access this page.',
          color: 'info.main',
        };
      default:
        return {
          icon: <ErrorIcon sx={{ fontSize: 80 }} />,
          code: 'ERROR',
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred.',
          color: 'error.main',
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayCode = errorCode || config.code;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            width: '100%',
            maxWidth: 600,
          }}
        >
          <Box sx={{ color: config.color, mb: 3 }}>
            {config.icon}
          </Box>

          {displayCode && (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Error {displayCode}
            </Typography>
          )}

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            {displayTitle}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {displayMessage}
          </Typography>

          {children}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
            {showRetry && (
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
              >
                Try Again
              </Button>
            )}

            {showGoBack && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            )}

            {showGoHome && (
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
              >
                Go Home
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default GenericErrorPage;
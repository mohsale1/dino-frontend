import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  SearchOff as SearchOffIcon,
  LockOutlined as LockOutlinedIcon,
  VpnKeyOutlined as VpnKeyOutlinedIcon,
  ErrorOutline as ErrorOutlineIcon,
  WifiOff as WifiOffIcon,
  StorefrontOutlined as StorefrontOutlinedIcon,
  BusinessOutlined as BusinessOutlinedIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
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

interface ErrorTypeConfig {
  icon: React.ReactElement;
  code: string;
  title: string;
  message: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

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

const ICON_SX = { fontSize: 26 };

const ERROR_CONFIGS: Record<string, ErrorTypeConfig> = {
  'not-found': {
    icon: <SearchOffIcon sx={{ ...ICON_SX, color: '#f59e0b' }} />,
    code: '404',
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist or has been moved.',
    accentColor: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.3)',
  },
  'forbidden': {
    icon: <LockOutlinedIcon sx={{ ...ICON_SX, color: '#ef4444' }} />,
    code: '403',
    title: 'Access Forbidden',
    message: 'You do not have permission to access this resource.',
    accentColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.3)',
  },
  'access-denied': {
    icon: <LockOutlinedIcon sx={{ ...ICON_SX, color: '#ef4444' }} />,
    code: '403',
    title: 'Access Denied',
    message: 'You do not have permission to access this page.',
    accentColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.3)',
  },
  'unauthorized': {
    icon: <VpnKeyOutlinedIcon sx={{ ...ICON_SX, color: '#f59e0b' }} />,
    code: '401',
    title: 'Unauthorized',
    message: 'Please log in to access this page.',
    accentColor: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.3)',
  },
  'server-error': {
    icon: <ErrorOutlineIcon sx={{ ...ICON_SX, color: '#ef4444' }} />,
    code: '500',
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    accentColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.3)',
  },
  'network-error': {
    icon: <WifiOffIcon sx={{ ...ICON_SX, color: '#64748b' }} />,
    code: 'NET',
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    accentColor: '#64748b',
    accentBg: 'rgba(100,116,139,0.08)',
    accentBorder: 'rgba(100,116,139,0.3)',
  },
  'venue-error': {
    icon: <StorefrontOutlinedIcon sx={{ ...ICON_SX, color: '#1976D2' }} />,
    code: 'VENUE',
    title: 'No Venue Assigned',
    message: 'You need to be assigned to a venue to access this page.',
    accentColor: '#1976D2',
    accentBg: 'rgba(25,118,210,0.08)',
    accentBorder: 'rgba(25,118,210,0.3)',
  },
  'workspace-error': {
    icon: <BusinessOutlinedIcon sx={{ ...ICON_SX, color: '#1976D2' }} />,
    code: 'WS',
    title: 'Workspace Error',
    message: 'There was a problem loading your workspace. Please try again.',
    accentColor: '#1976D2',
    accentBg: 'rgba(25,118,210,0.08)',
    accentBorder: 'rgba(25,118,210,0.3)',
  },
  'generic': {
    icon: <ErrorOutlineIcon sx={{ ...ICON_SX, color: '#ef4444' }} />,
    code: 'ERR',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    accentColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.3)',
  },
};

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

  const config: ErrorTypeConfig = ERROR_CONFIGS[type] ?? ERROR_CONFIGS['generic'];

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayCode = errorCode !== undefined ? String(errorCode) : config.code;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const hasActions = showRetry || showGoBack || showGoHome;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          bgcolor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${config.accentColor}, ${config.accentColor}cc)`,
          }}
        />

        <Box
          sx={{
            px: 4,
            pt: 4,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: config.accentBg,
              border: `1px solid ${config.accentBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {config.icon}
          </Box>

          <Box
            component="span"
            sx={{
              mt: 2.5,
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: '#f1f5f9',
              color: '#475569',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '999px',
              px: 1.25,
              py: 0.35,
              border: '1px solid #e0e0e0',
              lineHeight: 1.5,
            }}
          >
            {displayCode}
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#1C1C1E',
              mt: 1.5,
              lineHeight: 1.3,
            }}
          >
            {displayTitle}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.875rem',
              color: '#64748b',
              lineHeight: 1.7,
              mt: 1,
              maxWidth: 380,
              mx: 'auto',
            }}
          >
            {displayMessage}
          </Typography>

          {children && (
            <Box sx={{ mt: 2, width: '100%' }}>
              {children}
            </Box>
          )}

          {hasActions && (
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                gap: 1.25,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {showRetry && (
                <Button
                  onClick={handleRetry}
                  startIcon={<RefreshIcon sx={{ fontSize: '1rem !important' }} />}
                  disableElevation
                  sx={{
                    bgcolor: '#1976D2',
                    color: '#ffffff',
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
                  Try Again
                </Button>
              )}

              {showGoBack && (
                <Button
                  onClick={() => navigate(-1)}
                  startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
                  variant="outlined"
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
                      bgcolor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Go Back
                </Button>
              )}

              {showGoHome && (
                <Button
                  onClick={() => navigate('/')}
                  startIcon={<HomeIcon sx={{ fontSize: '1rem !important' }} />}
                  variant="outlined"
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
                      bgcolor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Go Home
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default GenericErrorPage;
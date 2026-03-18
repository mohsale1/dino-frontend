/**
 * Generic Error Page Component
 * 
 * A unified, modern error page component with enhanced UI/UX
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Chip,
  alpha,
  keyframes,
} from '@mui/material';
import {
  ErrorOutline,
  Home,
  Refresh,
  ArrowBack,
  BugReport,
  WifiOff,
  Block,
  RestaurantMenu,
  Schedule,
  Warning,
  Info,
  Security,
  StorefrontOutlined,
  SignalWifiStatusbarConnectedNoInternet4,
  SentimentVeryDissatisfied,
  CloudOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export type ErrorType = 
  | '404' 
  | '500' 
  | 'network' 
  | 'venue-not-accepting' 
  | 'venue-closed'
  | 'no-venue'
  | 'no-user'
  | 'access-denied'
  | 'generic';

interface GenericErrorPageProps {
  type?: ErrorType;
  errorCode?: string | number;
  title?: string;
  message?: string;
  context?: {
    venueName?: string;
    venueStatus?: string;
    userName?: string;
    [key: string]: any;
  };
  onRetry?: () => void | Promise<void>;
  showRetry?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
  customActions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const GenericErrorPage: React.FC<GenericErrorPageProps> = ({
  type = 'generic',
  errorCode,
  title,
  message,
  context = {},
  onRetry,
  showRetry = true,
  showGoBack = true,
  showGoHome = true,
  customActions,
  children,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [retrying, setRetrying] = React.useState(false);

  // Get error configuration based on type
  const getErrorConfig = () => {
    switch (type) {
      case '404':
        return {
          icon: <Block sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: '404',
          title: 'Page Not Found',
          message: 'The page you\'re looking for doesn\'t exist or has been moved.',
          color: theme.palette.primary.main,
          bgColor: alpha(theme.palette.primary.main, 0.1),
          illustration: '🔍',
          suggestions: [
            'Check the URL for typos',
            'Go back to the previous page',
            'Visit our homepage to find what you need'
          ],
        };
      
      case '500':
        return {
          icon: <BugReport sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: '500',
          title: 'Server Error',
          message: 'Something went wrong on our end. Our team has been notified and is working to fix it.',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          illustration: '🔧',
          suggestions: [
            'Wait a moment and try again',
            'Check if the issue persists after refreshing',
            'Contact our support team if the problem continues'
          ],
        };
      
      case 'network':
        return {
          icon: <WifiOff sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: undefined,
          title: 'Connection Problem',
          message: 'Unable to connect to our servers. Please check your internet connection and try again.',
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          illustration: '📡',
          suggestions: [
            'Check your internet connection',
            'Try switching between WiFi and mobile data',
            'Restart your router or modem',
            'Check if other websites are working'
          ],
        };
      
      case 'venue-not-accepting':
        return {
          icon: <RestaurantMenu sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: undefined,
          title: `${context.venueName || 'This venue'} is Not Accepting Orders`,
          message: 'This venue is currently not accepting orders. Please try again later.',
          color: theme.palette.warning.main,
          bgColor: '#FFFFFF',
          illustration: '🦕',
          suggestions: [
            'Wait a few minutes and try again',
            'Check the venue\'s operating hours',
            'Contact the venue directly for more information'
          ],
          showStatus: true,
          isVenueError: true,
        };
      
      case 'venue-closed':
        return {
          icon: <Schedule sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: undefined,
          title: `${context.venueName || 'Venue'} is Currently Closed`,
          message: 'This venue is not serving at the moment. Please check back during operating hours.',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          illustration: '🔒',
          suggestions: [
            'Check the venue\'s operating hours',
            'Try again during business hours',
            'Contact the venue for more information'
          ],
          showStatus: true,
        };
      
      case 'no-venue':
        return {
          icon: <StorefrontOutlined sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: undefined,
          title: 'No Venue Found',
          message: 'We couldn\'t find the venue you\'re looking for. It may have been removed or the link is incorrect.',
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          illustration: '🏪',
          suggestions: [
            'Check if the QR code is correct',
            'Ask the staff for assistance',
            'Try scanning the QR code again'
          ],
        };
      
      case 'no-user':
        return {
          icon: <Security sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: undefined,
          title: 'User Not Found',
          message: 'The user account you\'re looking for doesn\'t exist or has been removed.',
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          illustration: '👤',
          suggestions: [
            'Check if you\'re logged in',
            'Verify the user information',
            'Contact support for assistance'
          ],
        };
      
      case 'access-denied':
        return {
          icon: <Security sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: '403',
          title: 'Access Denied',
          message: 'You don\'t have permission to access this page or your session has expired.',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          illustration: '🚫',
          suggestions: [
            'Try logging in again',
            'Contact your administrator for access',
            'Check if you have the required permissions'
          ],
        };
      
      default: // 'generic'
        return {
          icon: <ErrorOutline sx={{ fontSize: { xs: 64, md: 80 } }} />,
          code: undefined,
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred. Please try again after some time.',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          illustration: '⚠️',
          suggestions: [
            'Refresh the page and try again',
            'Check your internet connection',
            'Contact support if the problem persists'
          ],
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayCode = errorCode || config.code;
  const isVenueError = (config as any).isVenueError || false;

  const handleRetry = async () => {
    if (onRetry) {
      setRetrying(true);
      try {
        await onRetry();
      } finally {
        setRetrying(false);
      }
    } else {
      setRetrying(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'maintenance':
        return 'warning';
      case 'closed':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'info';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'maintenance':
        return 'Under Maintenance';
      case 'closed':
        return 'Closed';
      case 'inactive':
        return 'Temporarily Unavailable';
      default:
        return 'Not Available';
    }
  };

  return (
    <Box
      className={className}
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isVenueError ? '#FFFFFF' : `linear-gradient(135deg, ${alpha(config.bgColor, 0.3)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 3 },
      }}
    >
      {/* Animated Background Elements - Hidden for venue errors */}
      {!isVenueError && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: { xs: 80, md: 120 },
              height: { xs: 80, md: 120 },
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(config.color, 0.2)} 0%, transparent 70%)`,
              animation: `${float} 6s ease-in-out infinite`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              right: '8%',
              width: { xs: 60, md: 100 },
              height: { xs: 60, md: 100 },
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(config.color, 0.15)} 0%, transparent 70%)`,
              animation: `${float} 8s ease-in-out infinite 1s`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '15%',
              width: { xs: 40, md: 60 },
              height: { xs: 40, md: 60 },
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(config.color, 0.1)} 0%, transparent 70%)`,
              animation: `${float} 7s ease-in-out infinite 2s`,
            }}
          />
        </>
      )}

      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            animation: `${slideIn} 0.6s ease-out`,
          }}
        >
          {/* Error Code - Large Display */}
          {displayCode && (
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
                fontWeight: 900,
                background: `linear-gradient(135deg, ${config.color} 0%, ${alpha(config.color, 0.6)} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 0.9,
                mb: 2,
                letterSpacing: '-0.02em',
                animation: `${pulse} 3s ease-in-out infinite`,
              }}
            >
              {displayCode}
            </Typography>
          )}

          {/* Icon with Illustration */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              mb: 3,
            }}
          >
            {isVenueError ? (
              /* Sad Dino Image for Venue Errors */
              <Box
                component="img"
                src="/img/dino_sad.png"
                alt="Sad Dino"
                sx={{
                  width: { xs: 200, md: 280 },
                  height: { xs: 200, md: 280 },
                  objectFit: 'contain',
                }}
              />
            ) : (
              <>
                {/* Main Icon Circle */}
                <Box
                  sx={{
                    width: { xs: 140, md: 180 },
                    height: { xs: 140, md: 180 },
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${config.bgColor} 0%, ${alpha(config.color, 0.2)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: `0 10px 40px ${alpha(config.color, 0.3)}`,
                    animation: retrying ? `${rotate} 1s linear infinite` : `${float} 4s ease-in-out infinite`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -10,
                      left: -10,
                      right: -10,
                      bottom: -10,
                      borderRadius: '50%',
                      border: `2px solid ${alpha(config.color, 0.2)}`,
                      animation: `${pulse} 2s ease-in-out infinite`,
                    },
                  }}
                >
                  <Box sx={{ color: config.color, position: 'relative', zIndex: 1 }}>
                    {config.icon}
                  </Box>
                </Box>

                {/* Illustration Emoji */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    fontSize: { xs: '2.5rem', md: '3rem' },
                    animation: `${bounce} 2s ease-in-out infinite`,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  }}
                >
                  {config.illustration}
                </Box>
              </>
            )}
          </Box>

          {/* Venue Status Chip */}
          {config.showStatus && context.venueStatus && (
            <Box sx={{ mb: 3 }}>
              <Chip
                icon={<Info />}
                label={getStatusText(context.venueStatus)}
                color={getStatusColor(context.venueStatus) as any}
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  py: 2.5,
                  px: 1,
                  borderRadius: 3,
                  boxShadow: 2,
                }}
              />
            </Box>
          )}

          {/* Title */}
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            fontWeight="700"
            color="text.primary"
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              lineHeight: 1.2,
              mb: 2,
              letterSpacing: '-0.01em',
            }}
          >
            {displayTitle}
          </Typography>

          {/* Message */}
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              lineHeight: 1.6,
              maxWidth: 600,
              mx: 'auto',
              mb: 3,
              fontWeight: 400,
            }}
          >
            {displayMessage}
          </Typography>

          {/* Additional Info for venue errors */}
          {(type === 'venue-not-accepting' || type === 'venue-closed') && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
                px: 2,
                py: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`,
              }}
            >
              <Schedule
                sx={{
                  color: 'info.main',
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                }}
              />
              <Typography
                variant="body1"
                color="info.main"
                fontWeight="600"
                sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
              >
                We'll be back soon! Please check again later.
              </Typography>
            </Box>
          )}

          {/* Suggestions Card */}
          <Box
            sx={{
              maxWidth: 500,
              mx: 'auto',
              mb: 3,
              p: { xs: 2.5, md: 3 },
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
              textAlign: 'left',
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="700"
              color="text.primary"
              sx={{ 
                mb: 2.5, 
                fontSize: { xs: '1rem', md: '1.125rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box component="span" sx={{ fontSize: '1.25rem' }}>💡</Box>
              What you can try:
            </Typography>
            <Stack spacing={1.5}>
              {config.suggestions.map((suggestion, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: config.color,
                      mt: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.875rem', md: '0.9375rem' },
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {suggestion}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Custom Children */}
          {children}

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            {showRetry && (
              <Button
                variant="contained"
                startIcon={retrying ? <Refresh sx={{ animation: `${rotate} 1s linear infinite` }} /> : <Refresh />}
                onClick={handleRetry}
                disabled={retrying}
                size="large"
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 3,
                  py: 1.75,
                  px: 2.5,
                  fontSize: '1rem',
                  background: `linear-gradient(135deg, ${config.color} 0%, ${alpha(config.color, 0.8)} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(config.color, 0.4)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px ${alpha(config.color, 0.5)}`,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {retrying
                  ? 'Retrying...'
                  : type === 'venue-not-accepting' || type === 'venue-closed'
                  ? 'Check Again'
                  : 'Try Again'}
              </Button>
            )}

            {showGoBack && (
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                size="large"
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 3,
                  py: 1.75,
                  px: 2.5,
                  fontSize: '1rem',
                  borderWidth: 2,
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                  color: 'text.primary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: config.color,
                    backgroundColor: alpha(config.color, 0.08),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Go Back
              </Button>
            )}

            {showGoHome && (
              <Button
                variant="text"
                startIcon={<Home />}
                onClick={handleGoHome}
                size="large"
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 3,
                  py: 1.75,
                  px: 2.5,
                  fontSize: '1rem',
                  color: 'text.secondary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: alpha(config.color, 0.08),
                    color: config.color,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {isAuthenticated
                  ? 'Dashboard'
                  : type === 'venue-not-accepting' || type === 'venue-closed'
                  ? 'Go to Homepage'
                  : 'Home'}
              </Button>
            )}

            {customActions}
          </Stack>

          {/* Footer Note */}
          {(type === 'venue-not-accepting' || type === 'venue-closed') && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                fontStyle: 'italic',
                display: 'block',
                mt: 2,
              }}
            >
              Thank you for your patience and understanding. 🙏
            </Typography>
          )}

          {/* Help Text */}
          {type !== 'venue-not-accepting' && type !== 'venue-closed' && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 3,
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                opacity: 0.8,
              }}
            >
              If you believe this is an error, please{' '}
              <Box
                component="span"
                sx={{
                  color: config.color,
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() => navigate('/contact')}
              >
                contact our support team
              </Box>
              .
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default GenericErrorPage;

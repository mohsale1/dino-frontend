import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Login,
  Refresh,
  Home,
  Business,
  ArrowForward,
  ExpandMore,
  Email,
  Phone,
  HelpOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DinoLogo from './DinoLogo';
import { useToast } from '../contexts/ToastContext';

interface RegistrationResultProps {
  isSuccess: boolean;
  workspaceData?: any;
  error?: string;
  errorCode?: number;
  onRetry?: () => void;
}

const RegistrationResult: React.FC<RegistrationResultProps> = ({
  isSuccess,
  workspaceData,
  error = 'Registration failed. Please try again.',
  errorCode,
  onRetry
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccess } = useToast();

  const workspaceName = workspaceData?.workspace_name || 'Your Workspace';
  const ownerEmail = workspaceData?.owner_email || '';

  const handleLoginRedirect = () => {
    showSuccess('Redirecting to login...');
    navigate('/login', {
      state: {
        message: 'Registration successful! Please sign in with your credentials.',
        email: ownerEmail
      }
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRetryRegistration = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate('/register', {
        state: {
          formData: workspaceData,
          retryAttempt: true
        }
      });
    }
  };

  const handleContactSupport = () => {
    window.open('mailto:support@dino.com?subject=Registration%20Issue', '_blank');
  };

  const getErrorSolution = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('email') && lowerError.includes('already')) {
      return {
        title: 'Email Already Registered',
        solution: 'This email address is already associated with an account. Try signing in instead, or use a different email address.',
        action: 'Sign In',
        actionHandler: () => navigate('/login')
      };
    }
    
    if (lowerError.includes('workspace') && lowerError.includes('exists')) {
      return {
        title: 'Workspace Name Taken',
        solution: 'A workspace with this name already exists. Please choose a different workspace name.',
        action: 'Try Again',
        actionHandler: handleRetryRegistration
      };
    }
    
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        title: 'Network Connection Issue',
        solution: 'Please check your internet connection and try again. If the problem persists, contact support.',
        action: 'Retry',
        actionHandler: handleRetryRegistration
      };
    }
    
    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return {
        title: 'Validation Error',
        solution: 'Some of the information provided was invalid. Please review your details and try again.',
        action: 'Fix Details',
        actionHandler: handleRetryRegistration
      };
    }
    
    return {
      title: 'Registration Failed',
      solution: 'An unexpected error occurred during registration. Please try again or contact support if the issue persists.',
      action: 'Try Again',
      actionHandler: handleRetryRegistration
    };
  };

  const errorSolution = getErrorSolution(error);

  if (isSuccess) {
    // Success State
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={12}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Success Icon Background */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                zIndex: 0,
              }}
            />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Header with Logo */}
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 3 }}>
                <DinoLogo size={32} animated={true} />
                <Typography
                  variant="h5"
                  component="h1"
                  fontWeight="700"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    color: 'text.primary',
                  }}
                >
                  Dino
                </Typography>
              </Stack>

              {/* Success Icon */}
              <Box sx={{ mb: 3 }}>
                <CheckCircle
                  sx={{
                    fontSize: { xs: 60, md: 70 },
                    color: 'success.main',
                    filter: 'drop-shadow(0 4px 12px rgba(76, 175, 80, 0.3))',
                  }}
                />
              </Box>

              {/* Success Message */}
              <Typography
                variant="h4"
                component="h2"
                fontWeight="700"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  color: 'success.main',
                  mb: 1.5,
                }}
              >
                Workspace Created!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Your restaurant workspace "{workspaceName}" is ready. Sign in to start managing your operations.
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Action Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLoginRedirect}
                  startIcon={<Login />}
                  sx={{
                    minWidth: { xs: '100%', sm: 180 },
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                  }}
                >
                  Sign In Now
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleBackToHome}
                  sx={{
                    minWidth: { xs: '100%', sm: 140 },
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                  }}
                >
                  Back to Home
                </Button>
              </Stack>

              {/* Additional Info */}
              {ownerEmail && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    <strong>Login Email:</strong> {ownerEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
                    Use the password you created during registration.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Failure State
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Error Icon Background */}
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              zIndex: 0,
            }}
          />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Header with Logo */}
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 3 }}>
              <DinoLogo size={32} animated={true} />
              <Typography
                variant="h5"
                component="h1"
                fontWeight="700"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: 'text.primary',
                }}
              >
                Dino
              </Typography>
            </Stack>

            {/* Error Icon */}
            <Box sx={{ mb: 3 }}>
              <Error
                sx={{
                  fontSize: { xs: 60, md: 70 },
                  color: 'error.main',
                  filter: 'drop-shadow(0 4px 12px rgba(244, 67, 54, 0.3))',
                }}
              />
            </Box>

            {/* Error Message */}
            <Typography
              variant="h4"
              component="h2"
              fontWeight="700"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                color: 'error.main',
                mb: 1.5,
              }}
            >
              Registration Failed
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                color: 'text.secondary',
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              We encountered an issue. Don't worry, we can help you resolve this.
            </Typography>

            {/* Error Details */}
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                textAlign: 'left',
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                {errorSolution.title}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                {error}
              </Typography>
              {errorCode && (
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.8 }}>
                  Error Code: {errorCode}
                </Typography>
              )}
            </Alert>

            <Divider sx={{ my: 3 }} />

            {/* Solution */}
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                sx={{ mb: 1.5, color: 'text.primary', textAlign: 'center', fontSize: '1rem' }}
              >
                How to Fix This
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {errorSolution.solution}
                </Typography>
              </Alert>
            </Box>

            {/* Action Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={errorSolution.actionHandler}
                startIcon={<Refresh />}
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                }}
              >
                {errorSolution.action}
              </Button>

              <Button
                variant="outlined"
                size="medium"
                onClick={handleBackToHome}
                startIcon={<Home />}
                sx={{
                  minWidth: { xs: '100%', sm: 140 },
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                }}
              >
                Back to Home
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Help Section */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                sx={{ mb: 2, color: 'text.primary', fontSize: '1rem' }}
              >
                Need Help?
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="text"
                  size="small"
                  onClick={handleContactSupport}
                  startIcon={<Email />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Email Support
                </Button>

                <Button
                  variant="text"
                  size="small"
                  onClick={() => window.open('tel:+1234567890', '_self')}
                  startIcon={<Phone />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Call Support
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegistrationResult;
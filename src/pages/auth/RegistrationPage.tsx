import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
  StepConnector,
  styled,
  alpha
} from '@mui/material';
import { Business, CheckCircle, Home } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';
import { WorkspaceRegistration } from '../../types';
import { DinoLogo } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { RegistrationResult } from '../../components/auth';

// Import registration components
import RegistrationCodeInput from '../../components/registration/RegistrationCodeInput';
import WorkspaceDetailsStep from '../../components/registration/WorkspaceDetailsStep';
import VenueInformationStep from '../../components/registration/VenueInformationStep';
import OwnerAccountStep from '../../components/registration/OwnerAccountStep';
import ReviewStep from '../../components/registration/ReviewStep';
import { RegistrationFormData, initialFormData } from '../../components/registration/types';

const steps = [
  'Workspace Details',
  'Venue Information', 
  'Owner Account',
  'Verify Code',
  'Review & Submit'
];

// Custom styled components for responsive stepper
const ResponsiveStepConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-alternativeLabel': {
    top: 22,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  '&.MuiStepConnector-active': {
    '& .MuiStepConnector-line': {
      borderColor: '#0f172a',
    },
  },
  '&.MuiStepConnector-completed': {
    '& .MuiStepConnector-line': {
      borderColor: '#0f172a',
    },
  },
  '& .MuiStepConnector-line': {
    borderColor: '#e2e8f0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
  [theme.breakpoints.down('sm')]: {
    '&.MuiStepConnector-alternativeLabel': {
      top: 22,
      left: 'calc(-50% + 12px)',
      right: 'calc(50% + 12px)',
    },
    '& .MuiStepConnector-line': {
      borderTopWidth: 2,
    },
  },
}));

const ResponsiveStepLabel = styled(StepLabel)(({ theme }) => ({
  '& .MuiStepLabel-label': {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginTop: theme.spacing(1),
    textAlign: 'center',
    lineHeight: 1.2,
    color: '#94a3b8',
    '&.Mui-active': {
      color: '#0f172a',
      fontWeight: 600,
    },
    '&.Mui-completed': {
      color: '#0f172a',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
      marginTop: theme.spacing(0.5),
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.7rem',
      display: 'none',
    },
  },
  '& .MuiStepLabel-iconContainer': {
    paddingRight: 0,
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
      color: '#cbd5e1',
      '&.Mui-active': {
        color: '#0f172a',
      },
      '&.Mui-completed': {
        color: '#0f172a',
      },
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.25rem',
      },
    },
  },
}));

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccess, showError } = useToast();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  
  const [formData, setFormData] = useState<RegistrationFormData>(
    location.state?.formData || initialFormData
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});
  
  // Registration result state
  const [showResult, setShowResult] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string>('');
  const [registrationErrorCode, setRegistrationErrorCode] = useState<number | undefined>();
  const [registrationData, setRegistrationData] = useState<WorkspaceRegistration | null>(null);

  // Handle code verification
  const handleCodeVerified = (code: string) => {
    setCodeVerified(true);
    showSuccess('Code verified successfully! You can now proceed to submit.');
  };

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string): string => {
    return backendErrors[fieldName] || validationErrors[fieldName] || '';
  };

  // Helper function to check if field has any error
  const hasFieldError = (fieldName: string): boolean => {
    return !!(backendErrors[fieldName] || validationErrors[fieldName]);
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Workspace Details
        if (!formData.workspaceName.trim()) {
          errors.workspaceName = 'Workspace name is required';
        } else if (formData.workspaceName.length < 5) {
          errors.workspaceName = 'Workspace name must have at least 5 characters';
        } else if (formData.workspaceName.length > 100) {
          errors.workspaceName = 'Workspace name must not exceed 100 characters';
        }

        if (formData.workspaceDescription && formData.workspaceDescription.length > 500) {
          errors.workspaceDescription = 'Workspace description must not exceed 500 characters';
        }
        break;

      case 1: // Venue Information
        if (!formData.venueName.trim()) {
          errors.venueName = 'Venue name is required';
        } else if (formData.venueName.length > 100) {
          errors.venueName = 'Venue name must not exceed 100 characters';
        }

        if (formData.venueDescription && formData.venueDescription.length > 1000) {
          errors.venueDescription = 'Venue description must not exceed 1000 characters';
        }

        if (!formData.venueLocation.address.trim()) {
          errors.address = 'Address is required';
        } else if (formData.venueLocation.address.length < 5) {
          errors.address = 'Address must have at least 5 characters';
        }

        if (!formData.venueLocation.city.trim()) {
          errors.city = 'City is required';
        }

        if (!formData.venueLocation.state.trim()) {
          errors.state = 'State is required';
        }

        const postalCode = formData.venueLocation.postal_code || '';
        if (!postalCode.trim()) {
          errors.postal_code = 'Postal code is required';
        } else if (postalCode.length < 3) {
          errors.postal_code = 'Postal code must have at least 3 characters';
        }

        if (!formData.venuePhone.trim()) {
          errors.venuePhone = 'Venue phone number is required';
        } else if (!/^\d{10}$/.test(formData.venuePhone)) {
          errors.venuePhone = 'Phone number must be exactly 10 digits';
        }

        if (!formData.venueEmail.trim()) {
          errors.venueEmail = 'Venue email is required';
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(formData.venueEmail)) {
            errors.venueEmail = 'Please enter a valid email address';
          }
        }
        break;

      case 2: // Owner Account
        if (!formData.ownerFirstName.trim()) {
          errors.ownerFirstName = 'First name is required';
        } else if (formData.ownerFirstName.length > 50) {
          errors.ownerFirstName = 'First name must not exceed 50 characters';
        }

        if (!formData.ownerLastName.trim()) {
          errors.ownerLastName = 'Last name is required';
        } else if (formData.ownerLastName.length > 50) {
          errors.ownerLastName = 'Last name must not exceed 50 characters';
        }

        if (!formData.ownerEmail.trim()) {
          errors.ownerEmail = 'Email is required';
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(formData.ownerEmail)) {
            errors.ownerEmail = 'Please enter a valid email address';
          }
        }

        if (!formData.ownerPhone.trim()) {
          errors.ownerPhone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.ownerPhone)) {
          errors.ownerPhone = 'Phone number must be exactly 10 digits';
        }

        if (!formData.ownerPassword) {
          errors.ownerPassword = 'Password is required';
        } else {
          const password = formData.ownerPassword;
          
          if (password.length < 8) {
            errors.ownerPassword = 'Password must be at least 8 characters long';
          } else if (password.length > 128) {
            errors.ownerPassword = 'Password must not exceed 128 characters';
          } else if (!/[A-Z]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one uppercase letter';
          } else if (!/[a-z]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one lowercase letter';
          } else if (!/\d/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one digit';
          } else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
            errors.ownerPassword = 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
          }
        }

        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (formData.ownerPassword !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    // For code verification step (step 3), check if code is verified
    if (activeStep === 3 && !codeVerified) {
      setError('Please verify the registration code before proceeding');
      return;
    }
    
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError(null);
      setBackendErrors({});
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
    setBackendErrors({});
  };

  const handleInputChange = useCallback((field: string, value: any) => {
    // Normalize email fields to lowercase
    if (field === 'ownerEmail' || field === 'venueEmail') {
      value = typeof value === 'string' ? value.toLowerCase().trim() : value;
    }
    
    // Normalize phone numbers to digits only (max 10 digits)
    if (field === 'venuePhone' || field === 'ownerPhone') {
      value = typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 10) : value;
    }
    
    // Normalize postal code to digits only (max 6 digits)
    if (field === 'venueLocation.postal_code') {
      value = typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 6) : value;
    }
    
    if (field.startsWith('venueLocation.')) {
      const locationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        venueLocation: {
          ...prev.venueLocation,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear validation error for this field
    const errorKey = field.startsWith('venueLocation.') ? field.split('.')[1] : field;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
    
    if (backendErrors[errorKey]) {
      setBackendErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  }, [validationErrors, backendErrors]);

  const handleRetry = () => {
    setShowResult(false);
    setRegistrationSuccess(false);
    setRegistrationError('');
    setRegistrationErrorCode(undefined);
    setRegistrationData(null);
    setError(null);
    setBackendErrors({});
    setActiveStep(steps.length - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    if (!codeVerified) {
      showError('Please verify the registration code before submitting');
      setActiveStep(3); // Go back to code verification step
      return;
    }

    setLoading(true);
    setError(null);
    setBackendErrors({});

    // Prepare registration data (no code in payload)
    const registrationData: WorkspaceRegistration = {
      workspace_name: formData.workspaceName,
      workspace_description: formData.workspaceDescription,
      venue_name: formData.venueName,
      venue_description: formData.venueDescription,
      venue_location: formData.venueLocation,
      venue_phone: formData.venuePhone,
      venue_email: formData.venueEmail,
      price_range: formData.priceRange,
      venue_type: formData.venueType,
      owner_email: formData.ownerEmail,
      owner_phone: formData.ownerPhone,
      owner_firstName: formData.ownerFirstName,
      owner_lastName: formData.ownerLastName,
      owner_password: formData.ownerPassword,
      confirm_password: formData.confirmPassword
    };

    try {
      await authService.registerWorkspace(registrationData);
      
      setRegistrationData(registrationData);
      setRegistrationSuccess(true);
      setShowResult(true);
    } catch (err: any) {      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      
      setRegistrationData(registrationData);
      setRegistrationError(errorMessage);
      setRegistrationErrorCode(err.response?.status);
      setRegistrationSuccess(false);
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    const commonProps = {
      formData,
      onInputChange: handleInputChange,
      errors: { ...validationErrors, ...backendErrors }
    };

    switch (step) {
      case 0:
        return <WorkspaceDetailsStep {...commonProps} />;
      case 1:
        return <VenueInformationStep {...commonProps} />;
      case 2:
        return (
          <OwnerAccountStep
            {...commonProps}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        );
      case 3:
        return <RegistrationCodeInput onCodeVerified={handleCodeVerified} />;
      case 4:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  // Show result component if registration is complete
  if (showResult) {
    return (
      <RegistrationResult
        isSuccess={registrationSuccess}
        workspaceData={registrationData}
        error={registrationError}
        errorCode={registrationErrorCode}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
      }}
    >
      {/* Left Side - Branding */}
      {!isMobile && (
        <Box
          sx={{
            width: '40%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 30%, ${alpha('#ffffff', 0.05)} 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, ${alpha('#ffffff', 0.03)} 0%, transparent 50%)
              `,
            }}
          />
          
          {/* Grid Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(${alpha('#ffffff', 0.02)} 1px, transparent 1px),
                linear-gradient(90deg, ${alpha('#ffffff', 0.02)} 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 400 }}>
            {/* Logo */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
              <DinoLogo size={64} animated={true} />
            </Box>

            {/* Title */}
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                mb: 2,
                fontSize: '2.5rem',
              }}
            >
              Start Your Journey
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: alpha('#ffffff', 0.8),
                mb: 4,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Create your workspace and transform your business operations
            </Typography>

            {/* Progress Indicator */}
            {codeVerified && (
              <Box
                sx={{
                  mt: 4,
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha('#10b981', 0.15),
                  border: `1px solid ${alpha('#10b981', 0.3)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
                  <Typography variant="body1" sx={{ color: '#10b981', fontWeight: 600 }}>
                    Code Verified Successfully
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Right Side - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {/* Mobile Logo */}
            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DinoLogo size={40} animated={true} />
                <Typography
                  variant="h5"
                  sx={{
                    color: '#0f172a',
                    fontWeight: 800,
                  }}
                >
                  Create Workspace
                </Typography>
              </Box>
            )}

            {/* Desktop Title */}
            {!isMobile && (
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#0f172a',
                    fontWeight: 800,
                    mb: 0.5,
                  }}
                >
                  Create Your Workspace
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#64748b',
                  }}
                >
                  Set up your complete business management workspace
                </Typography>
              </Box>
            )}

            {/* Home Button */}
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderWidth: 1.5,
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': {
                  borderWidth: 1.5,
                  borderColor: '#0f172a',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                },
              }}
            >
              Home
            </Button>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          p: { xs: 2, sm: 3, md: 4 },
        }}>
          <Container maxWidth="md" sx={{ px: { xs: 0, sm: 2 }, height: '100%' }}>
            {/* Stepper */}
            <Box sx={{ mb: 3, backgroundColor: '#f8fafc', p: 2.5, borderRadius: 2 }}>
            <Stepper 
              activeStep={activeStep} 
              connector={<ResponsiveStepConnector />}
              alternativeLabel={!isMobile}
              orientation={isMobile ? "horizontal" : "horizontal"}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <ResponsiveStepLabel>
                    {isMobile ? '' : label}
                  </ResponsiveStepLabel>
                </Step>
              ))}
            </Stepper>
            {isMobile && (
              <Typography 
                variant="caption" 
                align="center" 
                display="block" 
                sx={{ 
                  mt: 2, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
              </Typography>
            )}
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                backgroundColor: alpha('#ef4444', 0.1),
                color: '#dc2626',
                border: `1px solid ${alpha('#ef4444', 0.3)}`,
                '& .MuiAlert-icon': {
                  color: '#ef4444',
                },
              }}
            >
              {error}
            </Alert>
          )}

            <Box sx={{ my: 3 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              size="large"
              sx={{ 
                minWidth: 100,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: 1.5,
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': {
                  borderWidth: 1.5,
                  borderColor: '#cbd5e1',
                  backgroundColor: '#f8fafc',
                },
                '&:disabled': {
                  borderColor: '#f1f5f9',
                  color: '#cbd5e1',
                },
              }}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !codeVerified}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : null}
                size="large"
                sx={{ 
                  minWidth: 160,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                  '&:hover': {
                    backgroundColor: '#1e293b',
                    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    backgroundColor: '#cbd5e1',
                    color: '#64748b',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Creating...' : 'Create Workspace'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 3 && !codeVerified}
                size="large"
                sx={{ 
                  minWidth: 100,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                  '&:hover': {
                    backgroundColor: '#1e293b',
                    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    backgroundColor: '#cbd5e1',
                    color: '#64748b',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Next
              </Button>
            )}
          </Box>

            {/* Login Link */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                }}
              >
                Already have an account?{' '}
                <Button 
                  variant="text" 
                  onClick={() => navigate('/login')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    p: 0,
                    minWidth: 'auto',
                    color: '#0f172a',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default RegistrationPage;
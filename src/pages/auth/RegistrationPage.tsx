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
import { WorkspaceRegistration } from '../../types/api';
import DinoLogo from '../../components/DinoLogo';
import { useToast } from '../../contexts/ToastContext';
import RegistrationResult from '../../components/RegistrationResult';

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
      borderColor: theme.palette.primary.main,
    },
  },
  '&.MuiStepConnector-completed': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiStepConnector-line': {
    borderColor: '#eaeaf0',
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
    // Convert email fields to lowercase
    if (field === 'ownerEmail' || field === 'venueEmail') {
      value = typeof value === 'string' ? value.toLowerCase() : value;
    }
    
    // Restrict phone numbers to digits only (max 10 digits)
    if (field === 'venuePhone' || field === 'ownerPhone') {
      value = typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 10) : value;
    }
    
    // Restrict postal code to digits only (max 6 digits for Indian postal codes)
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
      owner_first_name: formData.ownerFirstName,
      owner_last_name: formData.ownerLastName,
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
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 2, md: 4 },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 3,
          mb: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Home Button - Absolute positioned on desktop */}
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              Home
            </Button>

            {/* Centered Content */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DinoLogo size={40} animated={true} />
              <Typography
                variant="h4"
                component="h1"
                fontWeight="700"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  color: 'text.primary',
                }}
              >
                Create Your Workspace
              </Typography>
            </Box>
            
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              Set up your complete restaurant management workspace
            </Typography>

            {/* Code Verified Badge */}
            {codeVerified && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.success.main, 0.3),
                }}
              >
                <CheckCircle sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                <Typography variant="caption" fontWeight="600" color="success.main">
                  Code Verified
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Form Content */}
      <Container maxWidth="md" sx={{ flex: 1 }}>
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, md: 4, lg: 5 },
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
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
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Divider sx={{ my: 3 }} />

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
              }}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !codeVerified}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                size="large"
                sx={{ 
                  minWidth: 160,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
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
                }}
              >
                Next
              </Button>
            )}
          </Box>

          {/* Login Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.875rem' }}
            >
              Already have an account?{' '}
              <Button 
                variant="text" 
                onClick={() => navigate('/login')}
                size="small"
                sx={{
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>

          {/* Home Link - Mobile Only */}
          <Box sx={{ mt: 2, textAlign: 'center', display: { xs: 'block', sm: 'none' } }}>
            <Button
              variant="text"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              size="small"
              sx={{
                fontSize: '0.875rem',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegistrationPage;
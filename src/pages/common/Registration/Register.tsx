/**
 * Business Registration Page
 * 
 * Multi-step registration form for new business accounts
 * UI matches the login page design with split layout
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Home,
  Business as BusinessIcon,
  Store,
  Person,
  Preview,
  Speed,
  Security,
  VpnKey,
  Payment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { authService } from '../../../services/auth/auth';
import { apiService } from '../../../utils/api';
import { DinoLogo } from '../../../components/ui';
import { useToast } from '../../../contexts/common/Toast';
import {
  RegistrationCodeStep,
  WorkspaceDetailsStep,
  BillingDetailsStep,
  OrganizationInformationStep,
  AdminAccountStep,
  ReviewStep,
} from './Steps';
import { RegistrationFormData, initialFormData } from './types';

const steps = [
  { label: 'Code', icon: <VpnKey />, description: 'Enter registration code' },
  { label: 'Workspace', icon: <BusinessIcon />, description: 'Create your workspace' },
  { label: 'Billing', icon: <Payment />, description: 'Billing information' },
  { label: 'Organization', icon: <Store />, description: 'Add organization details' },
  { label: 'Admin Account', icon: <Person />, description: 'Set up admin account' },
  { label: 'Review', icon: <Preview />, description: 'Review and submit' },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = useCallback((field: string, value: any) => {
    // Handle nested fields (e.g., 'venueLocation.address')
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setError('');
  }, [validationErrors]);

  const validateStep = async (step: number): Promise<boolean> => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Referral Code (Required)
        if (!formData.referralCode || formData.referralCode.length !== 4) {
          errors.referralCode = 'Referral code is required (4 digits)';
        } else if (!/^\d{4}$/.test(formData.referralCode)) {
          errors.referralCode = 'Code must contain only numbers';
        } else if (!formData.referralCodeValid) {
          // Validate the referral code via API
          try {
            setLoading(true);
            const response = await apiService.get(`/application/auth/validate-referral?code=${formData.referralCode}`);
            
            if (response.success && response.data) {
              const data = response.data as any;
              const firstName = data.firstName || data.first_name || '';
              const lastName = data.lastName || data.last_name || '';
              const referredByName = `${firstName} ${lastName}`.trim() || data.email;
              handleInputChange('referralCodeValid', true);
              handleInputChange('referredByName', referredByName);
              
              // Show success toast with referred by info
              showToast(`Referral code validated! Referred by: ${referredByName}`, 'success');
            } else {
              errors.referralCode = 'Invalid referral code';
            }
          } catch (error: any) {
            errors.referralCode = error.message || 'Invalid referral code';
          } finally {
            setLoading(false);
          }
        }
        break;

      case 1: // Workspace Details
        if (!formData.workspaceName.trim()) {
          errors.workspaceName = 'Workspace name is required';
        }
        break;

      case 2: // Billing Details
        if (!formData.billingName || !formData.billingName.trim()) {
          errors.billingName = 'Billing name is required';
        }
        if (!formData.billingEmail || !formData.billingEmail.trim()) {
          errors.billingEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
          errors.billingEmail = 'Invalid email format';
        }
        if (!formData.billingPhone || !formData.billingPhone.trim()) {
          errors.billingPhone = 'Phone number is required';
        }
        if (!formData.billingAddress.address || !formData.billingAddress.address.trim()) {
          errors['billingAddress.address'] = 'Address is required';
        }
        if (!formData.billingAddress.city || !formData.billingAddress.city.trim()) {
          errors['billingAddress.city'] = 'City is required';
        }
        if (!formData.billingAddress.state || !formData.billingAddress.state.trim()) {
          errors['billingAddress.state'] = 'State is required';
        }
        if (!formData.billingAddress.postal_code || !formData.billingAddress.postal_code.trim()) {
          errors['billingAddress.postal_code'] = 'Postal code is required';
        }
        break;

      case 3: // Organization Information
        if (!formData.organizationName.trim()) {
          errors.organizationName = 'Organization name is required';
        }
        if (!formData.organizationPhone.trim()) {
          errors.organizationPhone = 'Phone number is required';
        }
        if (!formData.organizationEmail.trim()) {
          errors.organizationEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizationEmail)) {
          errors.organizationEmail = 'Invalid email format';
        }
        if (!formData.organizationLocation.address.trim()) {
          errors['organizationLocation.address'] = 'Address is required';
        }
        if (!formData.organizationLocation.city.trim()) {
          errors['organizationLocation.city'] = 'City is required';
        }
        if (!formData.organizationLocation.state.trim()) {
          errors['organizationLocation.state'] = 'State is required';
        }
        if (!formData.organizationLocation.postal_code.trim()) {
          errors['organizationLocation.postal_code'] = 'Postal code is required';
        }
        break;

      case 4: // Admin Account
        if (!formData.adminFirstName.trim()) {
          errors.adminFirstName = 'First name is required';
        }
        if (!formData.adminLastName.trim()) {
          errors.adminLastName = 'Last name is required';
        }
        if (!formData.adminEmail.trim()) {
          errors.adminEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
          errors.adminEmail = 'Invalid email format';
        }
        if (!formData.adminPhone.trim()) {
          errors.adminPhone = 'Phone number is required';
        }
        if (!formData.adminPassword) {
          errors.adminPassword = 'Password is required';
        } else if (formData.adminPassword.length < 8) {
          errors.adminPassword = 'Password must be at least 8 characters';
        }
        if (formData.adminPassword !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (await validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare registration data according to new backend API
      const registrationData = {
        referral_code: formData.referralCode,
        
        // Workspace
        workspace_name: formData.workspaceName,
        workspace_description: formData.workspaceDescription,
        
        // Billing Information
        billing_name: formData.billingName,
        billing_email: formData.billingEmail,
        billing_phone: formData.billingPhone,
        billing_address: formData.billingAddress.address,
        billing_city: formData.billingAddress.city,
        billing_state: formData.billingAddress.state,
        billing_postal_code: formData.billingAddress.postal_code,
        billing_country: formData.billingAddress.country,
        
        // Organization
        organization: {
          name: formData.organizationName,
          description: formData.organizationDescription,
          address: formData.organizationLocation.address,
          city: formData.organizationLocation.city,
          state: formData.organizationLocation.state,
          country: formData.organizationLocation.country,
          postal_code: formData.organizationLocation.postal_code,
          phone: formData.organizationPhone,
          email: formData.organizationEmail,
          organization_type: formData.organizationType,
          order_type: formData.orderType,
        },
        
        // Admin User
        admin_user: {
          email: formData.adminEmail,
          password: formData.adminPassword,
          first_name: formData.adminFirstName,
          last_name: formData.adminLastName,
          phone: formData.adminPhone,
        },
      };

      await authService.signup(registrationData);

      // Navigate to login with success message
      navigate('/login', {
        replace: true,
        state: {
          message: 'Registration successful! Please sign in to continue.',
          email: formData.adminEmail,
        },
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      
      // If error is related to a specific field, scroll to that step
      if (errorMessage.toLowerCase().includes('referral') || errorMessage.toLowerCase().includes('code')) {
        setActiveStep(0); // Referral code step
      } else if (errorMessage.toLowerCase().includes('workspace')) {
        setActiveStep(1); // Workspace step
      } else if (errorMessage.toLowerCase().includes('organization') || errorMessage.toLowerCase().includes('venue')) {
        setActiveStep(2); // Organization step
      } else if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('admin')) {
        setActiveStep(3); // Admin account step
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <RegistrationCodeStep
            formData={formData}
            onInputChange={handleInputChange}
            errors={validationErrors}
          />
        );
      case 1:
        return (
          <WorkspaceDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
            errors={validationErrors}
          />
        );
      case 2:
        return (
          <BillingDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <OrganizationInformationStep
            formData={formData}
            onInputChange={handleInputChange}
            errors={validationErrors}
          />
        );
      case 4:
        return (
          <AdminAccountStep
            formData={formData}
            onInputChange={handleInputChange}
            errors={validationErrors}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
          />
        );
      default:
        return null;
    }
  };

  const progress = (activeStep / steps.length) * 100;

  const features = [
    { icon: <CheckCircle sx={{ fontSize: 20 }} />, text: 'Quick 5-Step Setup' },
    { icon: <Speed sx={{ fontSize: 20 }} />, text: 'Start Selling in Minutes' },
    { icon: <Security sx={{ fontSize: 20 }} />, text: 'Secure & Reliable' },
  ];

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
            flex: 1,
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

          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 500 }}>
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
                fontSize: { md: '2.5rem', lg: '3rem' },
              }}
            >
              Join Dino Today
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: alpha('#ffffff', 0.8),
                mb: 5,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Start your digital transformation journey
            </Typography>

            {/* Features */}
            <Stack spacing={2.5} sx={{ mt: 6 }}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha('#ffffff', 0.05),
                    border: `1px solid ${alpha('#ffffff', 0.1)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: alpha('#ffffff', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 500,
                    }}
                  >
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Progress Indicator */}
            <Box sx={{ mt: 6, p: 3, borderRadius: 2, backgroundColor: alpha('#ffffff', 0.05), border: `1px solid ${alpha('#ffffff', 0.1)}` }}>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
                Registration Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: alpha('#ffffff', 0.1), overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: '#10b981',
                      transition: 'width 0.3s ease',
                      borderRadius: 4,
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 700, minWidth: 45 }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.6), mt: 1, display: 'block' }}>
                Step {activeStep + 1} of {steps.length}: {steps[activeStep].description}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Right Side - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          backgroundColor: '#ffffff',
          position: 'relative',
          overflowY: 'auto',
        }}
      >
        {/* Home Button */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
          }}
        >
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
              fontSize: '0.9375rem',
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

        {/* Mobile Logo & Progress */}
        {isMobile && (
          <Box sx={{ mb: 4, textAlign: 'center', width: '100%' }}>
            <DinoLogo size={48} animated={true} />
            <Typography
              variant="h4"
              sx={{
                color: '#0f172a',
                fontWeight: 800,
                mt: 2,
                mb: 3,
              }}
            >
              Create Account
            </Typography>
            
            {/* Mobile Progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box sx={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: '#0f172a',
                      transition: 'width 0.3s ease',
                      borderRadius: 4,
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 700, minWidth: 45 }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Step {activeStep + 1} of {steps.length}: {steps[activeStep].description}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Form Container */}
        <Box sx={{ width: '100%', maxWidth: 520 }}>
          {/* Header - Desktop Only */}
          {!isMobile && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#0f172a',
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                Create Your Account
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                }}
              >
                Step {activeStep + 1} of {steps.length}: {steps[activeStep].label}
              </Typography>
            </Box>
          )}

          {/* Stepper - Desktop Only */}
          {!isMobile && (
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              index < activeStep
                                ? '#10b981'
                                : index === activeStep
                                ? '#0f172a'
                                : '#e2e8f0',
                            color: index <= activeStep ? '#ffffff' : '#94a3b8',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {index < activeStep ? (
                            <CheckCircle sx={{ fontSize: 24 }} />
                          ) : (
                            React.cloneElement(step.icon, { sx: { fontSize: 20 } })
                          )}
                        </Box>
                      )}
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: index <= activeStep ? '#0f172a' : '#94a3b8',
                          fontWeight: index === activeStep ? 700 : 500,
                          fontSize: '0.875rem',
                          mt: 1,
                        },
                      }}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
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

          {/* Form Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                borderWidth: 1.5,
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': {
                  borderWidth: 1.5,
                  borderColor: '#0f172a',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                },
                '&:disabled': {
                  borderColor: '#e2e8f0',
                  color: '#cbd5e1',
                },
              }}
            >
              Back
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={handleNext}
                disabled={loading}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                  '&:hover': {
                    backgroundColor: '#1e293b',
                    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={loading ? null : <CheckCircle />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                  '&:hover': {
                    backgroundColor: '#059669',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    backgroundColor: '#cbd5e1',
                    color: '#64748b',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                ) : (
                  'Create Account'
                )}
              </Button>
            )}
          </Stack>

          {/* Login Link */}
          <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />
          <Box sx={{ textAlign: 'center' }}>
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
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
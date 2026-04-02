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
  { label: 'Code',         icon: <VpnKey />,       description: 'Enter registration code' },
  { label: 'Workspace',    icon: <BusinessIcon />,  description: 'Create your workspace' },
  { label: 'Billing',      icon: <Payment />,       description: 'Billing information' },
  { label: 'Organization', icon: <Store />,         description: 'Add organization details' },
  { label: 'Admin Account',icon: <Person />,        description: 'Set up admin account' },
  { label: 'Review',       icon: <Preview />,       description: 'Review and submit' },
];

// Thin scrollbar mixin reused in multiple panels
const thinScrollbar = {
  '&::-webkit-scrollbar':       { width: 4 },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: 2 },
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeStep,          setActiveStep]          = useState(0);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState('');
  const [formData,            setFormData]            = useState<RegistrationFormData>(initialFormData);
  const [validationErrors,    setValidationErrors]    = useState<Record<string, string>>({});
  const [showPassword,        setShowPassword]        = useState(false);
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
              const lastName  = data.lastName  || data.last_name  || '';
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
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
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
        workspace_name:        formData.workspaceName,
        workspace_description: formData.workspaceDescription,

        // Billing Information
        billing_name:        formData.billingName,
        billing_email:       formData.billingEmail,
        billing_phone:       formData.billingPhone,
        billing_address:     formData.billingAddress.address,
        billing_city:        formData.billingAddress.city,
        billing_state:       formData.billingAddress.state,
        billing_postal_code: formData.billingAddress.postal_code,
        billing_country:     formData.billingAddress.country,

        // Organization
        organization: {
          name:              formData.organizationName,
          description:       formData.organizationDescription,
          address:           formData.organizationLocation.address,
          city:              formData.organizationLocation.city,
          state:             formData.organizationLocation.state,
          country:           formData.organizationLocation.country,
          postal_code:       formData.organizationLocation.postal_code,
          phone:             formData.organizationPhone,
          email:             formData.organizationEmail,
          organization_type: formData.organizationType,
          order_type:        formData.orderType,
        },

        // Admin User
        admin_user: {
          email:      formData.adminEmail,
          password:   formData.adminPassword,
          first_name: formData.adminFirstName,
          last_name:  formData.adminLastName,
          phone:      formData.adminPhone,
        },
      };

      await authService.signup(registrationData);

      // Navigate to login with success message
      navigate('/login', {
        replace: true,
        state: {
          message: 'Registration successful! Please sign in to continue.',
          email:   formData.adminEmail,
        },
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);

      // If error is related to a specific field, scroll to that step
      if (errorMessage.toLowerCase().includes('referral') || errorMessage.toLowerCase().includes('code')) {
        setActiveStep(0);
      } else if (errorMessage.toLowerCase().includes('workspace')) {
        setActiveStep(1);
      } else if (errorMessage.toLowerCase().includes('organization') || errorMessage.toLowerCase().includes('venue')) {
        setActiveStep(2);
      } else if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('admin')) {
        setActiveStep(3);
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
    { icon: <Speed     sx={{ fontSize: 20 }} />, text: 'Start Selling in Minutes' },
    { icon: <Security  sx={{ fontSize: 20 }} />, text: 'Secure & Reliable' },
  ];

  // ─── Shared: navigation buttons + login link (rendered inside scrollable area) ───
  const navigationButtons = (
    <>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
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
              boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
              '&:hover': {
                backgroundColor: '#1e293b',
                boxShadow: '0 6px 20px rgba(15,23,42,0.35)',
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
            endIcon={loading ? undefined : <CheckCircle />}
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
              boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
              '&:hover': {
                backgroundColor: '#059669',
                boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                backgroundColor: '#cbd5e1',
                color: '#64748b',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Create Account'}
          </Button>
        )}
      </Stack>

      <Divider sx={{ my: 2.5, borderColor: '#e2e8f0' }} />
      <Box sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
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
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Sign In
          </Button>
        </Typography>
      </Box>
    </>
  );

  // ─── Shared: progress bar ────────────────────────────────────────────────────
  const progressBar = (light: boolean) => (
    <Box sx={{ mt: light ? 0 : 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Box
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: light ? '#e2e8f0' : alpha('#ffffff', 0.15),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: light ? '#0f172a' : '#10b981',
              transition: 'width 0.3s ease',
              borderRadius: 3,
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{ color: light ? '#0f172a' : '#ffffff', fontWeight: 700, minWidth: 36 }}
        >
          {Math.round(progress)}%
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: light ? '#64748b' : alpha('#ffffff', 0.6) }}>
        Step {activeStep + 1} of {steps.length}: {steps[activeStep].description}
      </Typography>
    </Box>
  );

  // ─── Shared: compact stepper ─────────────────────────────────────────────────
  const compactStepper = (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 0 }}>
      {steps.map((step, index) => (
        <Step key={step.label}>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 32,
                  height: 32,
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
                  flexShrink: 0,
                }}
              >
                {index < activeStep
                  ? <CheckCircle sx={{ fontSize: 18 }} />
                  : React.cloneElement(step.icon, { sx: { fontSize: 16 } })}
              </Box>
            )}
            sx={{
              '& .MuiStepLabel-label': {
                color: index <= activeStep ? '#0f172a' : '#94a3b8',
                fontWeight: index === activeStep ? 700 : 500,
                fontSize: '0.75rem',
                mt: 0.5,
              },
            }}
          >
            {step.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );

  // ─── Home button ─────────────────────────────────────────────────────────────
  const homeButton = (
    <Button
      variant="outlined"
      startIcon={<Home />}
      onClick={() => navigate('/')}
      size="small"
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        px: 2,
        py: 0.75,
        fontSize: '0.875rem',
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
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (md+)
  // ═══════════════════════════════════════════════════════════════════════════
  const desktopLayout = (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* LEFT BRANDING PANEL */}
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
        {/* Background radial glow */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 30%, ${alpha('#ffffff', 0.05)} 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${alpha('#ffffff', 0.03)} 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }}
        />
        {/* Grid pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${alpha('#ffffff', 0.02)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha('#ffffff', 0.02)} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 420, width: '100%' }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <DinoLogo size={64} animated />
          </Box>

          <Typography
            variant="h4"
            sx={{ color: '#ffffff', fontWeight: 800, mb: 1.5, letterSpacing: '-0.5px' }}
          >
            Join Dino Today
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: alpha('#ffffff', 0.7), mb: 4, lineHeight: 1.6 }}
          >
            Start your digital transformation journey
          </Typography>

          {/* Features */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  backgroundColor: alpha('#ffffff', 0.05),
                  border: `1px solid ${alpha('#ffffff', 0.1)}`,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: alpha('#ffffff', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Progress indicator */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              backgroundColor: alpha('#ffffff', 0.05),
              border: `1px solid ${alpha('#ffffff', 0.1)}`,
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
              Registration Progress
            </Typography>
            {progressBar(false)}
          </Box>
        </Box>
      </Box>

      {/* RIGHT FORM PANEL */}
      <Box
        sx={{
          width: { md: 480, lg: 520 },
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Top bar — home button + title */}
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            px: { md: 5, lg: 6 },
            pt: 3.5,
            pb: 0,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.3px">
              Create Your Account
            </Typography>
            <Typography variant="body2" color="#64748b" mt={0.5}>
              Step {activeStep + 1} of {steps.length}: {steps[activeStep].label}
            </Typography>
          </Box>
          {homeButton}
        </Box>

        {/* Stepper */}
        <Box sx={{ flexShrink: 0, px: { md: 5, lg: 6 }, pt: 2.5, pb: 1 }}>
          {compactStepper}
        </Box>

        {/* Scrollable form area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            px: { md: 5, lg: 6 },
            pt: 2,
            pb: 3,
            ...thinScrollbar,
          }}
        >
          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
              sx={{
                mb: 2.5,
                borderRadius: 2,
                backgroundColor: alpha('#ef4444', 0.1),
                color: '#dc2626',
                border: `1px solid ${alpha('#ef4444', 0.3)}`,
                '& .MuiAlert-icon': { color: '#ef4444' },
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 1 }}>
            {renderStepContent(activeStep)}
          </Box>

          {navigationButtons}
        </Box>
      </Box>
    </Box>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT (xs–sm)
  // ═══════════════════════════════════════════════════════════════════════════
  const mobileLayout = (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0f172a',
      }}
    >
      {/* Dark branded header */}
      <Box
        sx={{
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          px: 3,
          pt: 3.5,
          pb: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${alpha('#ffffff', 0.025)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha('#ffffff', 0.025)} 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <DinoLogo size={44} animated />
          <Typography
            variant="h6"
            fontWeight={700}
            color="white"
            mt={1.25}
            textAlign="center"
            sx={{ letterSpacing: '-0.3px' }}
          >
            Create Account
          </Typography>
          <Box sx={{ mt: 1.5, width: '100%', maxWidth: 320 }}>
            {progressBar(false)}
          </Box>
        </Box>
      </Box>

      {/* White card — scrollable */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#ffffff',
          borderRadius: '20px 20px 0 0',
          mt: -1.5,
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 3, sm: 5 },
          pt: 3,
          pb: 3,
          ...thinScrollbar,
        }}
      >
        {/* Home button + step label */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              {steps[activeStep].label}
            </Typography>
            <Typography variant="caption" color="#64748b">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
          {homeButton}
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{
              mb: 2,
              borderRadius: 2,
              backgroundColor: alpha('#ef4444', 0.1),
              color: '#dc2626',
              border: `1px solid ${alpha('#ef4444', 0.3)}`,
              '& .MuiAlert-icon': { color: '#ef4444' },
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 1 }}>
          {renderStepContent(activeStep)}
        </Box>

        {navigationButtons}
      </Box>
    </Box>
  );

  return isMobile ? mobileLayout : desktopLayout;
};

export default RegisterPage;
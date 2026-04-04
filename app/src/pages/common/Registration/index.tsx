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
  Chip,
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
  CheckCircleOutline,
  QrCode2,
  Dashboard,
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

// ─── Design tokens (mirrors Login page BRAND) ────────────────────────────────
const BRAND = {
  primary:      '#1976D2',
  primaryHover: '#1565C0',
  primaryLight: '#42A5F5',
  panelBg:      '#0d1b2e',
  panelBg2:     '#112240',
  accent:       'rgba(66,165,245,0.15)',
  accentBorder: 'rgba(66,165,245,0.25)',
  green:        '#10b981',
  greenHover:   '#059669',
};

const steps = [
  { label: 'Code',          icon: <VpnKey />,       description: 'Enter registration code' },
  { label: 'Workspace',     icon: <BusinessIcon />,  description: 'Create your workspace' },
  { label: 'Billing',       icon: <Payment />,       description: 'Billing information' },
  { label: 'Organization',  icon: <Store />,         description: 'Add organization details' },
  { label: 'Admin Account', icon: <Person />,        description: 'Set up admin account' },
  { label: 'Review',        icon: <Preview />,       description: 'Review and submit' },
];

// Features shown in the left branding panel — mirrors Login APP_FEATURES style
const APP_FEATURES = [
  { icon: CheckCircleOutline, text: 'Quick 6-step setup process' },
  { icon: Speed,              text: 'Start selling in minutes' },
  { icon: QrCode2,            text: 'QR-based ordering system' },
  { icon: Dashboard,          text: 'Real-time analytics dashboard' },
  { icon: Store,              text: 'Full catalog & venue management' },
  { icon: Security,           text: 'Secure & reliable platform' },
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

  // ─── Progress bar ─────────────────────────────────────────────────────────
  // light=true → used on white right panel; light=false → used on dark left panel
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
              backgroundColor: BRAND.primary,
              transition: 'width 0.3s ease',
              borderRadius: 3,
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{ color: light ? BRAND.primary : '#ffffff', fontWeight: 700, minWidth: 36 }}
        >
          {Math.round(progress)}%
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: light ? '#64748b' : alpha('#ffffff', 0.6) }}>
        Step {activeStep + 1} of {steps.length}: {steps[activeStep].description}
      </Typography>
    </Box>
  );

  // ─── Compact stepper (right panel, desktop) ───────────────────────────────
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
                      ? BRAND.green
                      : index === activeStep
                      ? BRAND.primary
                      : '#e2e8f0',
                  color: index <= activeStep ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  boxShadow:
                    index === activeStep
                      ? `0 0 0 3px ${alpha(BRAND.primary, 0.18)}`
                      : index < activeStep
                      ? `0 0 0 3px ${alpha(BRAND.green, 0.15)}`
                      : 'none',
                }}
              >
                {index < activeStep
                  ? <CheckCircle sx={{ fontSize: 18 }} />
                  : React.cloneElement(step.icon, { sx: { fontSize: 16 } })}
              </Box>
            )}
            sx={{
              '& .MuiStepLabel-label': {
                display: { xs: 'none', sm: 'block' },
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

  // ─── Home button ──────────────────────────────────────────────────────────
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
        flexShrink: 0,
        '&:hover': {
          borderWidth: 1.5,
          borderColor: BRAND.primary,
          backgroundColor: alpha(BRAND.primary, 0.04),
          color: BRAND.primary,
        },
      }}
    >
      Home
    </Button>
  );

  // ─── Navigation buttons + sign-in link ───────────────────────────────────
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
              borderColor: BRAND.primary,
              backgroundColor: alpha(BRAND.primary, 0.04),
              color: BRAND.primary,
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
              backgroundColor: BRAND.primary,
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(25,118,210,0.3)',
              '&:hover': {
                backgroundColor: BRAND.primaryHover,
                boxShadow: '0 6px 20px rgba(25,118,210,0.4)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                backgroundColor: alpha(BRAND.primary, 0.4),
                color: 'rgba(255,255,255,0.7)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : 'Continue'}
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
              backgroundColor: BRAND.green,
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
              '&:hover': {
                backgroundColor: BRAND.greenHover,
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
              color: BRAND.primary,
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Sign In
          </Button>
        </Typography>
      </Box>
    </>
  );

  // ─── Shared error alert ───────────────────────────────────────────────────
  const errorAlert = error ? (
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
  ) : null;

  // ═══════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (md+)
  // ═══════════════════════════════════════════════════════════════════════════
  const desktopLayout = (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: BRAND.panelBg }}>

      {/* LEFT BRANDING PANEL */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { md: 6, lg: 10 },
          py: 8,
          background: `linear-gradient(160deg, ${BRAND.panelBg} 0%, ${BRAND.panelBg2} 60%, ${BRAND.panelBg} 100%)`,
          borderRight: `1px solid ${BRAND.accentBorder}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blue radial glow — matches Login */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25,118,210,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Subtle grid pattern */}
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

        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 340, width: '100%' }}>
          {/* Logo */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <DinoLogo size={72} animated />
          </Box>

          <Typography
            variant="h4"
            sx={{ color: '#ffffff', fontWeight: 700, mb: 1.5, letterSpacing: '-0.5px' }}
          >
            Join Dino Today
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.55)', mb: 4, lineHeight: 1.6 }}
          >
            Start your digital transformation journey
          </Typography>

          <Divider sx={{ width: 48, borderColor: BRAND.accentBorder, mb: 4, mx: 'auto' }} />

          {/* Feature list — Login APP_FEATURES style */}
          <Box display="flex" flexDirection="column" gap={2} width="100%">
            {APP_FEATURES.map(({ icon: Icon, text }, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={2}
                sx={{
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: BRAND.accent,
                  border: `1px solid ${BRAND.accentBorder}`,
                  textAlign: 'left',
                }}
              >
                <Icon sx={{ fontSize: 20, color: BRAND.primaryLight, flexShrink: 0 }} />
                <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight={500}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="caption" color="rgba(255,255,255,0.25)" mt={5} display="block" textAlign="center">
            Dino &copy; {new Date().getFullYear()}
          </Typography>
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
        {/* Top bar — title + home button */}
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
          {errorAlert}

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
        bgcolor: BRAND.panelBg,
      }}
    >
      {/* Dark branded header — matches Login mobile header exactly */}
      <Box
        sx={{
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          px: 3,
          pt: 4,
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: `linear-gradient(160deg, ${BRAND.panelBg} 0%, ${BRAND.panelBg2} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25,118,210,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <DinoLogo size={48} animated />
          <Typography
            variant="h6"
            fontWeight={700}
            color="white"
            mt={1.5}
            textAlign="center"
            sx={{ letterSpacing: '-0.3px' }}
          >
            Join Dino Today
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.5)" mt={0.5} textAlign="center" maxWidth={260} lineHeight={1.5}>
            Start your digital transformation journey
          </Typography>

          {/* Feature chips — matches Login mobile chip row */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2, justifyContent: 'center' }}>
            {APP_FEATURES.map(({ icon: Icon, text }, i) => (
              <Chip
                key={i}
                icon={<Icon sx={{ fontSize: '13px !important', color: `${BRAND.primaryLight} !important` }} />}
                label={text}
                size="small"
                sx={{
                  bgcolor: BRAND.accent,
                  border: `1px solid ${BRAND.accentBorder}`,
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  height: 26,
                  '& .MuiChip-icon': { ml: 0.5 },
                }}
              />
            ))}
          </Box>

          {/* Progress bar below chips */}
          <Box sx={{ mt: 2, width: '100%', maxWidth: 340 }}>
            {progressBar(false)}
          </Box>
        </Box>
      </Box>

      {/* White card — scrollable, fills remaining height */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#ffffff',
          borderRadius: '20px 20px 0 0',
          mt: -2,
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
        {/* Step label + home button */}
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

        {/* Icon-only stepper on mobile */}
        <Box sx={{ mb: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 0 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          index < activeStep
                            ? BRAND.green
                            : index === activeStep
                            ? BRAND.primary
                            : '#e2e8f0',
                        color: index <= activeStep ? '#ffffff' : '#94a3b8',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                        boxShadow:
                          index === activeStep
                            ? `0 0 0 3px ${alpha(BRAND.primary, 0.18)}`
                            : index < activeStep
                            ? `0 0 0 3px ${alpha(BRAND.green, 0.15)}`
                            : 'none',
                      }}
                    >
                      {index < activeStep
                        ? <CheckCircle sx={{ fontSize: 15 }} />
                        : React.cloneElement(step.icon, { sx: { fontSize: 14 } })}
                    </Box>
                  )}
                  sx={{
                    '& .MuiStepLabel-label': {
                      display: 'none',
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {errorAlert}

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
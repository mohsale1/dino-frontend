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
  alpha,
  Stack,
  Divider,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Business as BusinessIcon,
  Store,
  Person,
  Preview,
  Security,
  Tag,
  CheckCircleOutline,
  QrCode2,
  Dashboard,
  VpnKey,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { authService } from '../../../services/auth/auth';
import { apiService } from '../../../utils/api';
import { DinoLogo } from '../../../components/ui';
import { useToast } from '../../../contexts/common/Toast';
import {
  RegistrationCodeStep,
  WorkspaceDetailsStep,
  OrganizationInformationStep,
  AdminAccountStep,
  ReviewStep,
} from './Steps';
import { RegistrationFormData, initialFormData } from './types';

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

// Per-step metadata: icon shown in the header box + title + subtitle
const STEPS = [
  { label: 'Code',          icon: <VpnKey />,       stepIcon: <Tag />,          title: 'Referral Code',       subtitle: 'Enter the 4-digit code provided by your agent' },
  { label: 'Workspace',     icon: <BusinessIcon />, stepIcon: <BusinessIcon />, title: 'Workspace Details',   subtitle: 'Set up your workspace information' },
  { label: 'Persona',       icon: <Store />,        stepIcon: <Store />,        title: 'Persona Details',     subtitle: 'Tell us about your first venue or branch' },
  { label: 'Admin Account', icon: <Person />,       stepIcon: <Person />,       title: 'Admin Account',       subtitle: 'Create your administrator account' },
  { label: 'Review',        icon: <Preview />,      stepIcon: <Preview />,      title: 'Review & Submit',     subtitle: 'Review all details before creating your account' },
];

const APP_FEATURES = [
  { icon: CheckCircleOutline, text: 'Quick 5-step setup process' },
  { icon: QrCode2,            text: 'QR-based ordering system' },
  { icon: Dashboard,          text: 'Real-time analytics dashboard' },
  { icon: Store,              text: 'Full catalog & venue management' },
  { icon: Security,           text: 'Secure & reliable platform' },
];

const scrollbarSx = {
  '&::-webkit-scrollbar':       { width: 4 },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.12)', borderRadius: 2 },
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeStep,          setActiveStep]          = useState(0);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState('');
  const [formData,            setFormData]            = useState<RegistrationFormData>(initialFormData);
  const [validationErrors,    setValidationErrors]    = useState<Record<string, string>>({});
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleInputChange = useCallback((field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...(prev as any)[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (validationErrors[field]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
    setError('');
  }, [validationErrors]);

  const validateStep = async (step: number): Promise<boolean> => {
    const errors: Record<string, string> = {};
    switch (step) {
      case 0:
        if (!formData.referralCode || formData.referralCode.length !== 4) {
          errors.referralCode = 'Referral code is required (4 digits)';
        } else if (!/^\d{4}$/.test(formData.referralCode)) {
          errors.referralCode = 'Code must contain only numbers';
        } else if (!formData.referralCodeValid) {
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
              showToast(`Referral code validated! Referred by: ${referredByName}`, 'success');
            } else {
              errors.referralCode = 'Invalid referral code';
            }
          } catch (err: any) {
            errors.referralCode = err.message || 'Invalid referral code';
          } finally {
            setLoading(false);
          }
        }
        break;
      case 1:
        if (!formData.workspaceName.trim()) errors.workspaceName = 'Workspace name is required';
        break;
      case 2:
        if (!formData.organizationName.trim())  errors.organizationName = 'Organization name is required';
        if (!formData.organizationPhone.trim())  errors.organizationPhone = 'Phone number is required';
        if (!formData.organizationEmail.trim()) {
          errors.organizationEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizationEmail)) {
          errors.organizationEmail = 'Invalid email format';
        }
        if (!formData.organizationLocation.address.trim())     errors['organizationLocation.address']     = 'Address is required';
        if (!formData.organizationLocation.city.trim())        errors['organizationLocation.city']        = 'City is required';
        if (!formData.organizationLocation.state.trim())       errors['organizationLocation.state']       = 'State is required';
        if (!formData.organizationLocation.postal_code.trim()) errors['organizationLocation.postal_code'] = 'Postal code is required';
        break;
      case 3:
        if (!formData.adminFirstName.trim()) errors.adminFirstName = 'First name is required';
        if (!formData.adminLastName.trim())  errors.adminLastName  = 'Last name is required';
        if (!formData.adminEmail.trim()) {
          errors.adminEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
          errors.adminEmail = 'Invalid email format';
        }
        if (!formData.adminPhone.trim()) errors.adminPhone = 'Phone number is required';
        if (!formData.adminPassword) {
          errors.adminPassword = 'Password is required';
        } else if (formData.adminPassword.length < 8) {
          errors.adminPassword = 'Password must be at least 8 characters';
        }
        if (formData.adminPassword !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        break;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (await validateStep(activeStep)) setActiveStep(p => p + 1);
  };

  const handleBack = () => { setActiveStep(p => p - 1); setError(''); };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    setLoading(true);
    setError('');
    try {
      await authService.signup({
        referral_code:         formData.referralCode,
        workspace_name:        formData.workspaceName,
        workspace_description: formData.workspaceDescription,
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
        admin_user: {
          email:      formData.adminEmail,
          password:   formData.adminPassword,
          first_name: formData.adminFirstName,
          last_name:  formData.adminLastName,
          phone:      formData.adminPhone,
        },
      });
      navigate('/login', { replace: true, state: { message: 'Registration successful! Please sign in to continue.', email: formData.adminEmail } });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setError(msg);
      if (msg.toLowerCase().includes('referral') || msg.toLowerCase().includes('code'))         setActiveStep(0);
      else if (msg.toLowerCase().includes('workspace'))                                          setActiveStep(1);
      else if (msg.toLowerCase().includes('organization') || msg.toLowerCase().includes('venue')) setActiveStep(2);
      else if (msg.toLowerCase().includes('admin') || msg.toLowerCase().includes('email'))       setActiveStep(3);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: return <RegistrationCodeStep formData={formData} onInputChange={handleInputChange} errors={validationErrors} />;
      case 1: return <WorkspaceDetailsStep formData={formData} onInputChange={handleInputChange} errors={validationErrors} />;
      case 2: return <OrganizationInformationStep formData={formData} onInputChange={handleInputChange} errors={validationErrors} />;
      case 3: return (
        <AdminAccountStep
          formData={formData} onInputChange={handleInputChange} errors={validationErrors}
          showPassword={showPassword} showConfirmPassword={showConfirmPassword}
          onTogglePassword={() => setShowPassword(p => !p)}
          onToggleConfirmPassword={() => setShowConfirmPassword(p => !p)}
        />
      );
      case 4: return <ReviewStep formData={formData} />;
      default: return null;
    }
  };

  // ─── Stepper ──────────────────────────────────────────────────────────────
  const renderStepper = (showLabels: boolean) => (
    <Stepper activeStep={activeStep} alternativeLabel>
      {STEPS.map((step, index) => (
        <Step key={step.label}>
          <StepLabel
            StepIconComponent={() => (
              <Box sx={{
                width: showLabels ? 32 : 28,
                height: showLabels ? 32 : 28,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: index < activeStep ? BRAND.green : index === activeStep ? BRAND.primary : '#e2e8f0',
                color: index <= activeStep ? '#ffffff' : '#94a3b8',
                transition: 'all 0.3s ease',
                flexShrink: 0,
                boxShadow: index === activeStep ? `0 0 0 3px ${alpha(BRAND.primary, 0.18)}` : index < activeStep ? `0 0 0 3px ${alpha(BRAND.green, 0.15)}` : 'none',
              }}>
                {index < activeStep
                  ? <CheckCircle sx={{ fontSize: showLabels ? 18 : 15 }} />
                  : React.cloneElement(step.stepIcon, { sx: { fontSize: showLabels ? 16 : 14 } })}
              </Box>
            )}
            sx={{
              '& .MuiStepLabel-label': {
                display: showLabels ? { xs: 'none', sm: 'block' } : 'none',
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

  // ─── Step header (icon box + title + subtitle) — mirrors Login form header ─
  const stepHeader = (
    <Box display="flex" flexDirection="column" mb={4}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2,
        bgcolor: alpha(BRAND.primary, 0.1),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mb: 2,
      }}>
        {React.cloneElement(STEPS[activeStep].icon, { sx: { color: BRAND.primary, fontSize: 22 } })}
      </Box>
      <Typography variant="h5" fontWeight={700} color="#0f172a" letterSpacing="-0.3px">
        {STEPS[activeStep].title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {STEPS[activeStep].subtitle}
      </Typography>
    </Box>
  );

  // ─── Nav buttons ──────────────────────────────────────────────────────────
  const navButtons = (
    <>
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 600,
            px: 3, py: 1.5, fontSize: '1rem', borderWidth: 1.5,
            borderColor: '#e2e8f0', color: '#64748b',
            '&:hover': { borderWidth: 1.5, borderColor: BRAND.primary, backgroundColor: alpha(BRAND.primary, 0.04), color: BRAND.primary },
            '&:disabled': { borderColor: '#e2e8f0', color: '#cbd5e1' },
          }}
        >
          Back
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained" endIcon={loading ? undefined : <ArrowForward />}
            onClick={handleNext} disabled={loading}
            sx={{
              flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700,
              py: 1.5, fontSize: '1rem', bgcolor: BRAND.primary,
              boxShadow: '0 4px 14px rgba(25,118,210,0.3)',
              '&:hover': { bgcolor: BRAND.primaryHover, boxShadow: '0 6px 20px rgba(25,118,210,0.4)', transform: 'translateY(-1px)' },
              '&:disabled': { bgcolor: alpha(BRAND.primary, 0.4), color: 'rgba(255,255,255,0.7)' },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Continue'}
          </Button>
        ) : (
          <Button
            variant="contained" endIcon={loading ? undefined : <CheckCircle />}
            onClick={handleSubmit} disabled={loading}
            sx={{
              flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700,
              py: 1.5, fontSize: '1rem', bgcolor: BRAND.green,
              boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
              '&:hover': { bgcolor: BRAND.greenHover, boxShadow: '0 6px 20px rgba(16,185,129,0.35)', transform: 'translateY(-1px)' },
              '&:disabled': { bgcolor: '#cbd5e1', color: '#64748b' },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
          </Button>
        )}
      </Stack>

      <Typography variant="body2" textAlign="center" color="text.secondary" mt={3}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" fontWeight={600} sx={{ color: BRAND.primary }}>
          Sign In
        </Link>
      </Typography>
      <Typography variant="body2" textAlign="center" mt={1.5}>
        <Link component={RouterLink} to="/" sx={{ color: 'text.disabled', fontSize: '0.8125rem' }}>
          Back to Home
        </Link>
      </Typography>
    </>
  );

  // ─── Error alert ──────────────────────────────────────────────────────────
  const errorAlert = error ? (
    <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2.5, borderRadius: 2 }}>
      {error}
    </Alert>
  ) : null;

  // ─── Form content (shared between desktop + mobile) ───────────────────────
  const formContent = (
    <Box width="100%" maxWidth={380}>
      {stepHeader}
      {errorAlert}
      {renderStepContent(activeStep)}
      {navButtons}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: BRAND.panelBg }}>

      {/* LEFT BRANDING PANEL */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: { md: 6, lg: 10 },
        py: 8,
        background: `linear-gradient(160deg, ${BRAND.panelBg} 0%, ${BRAND.panelBg2} 60%, ${BRAND.panelBg} 100%)`,
        borderRight: `1px solid ${BRAND.accentBorder}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(25,118,210,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <DinoLogo size={72} animated />
        <Typography variant="h4" fontWeight={700} color="white" mt={3} textAlign="center" sx={{ letterSpacing: '-0.5px' }}>
          Join Dino Today
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.55)" mt={1.5} textAlign="center" maxWidth={300} lineHeight={1.6}>
          Start your digital transformation journey
        </Typography>
        <Divider sx={{ width: 48, borderColor: BRAND.accentBorder, my: 4 }} />
        <Box display="flex" flexDirection="column" gap={2} width="100%" maxWidth={300}>
          {APP_FEATURES.map(({ icon: Icon, text }, i) => (
            <Box key={i} display="flex" alignItems="center" gap={2} sx={{ px: 2, py: 1.25, borderRadius: 2, bgcolor: BRAND.accent, border: `1px solid ${BRAND.accentBorder}` }}>
              <Icon sx={{ fontSize: 20, color: BRAND.primaryLight, flexShrink: 0 }} />
              <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight={500}>{text}</Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="caption" color="rgba(255,255,255,0.25)" mt={6} textAlign="center">
          Dino &copy; {new Date().getFullYear()}
        </Typography>
      </Box>

      {/* RIGHT FORM PANEL (desktop) */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        width: { md: 480, lg: 520 },
        flexShrink: 0,
        bgcolor: '#ffffff',
        overflowY: 'auto',
        animation: 'authPanelIn 0.28s cubic-bezier(0.22,1,0.36,1) both',
        '@keyframes authPanelIn': {
          from: { opacity: 0, transform: 'translateX(18px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
        ...scrollbarSx,
      }}>
        {/* Stepper pinned at top */}
        <Box sx={{ flexShrink: 0, px: { md: 5, lg: 6 }, pt: 3.5, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
          {renderStepper(true)}
        </Box>

        {/* Form — centred vertically in remaining space */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { md: 5, lg: 6 },
          py: 4,
        }}>
          {formContent}
        </Box>
      </Box>

      {/* MOBILE LAYOUT */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        bgcolor: '#ffffff',
        overflowY: 'auto',
        px: 3,
        py: 4,
        animation: 'authPanelIn 0.28s cubic-bezier(0.22,1,0.36,1) both',
        '@keyframes authPanelIn': {
          from: { opacity: 0, transform: 'translateX(18px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
        ...scrollbarSx,
      }}>
        <DinoLogo size={40} />
        <Typography variant="body2" color="#64748b" mt={1.5} mb={3}>
          Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep].label}
        </Typography>
        <Box sx={{ width: '100%', mb: 3 }}>
          {renderStepper(false)}
        </Box>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {formContent}
        </Box>
      </Box>

    </Box>
  );
};

export default RegisterPage;

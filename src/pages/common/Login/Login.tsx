import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Stack,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff, 
  Home,
  Business as BusinessIcon,
  AdminPanelSettings,
  CheckCircle,
  Speed,
  Security,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { DinoLogo } from '../../../components/ui';
import { isUser, isManager, isOwner } from '../../../types/auth/roles';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const successMessage = location.state?.message;

  // Auto-redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setFormData({ email: '', password: '' });
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Determine if this is a system user login (tab index 1)
      const isSystemUser = tabValue === 1;

      const response = await login(formData.email, formData.password, isSystemUser);
      
      // Determine redirect path based on user role
      const user = response?.user;
      let redirectPath = location.state?.from?.pathname || '/admin';
      
      if (user?.role) {
        // Get role name and type (handle both string and object)
        const roleName = typeof user.role === 'string' 
          ? user.role 
          : (user.role as any)?.name || user.role;
        
        const roleType = (user.role as any)?.role_type;
        
        // System User Login (role_type = 0)
        if (tabValue === 1 || roleType === 0) {
          // System users go to system dashboard
          if (roleName === 'Owner' || roleName === 'SuperAdmin') {
            redirectPath = '/system/dashboard';
          } else if (roleName === 'BillingManager') {
            redirectPath = '/system/billing';
          } else if (roleName === 'MarketingAgent') {
            redirectPath = '/system/registration';
          } else {
            redirectPath = '/system/dashboard';
          }
        } else {
          // Application users (role_type = 1) go to workspace dashboard
          if (isUser(roleName)) {
            redirectPath = '/admin/orders';
          } else if (isManager(roleName) || isOwner(roleName)) {
            redirectPath = '/admin/orders';
          } else {
            redirectPath = '/admin/orders';
          }
        }
      }
      
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <CheckCircle sx={{ fontSize: 20 }} />, text: 'Trusted by 500+ Businesses' },
    { icon: <Speed sx={{ fontSize: 20 }} />, text: 'Real-time Analytics' },
    { icon: <Security sx={{ fontSize: 20 }} />, text: 'Enterprise Security' },
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
              Welcome to Dino
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
              Digital Solutions for Modern Businesses
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

        {/* Mobile Logo */}
        {isMobile && (
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <DinoLogo size={48} animated={true} />
            <Typography
              variant="h4"
              sx={{
                color: '#0f172a',
                fontWeight: 800,
                mt: 2,
              }}
            >
              Welcome Back
            </Typography>
          </Box>
        )}

        {/* Form Container */}
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          {/* Header */}
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
                Sign In
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                }}
              >
                Enter your credentials to access your account
              </Typography>
            </Box>
          )}

          {/* Tabs */}
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                p: 0.5,
                minHeight: 48,
                '& .MuiTab-root': {
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  textTransform: 'none',
                  minHeight: 44,
                  borderRadius: 1.5,
                  '&.Mui-selected': {
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  },
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              <Tab 
                icon={<BusinessIcon sx={{ fontSize: 18 }} />} 
                iconPosition="start" 
                label="Business" 
              />
              <Tab 
                icon={<AdminPanelSettings sx={{ fontSize: 18 }} />} 
                iconPosition="start" 
                label="System User" 
              />
            </Tabs>
          </Box>

          {/* Alert Container - Fixed height to prevent layout shift */}
          <Box sx={{ minHeight: error || successMessage ? 'auto' : 0, mb: error || successMessage ? 3 : 0 }}>
            {/* Success Message */}
            {successMessage && (
              <Alert 
                severity="success" 
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: alpha('#10b981', 0.1),
                  color: '#059669',
                  border: `1px solid ${alpha('#10b981', 0.3)}`,
                  '& .MuiAlert-icon': {
                    color: '#10b981',
                  },
                }}
              >
                {successMessage}
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
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
          </Box>

          {/* Tab Description */}
          <Box sx={{ mb: 3, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              {tabValue === 0 
                ? 'For workspace owners, admins, and operators'
                : 'For Dinos platform administrators only'
              }
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#64748b', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1',
                    borderWidth: '1px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 0 3px rgba(15, 23, 42, 0.1)',
                    '& fieldset': {
                      borderColor: '#0f172a',
                      borderWidth: '1px',
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#0f172a',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#64748b', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      tabIndex={-1}
                      sx={{ color: '#64748b' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 4.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1',
                    borderWidth: '1px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 0 3px rgba(15, 23, 42, 0.1)',
                    '& fieldset': {
                      borderColor: '#0f172a',
                      borderWidth: '1px',
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#0f172a',
                  },
                },
              }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                py: 1.75,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                mb: 2,
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
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#ffffff' }} />
              ) : (
                'Sign In'
              )}
            </Button>


            {/* Register Link - Only for Business Login */}
            {tabValue === 0 && (
              <>
                <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                    }}
                  >
                    Don't have an account?{' '}
                    <Button 
                      variant="text" 
                      onClick={() => navigate('/register')}
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
                      Create Business Account
                    </Button>
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
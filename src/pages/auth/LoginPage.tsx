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
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Home } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DinoLogo from '../../components/DinoLogo';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const successMessage = location.state?.message;

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
      const response = await login(formData.email, formData.password);
      
      // Determine redirect path based on user role
      const user = response?.user;
      let redirectPath = location.state?.from?.pathname || '/admin';
      
      if (user?.role) {
        const userRole = user.role.toLowerCase();
        if (userRole === 'dino' || userRole === 'dinos') {
          redirectPath = '/admin/code';
        } else if (userRole === 'operator') {
          redirectPath = '/admin/orders';
        } else if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'super_admin') {
          redirectPath = '/admin/orders';
        }
      }
      
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 1, md: 1 },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 3,
          mb: 1,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
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
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              Home
            </Button>

            {/* Centered Content */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DinoLogo size={40} animated={true} />
              <Typography
                variant="h4"
                component="h1"
                fontWeight="700"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '2rem' },
                  color: 'text.primary',
                }}
              >
                Welcome Back
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
              Sign in to access your restaurant dashboard
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Form Content */}
      <Container maxWidth="sm" sx={{ flex: 1 }}>
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
          {/* Form Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              fontWeight="600"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.25rem' },
                color: 'text.primary',
                mb: 1,
              }}
            >
              Sign In
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8rem', sm: '1rem' },
                color: 'text.secondary',
              }}
            >
              Enter your credentials to continue
            </Typography>
          </Box>

          {/* Success Message from Registration */}
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 1,
                borderRadius: 1,
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
                mb: 1,
                borderRadius: 1,
              }}
            >
              {error}
            </Alert>
          )}

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
                    <Email sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
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
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
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
                py: 1,
                borderRadius: 1,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                mb: 1,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.8rem' }}
              >
                Don't have an account?{' '}
                <Button 
                  variant="text" 
                  onClick={() => navigate('/register')}
                  size="small"
                  sx={{
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Create Account
                </Button>
              </Typography>
            </Box>

            {/* Home Link - Mobile Only */}
            <Box sx={{ textAlign: 'center', mt: 1, display: { xs: 'block', sm: 'none' } }}>
              <Button
                variant="text"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                size="small"
                sx={{
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
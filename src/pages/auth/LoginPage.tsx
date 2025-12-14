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
import { isDinos, isOperator, isAdmin, isSuperAdmin } from '../../types/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const theme = useTheme();

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
        if (isDinos(user.role)) {
          redirectPath = '/admin/code';
        } else if (isOperator(user.role)) {
          redirectPath = '/admin/orders';
        } else if (isAdmin(user.role) || isSuperAdmin(user.role)) {
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
        backgroundColor: alpha(theme.palette.primary.main, 0.03),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          textAlign: 'center',
          mb: { xs: 4, md: 5 },
        }}
      >
        {/* Home Button - Top Right */}
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
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.25 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              },
            }}
          >
            Home
          </Button>
        </Box>

        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <DinoLogo size={48} animated={true} />
          <Typography
            variant="h3"
            component="h1"
            fontWeight="800"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              color: 'text.primary',
            }}
          >
            Welcome Back
          </Typography>
        </Box>
        
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '1rem', sm: '1.125rem' },
            color: 'text.secondary',
            fontWeight: 400,
          }}
        >
          Sign in to access your restaurant dashboard
        </Typography>
      </Box>

      {/* Form Content */}
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: '2px solid',
            borderColor: 'divider',
            boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          {/* Form Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              fontWeight="700"
              sx={{
                fontSize: { xs: '1.375rem', sm: '1.5rem' },
                color: 'text.primary',
                mb: 1,
              }}
            >
              Sign In
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.9375rem', sm: '1rem' },
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
                mb: 3,
                borderRadius: 2,
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
                mb: 3,
                borderRadius: 2,
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
                    <Email sx={{ color: 'text.secondary', fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
                  height: { xs: 52, sm: 56 },
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
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
                    <Lock sx={{ color: 'text.secondary', fontSize: 22 }} />
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
                  borderRadius: 2,
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
                  height: { xs: 52, sm: 56 },
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
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
                py: { xs: 1.5, sm: 1.75 },
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: { xs: '1rem', sm: '1.0625rem' },
                mb: 3,
                minHeight: { xs: 48, sm: 52 },
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
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
                sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}
              >
                Don't have an account?{' '}
                <Button 
                  variant="text" 
                  onClick={() => navigate('/register')}
                  sx={{
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    textTransform: 'none',
                    fontWeight: 700,
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create Account
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;

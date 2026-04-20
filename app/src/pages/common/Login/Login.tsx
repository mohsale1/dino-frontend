import React, { useState, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Divider, Link,
} from '@mui/material';
import {
  Visibility, VisibilityOff,
  QrCode2, Dashboard, Store, CheckCircleOutline, LockOutlined,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { normalizeRole, ROLES } from '../../../types/auth/roles';
import DinoLogo from '../../../components/ui/DinoLogo';
import { PageTransitionLoader } from '../../../components/ui/PageTransitionLoader';

const BRAND = {
  primary:      '#1976D2',
  primaryHover: '#1565C0',
  primaryLight: '#42A5F5',
  panelBg:      '#0d1b2e',
  panelBg2:     '#112240',
  accent:       'rgba(66,165,245,0.15)',
  accentBorder: 'rgba(66,165,245,0.25)',
};

const APP_FEATURES = [
  { icon: CheckCircleOutline, text: 'Trusted by 500+ businesses' },
  { icon: QrCode2,            text: 'QR-based ordering system' },
  { icon: Dashboard,          text: 'Real-time analytics dashboard' },
  { icon: Store,              text: 'Full catalog & venue management' },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '&.Mui-focused fieldset': { borderColor: BRAND.primary },
  },
  '& label.Mui-focused': { color: BRAND.primary },
};

const getDestination = (user: any): string => {
  const role = normalizeRole(user?.role);
  return role === ROLES.USER ? '/admin/orders' : '/admin/dashboard';
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user: authUser } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [navigating,   setNavigating]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // Redirect already-authenticated users (e.g. returning with a valid session)
  React.useEffect(() => {
    if (isAuthenticated && authUser) {
      navigate(getDestination(authUser), { replace: true });
    }
  }, [isAuthenticated, authUser, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { user: loggedInUser } = await login(email.trim(), password, false);
      setNavigating(true);
      navigate(getDestination(loggedInUser), { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigate]);

  const form = (
    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <TextField
        label="Email Address"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        fullWidth
        required
        autoComplete="email"
        autoFocus
        disabled={loading}
        sx={fieldSx}
      />
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        fullWidth
        required
        autoComplete="current-password"
        disabled={loading}
        sx={fieldSx}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(p => !p)}
                edge="end"
                disabled={loading}
                sx={{ color: BRAND.primary }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{
          mt: 0.5,
          py: 1.5,
          bgcolor: BRAND.primary,
          fontWeight: 600,
          fontSize: '0.95rem',
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: '0 4px 14px rgba(25,118,210,0.35)',
          '&:hover': { bgcolor: BRAND.primaryHover },
          '&.Mui-disabled': { bgcolor: 'rgba(25,118,210,0.4)', color: 'rgba(255,255,255,0.7)' },
        }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
      </Button>
    </Box>
  );

  return (
    <>
    <PageTransitionLoader visible={navigating} message="Signing in..." />
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: BRAND.panelBg }}>

      {/* LEFT BRANDING PANEL (desktop) */}
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
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(25,118,210,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <DinoLogo size={72} animated />
        <Typography variant="h4" fontWeight={700} color="white" mt={3} textAlign="center" sx={{ letterSpacing: '-0.5px' }}>
          Welcome to Dino
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.55)" mt={1.5} textAlign="center" maxWidth={300} lineHeight={1.6}>
          Digital solutions for modern businesses
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
        justifyContent: 'center',
        alignItems: 'center',
        width: { md: 460, lg: 500 },
        px: { md: 6, lg: 7 },
        bgcolor: '#ffffff',
        overflow: 'hidden',
      }}>
        <Box width="100%" maxWidth={380}>
          <Box display="flex" flexDirection="column" mb={4}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(25,118,210,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <LockOutlined sx={{ color: BRAND.primary, fontSize: 22 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" letterSpacing="-0.3px">Welcome back</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Sign in to your business account</Typography>
          </Box>
          {form}
          <Typography variant="body2" textAlign="center" color="text.secondary" mt={3}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" fontWeight={600} sx={{ color: BRAND.primary }}>
              Create Business Account
            </Link>
          </Typography>
          <Typography variant="body2" textAlign="center" mt={1.5}>
            <Link component={RouterLink} to="/" sx={{ color: 'text.disabled', fontSize: '0.8125rem' }}>
              Back to Home
            </Link>
          </Typography>
        </Box>
      </Box>

      {/* MOBILE LAYOUT */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#ffffff',
        overflowY: 'auto',
        px: 3,
        py: 5,
      }}>
        <Box sx={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <DinoLogo size={40} />
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(25,118,210,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4, mb: 1.5 }}>
            <LockOutlined sx={{ color: BRAND.primary, fontSize: 22 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="#0f172a" letterSpacing="-0.3px" textAlign="center">
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5} mb={3.5} textAlign="center">
            Sign in to your business account
          </Typography>
          <Box sx={{ width: '100%' }}>
            {form}
          </Box>
          <Typography variant="body2" textAlign="center" color="text.secondary" mt={3}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" fontWeight={600} sx={{ color: BRAND.primary }}>
              Create Business Account
            </Link>
          </Typography>
          <Typography variant="body2" textAlign="center" mt={1.5}>
            <Link component={RouterLink} to="/" sx={{ color: 'text.disabled', fontSize: '0.8125rem' }}>
              Back to Home
            </Link>
          </Typography>
        </Box>
      </Box>

    </Box>
    </>
  );
};

export default LoginPage;

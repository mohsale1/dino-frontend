import React, { useState, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Link,
} from '@mui/material';
import {
  Visibility, VisibilityOff, CheckCircle,
  QrCode2, Dashboard, Store,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import DinoLogo from '../../../components/ui/DinoLogo';

const APP_FEATURES = [
  { icon: <CheckCircle sx={{ fontSize: 20 }} />, text: 'Trusted by 500+ Businesses' },
  { icon: <QrCode2 sx={{ fontSize: 20 }} />, text: 'QR-based ordering system' },
  { icon: <Dashboard sx={{ fontSize: 20 }} />, text: 'Real-time analytics dashboard' },
  { icon: <Store sx={{ fontSize: 20 }} />, text: 'Full catalog & venue management' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password, false);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigate]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
      {/* Left branding panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 6,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}>
        <DinoLogo size={56} animated={true} />
        <Typography variant="h4" fontWeight={700} color="white" mt={3} textAlign="center">
          Welcome to Dino
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.6)" mt={1} textAlign="center" maxWidth={320}>
          Digital solutions for modern businesses
        </Typography>
        <Box mt={5} display="flex" flexDirection="column" gap={2} width="100%" maxWidth={320}>
          {APP_FEATURES.map((f, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ color: '#10b981' }}>{f.icon}</Box>
              <Typography variant="body2" color="rgba(255,255,255,0.75)">{f.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right form panel */}
      <Box sx={{
        flex: { xs: 1, md: 'none' },
        width: { md: 480 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, sm: 6 },
        bgcolor: '#ffffff',
      }}>
        <Box width="100%" maxWidth={380}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box display={{ xs: 'flex', md: 'none' }}><DinoLogo size={36} /></Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="#0f172a">Sign In</Typography>
                <Typography variant="body2" color="text.secondary">Business account</Typography>
              </Box>
            </Box>
            <Button variant="text" size="small" onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
              Home
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end" disabled={loading}>
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
                mt: 1,
                py: 1.5,
                bgcolor: '#10b981',
                '&:hover': { bgcolor: '#059669' },
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>

            <Typography variant="body2" textAlign="center" color="text.secondary" mt={1}>
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" fontWeight={600} color="#10b981">
                Create Business Account
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
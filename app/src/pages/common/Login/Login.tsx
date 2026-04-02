import React, { useState, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Divider, Chip, Link,
} from '@mui/material';
import {
  Visibility, VisibilityOff,
  QrCode2, Dashboard, Store, CheckCircleOutline, LockOutlined,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import DinoLogo from '../../../components/ui/DinoLogo';

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

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

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

  // ── Shared form ───────────────────────────────────────────────────────────────
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
        fullWidth required autoComplete="email" autoFocus
        disabled={loading}
        sx={fieldSx}
      />

      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        fullWidth required autoComplete="current-password"
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
          mt: 0.5, py: 1.5,
          bgcolor: BRAND.primary,
          fontWeight: 600,
          fontSize: '0.95rem',
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
          '&:hover:not(:disabled)': { bgcolor: BRAND.primaryHover, boxShadow: '0 6px 20px rgba(16,185,129,0.45)' },
          '&:disabled': { bgcolor: 'rgba(16,185,129,0.4)' },
        }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: BRAND.panelBg }}>

      {/* ════════════════════════════════════════════════════════════════════════
          LEFT BRANDING PANEL — desktop only (md+)
      ════════════════════════════════════════════════════════════════════════ */}
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
        {/* Subtle glow orb */}
        <Box sx={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
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
            <Box
              key={i}
              display="flex" alignItems="center" gap={2}
              sx={{ px: 2, py: 1.25, borderRadius: 2, bgcolor: BRAND.accent, border: `1px solid ${BRAND.accentBorder}` }}
            >
              <Icon sx={{ fontSize: 20, color: BRAND.primaryLight, flexShrink: 0 }} />
              <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight={500}>{text}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="caption" color="rgba(255,255,255,0.25)" mt={6} textAlign="center">
          Dino &copy; {new Date().getFullYear()}
        </Typography>
      </Box>

      {/* ════════════════════════════════════════════════════════════════════════
          RIGHT FORM PANEL — desktop (md+)
      ════════════════════════════════════════════════════════════════════════ */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: { md: 460, lg: 500 },
        px: { md: 6, lg: 7 },
        py: 8,
        bgcolor: '#ffffff',
        minHeight: '100vh',
      }}>
        <Box width="100%" maxWidth={380}>
          {/* Desktop title */}
          <Box display="flex" flexDirection="column" mb={4}>
            <Box sx={{
              width: 44, height: 44, borderRadius: 2,
              bgcolor: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
            }}>
              <LockOutlined sx={{ color: BRAND.primary, fontSize: 22 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" letterSpacing="-0.3px">
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Sign in to your business account
            </Typography>
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

      {/* ════════════════════════════════════════════════════════════════════════
          MOBILE LAYOUT — full-page dark header + white card form
      ════════════════════════════════════════════════════════════════════════ */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        bgcolor: BRAND.panelBg,
      }}>

        {/* Dark branded header */}
        <Box sx={{
          position: 'relative',
          overflow: 'hidden',
          px: 3,
          pt: 6,
          pb: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: `linear-gradient(160deg, ${BRAND.panelBg} 0%, ${BRAND.panelBg2} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -60, right: -40,
            width: 220, height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -40, left: -30,
            width: 180, height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}>
          {/* Grid overlay */}
          <Box sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }} />

          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <DinoLogo size={56} animated />

            <Typography variant="h5" fontWeight={700} color="white" mt={2.5} textAlign="center" sx={{ letterSpacing: '-0.3px' }}>
              Welcome to Dino
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.5)" mt={1} textAlign="center" maxWidth={260} lineHeight={1.6}>
              Digital solutions for modern businesses
            </Typography>

            {/* Feature chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3, justifyContent: 'center' }}>
              {APP_FEATURES.map(({ icon: Icon, text }, i) => (
                <Chip
                  key={i}
                  icon={<Icon sx={{ fontSize: '14px !important', color: `${BRAND.primaryLight} !important` }} />}
                  label={text}
                  size="small"
                  sx={{
                    bgcolor: BRAND.accent,
                    border: `1px solid ${BRAND.accentBorder}`,
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    height: 28,
                    '& .MuiChip-icon': { ml: 0.75 },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* White form card — pulls up over the dark header */}
        <Box sx={{
          flex: 1,
          bgcolor: '#ffffff',
          borderRadius: '24px 24px 0 0',
          px: { xs: 3, sm: 5 },
          pt: 4,
          pb: 5,
          mt: -2,
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        }}>
          {/* Form header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2,
              bgcolor: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <LockOutlined sx={{ color: BRAND.primary, fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0f172a" lineHeight={1.2}>
                Sign In
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Business account
              </Typography>
            </Box>
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

    </Box>
  );
};

export default LoginPage;
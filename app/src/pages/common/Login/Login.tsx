import React, { useState, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Chip,
} from '@mui/material';
import {
  Visibility, VisibilityOff,
  QrCode2, Dashboard, Store, CheckCircleOutline, LockOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { normalizeRole, ROLES } from '../../../types/auth/roles';
import DinoLogo from '../../../components/ui/DinoLogo';
import { PageTransitionLoader } from '../../../components/ui/PageTransitionLoader';
import { APP_CONFIG } from '../../../constants/app';

// ── Design tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  primary:      '#1976D2',
  primaryHover: '#1565C0',
  primaryLight: '#42A5F5',
  panelBg:      '#0d1b2e',
  panelBg2:     '#112240',
  accent:       'rgba(66,165,245,0.15)',
  accentBorder: 'rgba(66,165,245,0.25)',
  textPrimary:  '#1C1C1E',
  textMuted:    '#666666',
};

const APP_FEATURES = [
  { icon: CheckCircleOutline, text: 'Trusted by 500+ businesses' },
  { icon: QrCode2,            text: 'QR-based ordering system' },
  { icon: Dashboard,          text: 'Real-time analytics dashboard' },
  { icon: Store,              text: 'Full catalog & venue management' },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#cccccc' },
    '&.Mui-focused fieldset': { borderColor: BRAND.primary, borderWidth: 1 },
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

  // ── Shared form ────────────────────────────────────────────────────────────
  const form = (
    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.875rem' }} onClose={() => setError(null)}>
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
                size="small"
                sx={{ color: BRAND.textMuted, '&:hover': { color: BRAND.textPrimary } }}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
        disableElevation
        sx={{
          mt: 0.5,
          py: 1.5,
          bgcolor: BRAND.primary,
          fontWeight: 600,
          fontSize: '0.9375rem',
          borderRadius: '8px',
          textTransform: 'none',
          letterSpacing: 'normal',
          boxShadow: '0 4px 14px rgba(25,118,210,0.35)',
          '&:hover:not(:disabled)': { bgcolor: BRAND.primaryHover },
          '&:disabled': { bgcolor: 'rgba(25,118,210,0.35)', color: 'rgba(255,255,255,0.7)' },
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

        {/* ── LEFT BRANDING PANEL — desktop only (md+) ── */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { md: 6, lg: 10 },
          py: 8,
          background: `linear-gradient(160deg, ${BRAND.panelBg} 0%, ${BRAND.panelBg2} 55%, ${BRAND.panelBg} 100%)`,
          borderRight: `1px solid ${BRAND.accentBorder}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Radial glow */}
          <Box sx={{
            position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
            width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25,118,210,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          {/* Subtle grid */}
          <Box sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />

          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 320 }}>
            <DinoLogo size={68} animated />
            <Typography variant="h4" fontWeight={700} color="white" mt={3} textAlign="center" sx={{ letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Welcome to {APP_CONFIG.NAME}
            </Typography>
            <Typography variant="body2" mt={1.5} textAlign="center" lineHeight={1.7}
              sx={{ color: 'rgba(255,255,255,0.55)', maxWidth: 280 }}>
              Digital solutions for modern businesses
            </Typography>
            <Box sx={{ width: 40, height: 2, bgcolor: BRAND.accentBorder, borderRadius: 1, my: 4 }} />
            <Box display="flex" flexDirection="column" gap={1.5} width="100%">
              {APP_FEATURES.map(({ icon: Icon, text }, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1.75} sx={{ px: 2, py: 1.25, borderRadius: '8px', bgcolor: BRAND.accent, border: `1px solid ${BRAND.accentBorder}` }}>
                  <Icon sx={{ fontSize: 18, color: BRAND.primaryLight, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', fontWeight: 500, fontSize: '0.875rem' }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.22)', mt: 6, textAlign: 'center', display: 'block' }}>
              {APP_CONFIG.copyright()}
            </Typography>
          </Box>
        </Box>

        {/* ── RIGHT FORM PANEL — desktop (md+) ── */}
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
              <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                <LockOutlined sx={{ color: BRAND.primary, fontSize: 22 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color={BRAND.textPrimary} sx={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Welcome back
              </Typography>
              <Typography variant="body2" sx={{ color: BRAND.textMuted, mt: 0.75, fontSize: '0.875rem' }}>
                Sign in to your business account
              </Typography>
            </Box>
            {form}
            <Typography variant="caption" sx={{ color: '#cccccc', display: 'block', textAlign: 'center', mt: 4, fontSize: '0.75rem' }}>
              Authorised users only. Access attempts are monitored.
            </Typography>
          </Box>
        </Box>

        {/* ── MOBILE LAYOUT ── */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', height: '100vh', overflow: 'hidden', width: '100%', bgcolor: BRAND.panelBg }}>
          {/* Dark top section */}
          <Box sx={{
            flexShrink: 0, position: 'relative', overflow: 'hidden',
            px: 3, pt: 4, pb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: `linear-gradient(160deg, ${BRAND.panelBg} 0%, ${BRAND.panelBg2} 100%)`,
            '&::before': {
              content: '""', position: 'absolute', top: -60, right: -40,
              width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(25,118,210,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            },
          }}>
            <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <DinoLogo size={48} animated />
              <Typography variant="h6" fontWeight={700} color="white" mt={1.5} textAlign="center" sx={{ letterSpacing: '-0.3px' }}>
                Welcome to {APP_CONFIG.NAME}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, textAlign: 'center', maxWidth: 260, lineHeight: 1.5, display: 'block' }}>
                Digital solutions for modern businesses
              </Typography>
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
                      color: 'rgba(255,255,255,0.82)',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      height: 26,
                      '& .MuiChip-icon': { ml: 0.5 },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* White bottom sheet */}
          <Box sx={{
            flex: 1,
            bgcolor: '#ffffff',
            borderRadius: '20px 20px 0 0',
            px: { xs: 3, sm: 5 },
            pt: 3.5,
            pb: 3,
            mt: -2,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.12)', borderRadius: 2 },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LockOutlined sx={{ color: BRAND.primary, fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color={BRAND.textPrimary} lineHeight={1.2}>Sign In</Typography>
                <Typography variant="caption" sx={{ color: BRAND.textMuted }}>Business account access</Typography>
              </Box>
            </Box>
            {form}
            <Typography variant="caption" sx={{ color: '#cccccc', display: 'block', textAlign: 'center', mt: 3, fontSize: '0.75rem' }}>
              Authorised users only. Access attempts are monitored.
            </Typography>
          </Box>
        </Box>

      </Box>
    </>
  );
};

export default LoginPage;

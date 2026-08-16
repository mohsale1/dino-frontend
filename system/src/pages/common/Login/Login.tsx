import React, { useState, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Chip,
} from '@mui/material';
import {
  Visibility, VisibilityOff, AdminPanelSettings,
  Security, ManageAccounts, Assessment, LockOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { APP_CONFIG } from '../../../constants/app';
import { getFirstAccessibleRoute } from '../../../utils/auth';
import DinoLogo from '../../../components/ui/DinoLogo';
import { PageTransitionLoader } from '../../../components/ui/PageTransitionLoader';

// ── Design tokens aligned to Vanguard UI ──────────────────────────────────────
const T = {
  primary: '#00A6CA',
  primaryHover: '#005F8D',
  primaryLight: '#CCEDF4',
  panelBg: '#102b3d',   // blue-900
  panelBg2: '#004364',   // blue-700
  accent: 'rgba(0,166,202,0.15)',
  accentBorder: 'rgba(0,166,202,0.25)',
  textPrimary: '#1C1C1E',
  textMuted: '#666666',
};

const SYSTEM_FEATURES = [
  { icon: AdminPanelSettings, text: 'Full system control' },
  { icon: ManageAccounts, text: 'User & workspace management' },
  { icon: Assessment, text: 'Billing & registration oversight' },
  { icon: Security, text: 'Roles & permissions management' },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#cccccc' },
    '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 1 },
  },
  '& label.Mui-focused': { color: T.primary },
};

const SystemLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, userPermissions } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already authenticated (e.g. page refresh on /login) — redirect using
  // settled userPermissions from state. Only fires when permissions are loaded.
  React.useEffect(() => {
    if (isAuthenticated && userPermissions) {
      navigate(getFirstAccessibleRoute(userPermissions), { replace: true });
    }
  }, [isAuthenticated, userPermissions, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // login() returns the resolved permissions directly — no stale state race.
      const { permissions } = await login(email.trim(), password, true);
      setNavigating(true);
      navigate(getFirstAccessibleRoute(permissions), { replace: true });
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
                sx={{ color: T.textMuted, '&:hover': { color: T.textPrimary } }}
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
          bgcolor: T.primary,
          fontWeight: 600,
          fontSize: '0.9375rem',
          borderRadius: '8px',
          textTransform: 'none',
          letterSpacing: 'normal',
          '&:hover:not(:disabled)': { bgcolor: T.primaryHover },
          '&:disabled': { bgcolor: 'rgba(0,166,202,0.35)', color: 'rgba(255,255,255,0.7)' },
        }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In to System'}
      </Button>
    </Box>
  );

  return (
    <>
      <PageTransitionLoader visible={navigating} message="Signing in to System..." />

      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: T.panelBg }}>

        {/* ── LEFT BRANDING PANEL — desktop only (md+) ── */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { md: 6, lg: 10 },
          py: 8,
          background: `linear-gradient(160deg, ${T.panelBg} 0%, ${T.panelBg2} 55%, ${T.panelBg} 100%)`,
          borderRight: `1px solid ${T.accentBorder}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
            width: 340, height: 340, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(0,166,202,0.10) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />

          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 320 }}>
            <DinoLogo size={68} animated />
            <Typography variant="h4" fontWeight={700} color="white" mt={3} textAlign="center" sx={{ letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Administration
            </Typography>
            <Typography variant="body2" mt={1.5} textAlign="center" lineHeight={1.7}
              sx={{ color: 'rgba(255,255,255,0.55)', maxWidth: 280 }}>
              Secure access portal for authorised 
            </Typography>
            <Box sx={{ width: 40, height: 2, bgcolor: T.accentBorder, borderRadius: 1, my: 4 }} />
            <Box display="flex" flexDirection="column" gap={1.5} width="100%">
              {SYSTEM_FEATURES.map(({ icon: Icon, text }, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1.75} sx={{ px: 2, py: 1.25, borderRadius: '8px', bgcolor: T.accent, border: `1px solid ${T.accentBorder}` }}>
                  <Icon sx={{ fontSize: 18, color: T.primary, flexShrink: 0 }} />
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
              <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: 'rgba(0,166,202,0.08)', border: '1px solid rgba(0,166,202,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                <LockOutlined sx={{ color: T.primary, fontSize: 22 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color={T.textPrimary} sx={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Welcome back
              </Typography>
              <Typography variant="body2" sx={{ color: T.textMuted, mt: 0.75, fontSize: '0.875rem' }}>
                Sign in to your administrator account
              </Typography>
            </Box>
            {form}
            <Typography variant="caption" sx={{ color: '#cccccc', display: 'block', textAlign: 'center', mt: 4, fontSize: '0.75rem' }}>
              Restricted access. Unauthorised login attempts are logged.
            </Typography>
          </Box>
        </Box>

        {/* ── MOBILE LAYOUT ── */}
        <Box sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          bgcolor: T.panelBg,
        }}>
          {/* Dark branded header */}
          <Box sx={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            pt: 5,
            pb: 4,
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(160deg, ${T.panelBg} 0%, ${T.panelBg2} 100%)`,
          }}>
            {/* Radial glow */}
            <Box sx={{
              position: 'absolute', top: -40, right: -40,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(25,118,210,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            {/* Dot grid */}
            <Box sx={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
            }} />
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <DinoLogo size={48} animated />
              <Typography variant="h6" fontWeight={700} color="white" mt={1.5} textAlign="center" sx={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Welcome back
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, textAlign: 'center', display: 'block' }}>
                Sign in to your {APP_CONFIG.NAME} account
              </Typography>
            </Box>
          </Box>

          {/* White form card */}
          <Box sx={{
            flex: 1,
            bgcolor: '#ffffff',
            borderRadius: '20px 20px 0 0',
            mt: -1.5,
            px: { xs: 2.5, sm: 4 },
            pt: 3,
            pb: 3,
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LockOutlined sx={{ color: T.primary, fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color={T.textPrimary} lineHeight={1.2}>Sign In</Typography>
                <Typography variant="caption" sx={{ color: T.textMuted }}>Enter your credentials below</Typography>
              </Box>
            </Box>
            {form}
            <Typography variant="caption" sx={{ color: '#cccccc', display: 'block', textAlign: 'center', mt: 2, fontSize: '0.75rem' }}>
              Authorised users only. Access attempts are monitored.
            </Typography>
          </Box>
        </Box>


      </Box>
    </>
  );
};


export default SystemLoginPage;

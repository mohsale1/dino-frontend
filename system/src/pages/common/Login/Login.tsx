import React, { useState, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Divider, Chip,
} from '@mui/material';
import {
  Visibility, VisibilityOff, AdminPanelSettings,
  Security, ManageAccounts, Assessment, LockOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
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

const SYSTEM_FEATURES = [
  { icon: AdminPanelSettings, text: 'Full system control' },
  { icon: ManageAccounts,     text: 'User & workspace management' },
  { icon: Assessment,         text: 'Billing & registration oversight' },
  { icon: Security,           text: 'Roles & permissions management' },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '&.Mui-focused fieldset': { borderColor: BRAND.primary },
  },
  '& label.Mui-focused': { color: BRAND.primary },
};

const SystemLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [navigating,   setNavigating]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/system/dashboard', { replace: true });
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
      await login(email.trim(), password, true);
      setNavigating(true);
      navigate('/system/dashboard', { replace: true });
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
              <IconButton onClick={() => setShowPassword(p => !p)} edge="end" disabled={loading} sx={{ color: BRAND.primary }}>
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
          boxShadow: '0 4px 14px rgba(25,118,210,0.35)',
          '&:hover:not(:disabled)': { bgcolor: BRAND.primaryHover },
          '&:disabled': { bgcolor: 'rgba(25,118,210,0.4)' },
        }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In to System'}
      </Button>
    </Box>
  );

  return (
    <>
    <PageTransitionLoader visible={navigating} message="Signing in to System..." />
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: BRAND.panelBg }}>

      {/* LEFT BRANDING PANEL — desktop only (md+) */}
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
        <Box sx={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,165,245,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <DinoLogo size={72} animated />

        <Typography variant="h4" fontWeight={700} color="white" mt={3} textAlign="center" sx={{ letterSpacing: '-0.5px' }}>
          System Administration
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.55)" mt={1.5} textAlign="center" maxWidth={300} lineHeight={1.6}>
          Secure access portal for authorised system administrators
        </Typography>

        <Divider sx={{ width: 48, borderColor: BRAND.accentBorder, my: 4 }} />

        <Box display="flex" flexDirection="column" gap={2} width="100%" maxWidth={300}>
          {SYSTEM_FEATURES.map(({ icon: Icon, text }, i) => (
            <Box key={i} display="flex" alignItems="center" gap={2} sx={{ px: 2, py: 1.25, borderRadius: 2, bgcolor: BRAND.accent, border: `1px solid ${BRAND.accentBorder}` }}>
              <Icon sx={{ fontSize: 20, color: BRAND.primaryLight, flexShrink: 0 }} />
              <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight={500}>{text}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="caption" color="rgba(255,255,255,0.25)" mt={6} textAlign="center">
          Dino System &copy; {new Date().getFullYear()}
        </Typography>
      </Box>

      {/* RIGHT FORM PANEL — desktop (md+) */}
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
            <Typography variant="h5" fontWeight={700} color="#0d1b2e" letterSpacing="-0.3px">Welcome back</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Sign in to your administrator account</Typography>
          </Box>

          {form}

          <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={4}>
            Restricted access. Unauthorised login attempts are logged.
          </Typography>
        </Box>
      </Box>

      {/* MOBILE LAYOUT — dark header + white card */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        width: '100%',
        bgcolor: BRAND.panelBg,
      }}>
        {/* Dark branded header — compact, flexShrink: 0 */}
        <Box sx={{
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
            top: -60, right: -40,
            width: 220, height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(66,165,245,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}>
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <DinoLogo size={48} animated />
            <Typography variant="h6" fontWeight={700} color="white" mt={1.5} textAlign="center" sx={{ letterSpacing: '-0.3px' }}>
              System Administration
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.5)" mt={0.5} textAlign="center" maxWidth={260} lineHeight={1.5}>
              Secure access for authorised administrators
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2, justifyContent: 'center' }}>
              {SYSTEM_FEATURES.map(({ icon: Icon, text }, i) => (
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
          </Box>
        </Box>

        {/* White form card */}
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
          '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: 2 },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(25,118,210,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LockOutlined sx={{ color: BRAND.primary, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0d1b2e" lineHeight={1.2}>Sign In</Typography>
              <Typography variant="caption" color="text.secondary">Administrator access only</Typography>
            </Box>
          </Box>

          {form}

          <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={3}>
            Restricted access. Unauthorised login attempts are logged.
          </Typography>
        </Box>
      </Box>

    </Box>
    </>
  );
};

export default SystemLoginPage;

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  InputAdornment,
  IconButton,
  Divider,
  LinearProgress,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  CalendarToday,
  CheckCircle,
  Cancel,
  ShieldOutlined,
  PersonOutlined,
  BadgeOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { authService } from '../../services/auth/auth';

// ─── Brand ───────────────────────────────────────────────────────────────────
const BRAND = {
  primary:      '#1976D2',
  primaryHover: '#1565C0',
  primaryLight: '#42A5F5',
  primaryBg:    'rgba(25,118,210,0.08)',
  primaryBorder:'rgba(25,118,210,0.2)',
};

// ─── Password strength ────────────────────────────────────────────────────────
interface StrengthResult {
  score: number;       // 0–4
  label: string;
  color: string;
}

function getPasswordStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password))   score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(score, 4);
  const map: Record<number, { label: string; color: string }> = {
    0: { label: '',          color: '#e2e8f0' },
    1: { label: 'Weak',      color: '#ef4444' },
    2: { label: 'Fair',      color: '#f59e0b' },
    3: { label: 'Good',      color: '#3b82f6' },
    4: { label: 'Strong',    color: '#10b981' },
  };
  return { score, ...map[score] };
}

// ─── Password requirement row ─────────────────────────────────────────────────
const Requirement: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {met
      ? <CheckCircle sx={{ fontSize: 15, color: '#10b981' }} />
      : <Cancel      sx={{ fontSize: 15, color: '#cbd5e1' }} />
    }
    <Typography variant="caption" sx={{ color: met ? '#10b981' : '#94a3b8', fontWeight: met ? 600 : 400 }}>
      {label}
    </Typography>
  </Box>
);

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 1.5,
    py: 1.5,
    borderRadius: 2,
    bgcolor: '#f8fafc',
    border: '1px solid #e2e8f0',
    minWidth: 0,
  }}>
    <Box sx={{
      width: 34,
      height: 34,
      borderRadius: 1.5,
      bgcolor: BRAND.primaryBg,
      border: `1px solid ${BRAND.primaryBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: BRAND.primary,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
    <Box sx={{
      width: { xs: 34, sm: 38 },
      height: { xs: 34, sm: 38 },
      borderRadius: 2,
      bgcolor: BRAND.primaryBg,
      border: `1px solid ${BRAND.primaryBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: BRAND.primary,
      flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>{subtitle}</Typography>
      )}
    </Box>
  </Box>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error,   setError]     = useState('');

  const [oldPassword,     setOldPassword]     = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const requirements = useMemo(() => [
    { met: newPassword.length >= 8,                                          label: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),          label: 'Upper & lowercase letters' },
    { met: /\d/.test(newPassword),                                           label: 'At least one number' },
    { met: /[^A-Za-z0-9]/.test(newPassword),                                label: 'At least one special character' },
  ], [newPassword]);

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (oldPassword === newPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(oldPassword, newPassword);
      setSuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.email?.split('@')[0] || 'User';
  const initials    = (user?.email?.charAt(0) || 'U').toUpperCase();

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&.Mui-focused fieldset': { borderColor: BRAND.primary },
    },
    '& label.Mui-focused': { color: BRAND.primary },
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* ── Hero (unchanged) ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 45%, #1565C0 100%)',
          px: { xs: 2.5, sm: 4, md: 6 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100, right: -60,
            width: 360, height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25,118,210,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80, left: '25%',
            width: 280, height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        <Box sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ color: 'rgba(144,202,249,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
            SYSTEM CONTROL CENTER
          </Typography>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            My Profile
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
            <CalendarToday sx={{ fontSize: 13, color: 'rgba(144,202,249,0.6)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.6)', fontWeight: 500, fontSize: '0.75rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 1.5, sm: 3, md: 5 }, pt: { xs: 2.5, sm: 4 }, pb: { xs: 4, sm: 6 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="flex-start">

          {/* ── Left column: identity card ── */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

              {/* Dark band — fixed height, no avatar inside */}
              <Box sx={{
                background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 100%)',
                height: 80,
                borderRadius: '12px 12px 0 0',
              }} />

              {/* Avatar centred on the band/white boundary */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '-40px', px: { xs: 2, sm: 3 }, pb: 2.5 }}>
                <Avatar sx={{
                  width: 80,
                  height: 80,
                  bgcolor: BRAND.primary,
                  fontSize: '2rem',
                  fontWeight: 700,
                  border: '4px solid #ffffff',
                  boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
                  mb: 1.5,
                }}>
                  {initials}
                </Avatar>

                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, textAlign: 'center' }}>
                  {displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center', wordBreak: 'break-all' }}>
                  {user?.email}
                </Typography>
                <Chip
                  label="System Administrator"
                  size="small"
                  sx={{
                    mt: 1.5,
                    bgcolor: BRAND.primaryBg,
                    color: BRAND.primary,
                    border: `1px solid ${BRAND.primaryBorder}`,
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    height: 24,
                  }}
                />
              </Box>

              <Divider />

              {/* Quick info rows */}
              <Box sx={{ px: { xs: 1.5, sm: 2.5 }, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <InfoRow
                  icon={<EmailOutlined sx={{ fontSize: 18 }} />}
                  label="Email"
                  value={user?.email || '—'}
                />
                <InfoRow
                  icon={<BadgeOutlined sx={{ fontSize: 18 }} />}
                  label="Role"
                  value="System Administrator"
                />
                <InfoRow
                  icon={<PersonOutlined sx={{ fontSize: 18 }} />}
                  label="Account Type"
                  value="System"
                />
              </Box>
            </Card>
          </Grid>

          {/* ── Right column: account info + password ── */}
          <Grid item xs={12} md={8}>

            {/* Account information */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <SectionHeader
                  icon={<PersonOutlined sx={{ fontSize: 20 }} />}
                  title="Account Information"
                  subtitle="Your account details managed by the system"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    sx={{
                      ...fieldSx,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ fontSize: 18, color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={displayName}
                    disabled
                    sx={{
                      ...fieldSx,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlined sx={{ fontSize: 18, color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{
                  mt: 2.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(BRAND.primary, 0.04),
                  border: `1px solid ${BRAND.primaryBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <ShieldOutlined sx={{ fontSize: 16, color: BRAND.primary, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#475569' }}>
                    Account details are managed by the system and cannot be edited directly.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Change password */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <SectionHeader
                  icon={<LockOutlined sx={{ fontSize: 20 }} />}
                  title="Change Password"
                  subtitle="Update your password to keep your account secure"
                />

                {success && (
                  <Alert
                    severity="success"
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setSuccess('')}
                  >
                    {success}
                  </Alert>
                )}
                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                  {/* Current password */}
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    disabled={loading}
                    sx={fieldSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowOld(p => !p)} edge="end" disabled={loading} sx={{ color: BRAND.primary }}>
                            {showOld ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  {/* New password */}
                  <Box>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      sx={fieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowNew(p => !p)} edge="end" disabled={loading} sx={{ color: BRAND.primary }}>
                              {showNew ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Strength bar */}
                    {newPassword.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                          <Typography variant="caption" color="text.secondary">Password strength</Typography>
                          {strength.label && (
                            <Typography variant="caption" sx={{ fontWeight: 700, color: strength.color }}>
                              {strength.label}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {[1, 2, 3, 4].map(i => (
                            <LinearProgress
                              key={i}
                              variant="determinate"
                              value={strength.score >= i ? 100 : 0}
                              sx={{
                                flex: 1,
                                height: 4,
                                borderRadius: 2,
                                bgcolor: '#e2e8f0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: strength.color,
                                  borderRadius: 2,
                                  transition: 'none',
                                },
                              }}
                            />
                          ))}
                        </Box>

                        {/* Requirements */}
                        <Box sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 0.75,
                        }}>
                          {requirements.map((r, i) => (
                            <Requirement key={i} met={r.met} label={r.label} />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Confirm password */}
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConf ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    error={passwordsMismatch}
                    helperText={
                      passwordsMismatch ? 'Passwords do not match' :
                      passwordsMatch    ? 'Passwords match'        : ''
                    }
                    FormHelperTextProps={{
                      sx: { color: passwordsMatch ? '#10b981' : undefined },
                    }}
                    sx={{
                      ...fieldSx,
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                        borderColor: passwordsMismatch ? '#ef4444' : passwordsMatch ? '#10b981' : BRAND.primary,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConf(p => !p)} edge="end" disabled={loading} sx={{ color: BRAND.primary }}>
                            {showConf ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      mt: 0.5,
                      bgcolor: BRAND.primary,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderRadius: 2,
                      boxShadow: `0 4px 14px rgba(25,118,210,0.35)`,
                      '&:hover:not(:disabled)': {
                        bgcolor: BRAND.primaryHover,
                        boxShadow: `0 6px 20px rgba(25,118,210,0.45)`,
                      },
                      '&:disabled': { bgcolor: alpha(BRAND.primary, 0.4) },
                    }}
                  >
                    {loading
                      ? <CircularProgress size={22} sx={{ color: '#ffffff' }} />
                      : 'Update Password'
                    }
                  </Button>
                </Box>
              </CardContent>
            </Card>

          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfilePage;
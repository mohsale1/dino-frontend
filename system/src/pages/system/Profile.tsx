import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  InputAdornment,
  IconButton,
  Divider,
  LinearProgress,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  CheckCircle,
  Cancel,
  ShieldOutlined,
  PersonOutlined,
  BadgeOutlined,
  AdminPanelSettingsOutlined,
  VerifiedOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { authService } from '../../services/auth/auth';

// ── Design tokens ─────────────────────────────────────────────────────────────
const P  = '#00A6CA';
const PH = '#005F8D';
const PB = 'rgba(0,166,202,0.08)';
const PBR = 'rgba(0,166,202,0.2)';

// ── Password strength ─────────────────────────────────────────────────────────
function getPasswordStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: '#e0e0e0' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw))   s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  s = Math.min(s, 4);
  const map: Record<number, { label: string; color: string }> = {
    0: { label: '',       color: '#e0e0e0' },
    1: { label: 'Weak',   color: '#ef4444' },
    2: { label: 'Fair',   color: '#f59e0b' },
    3: { label: 'Good',   color: '#3b82f6' },
    4: { label: 'Strong', color: '#10b981' },
  };
  return { score: s, ...map[s] };
}

// ── Sub-components ────────────────────────────────────────────────────────────
const Req: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {met
      ? <CheckCircle sx={{ fontSize: 14, color: '#10b981' }} />
      : <Cancel      sx={{ fontSize: 14, color: '#d1d5db' }} />
    }
    <Typography variant="caption" sx={{ color: met ? '#10b981' : '#9ca3af', fontWeight: met ? 600 : 400, fontSize: '0.75rem' }}>
      {label}
    </Typography>
  </Box>
);

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: '1px solid #f2f2f2', '&:last-child': { borderBottom: 'none' } }}>
    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: PB, border: `1px solid ${PBR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: P }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography sx={{ fontSize: '0.7rem', color: '#999999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1E', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#fafafa',
    '&.Mui-focused fieldset': { borderColor: P },
    '&.Mui-disabled': { bgcolor: '#f5f5f5' },
  },
  '& label.Mui-focused': { color: P },
};

// ── Main component ────────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const [oldPassword,     setOldPassword]     = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const requirements = useMemo(() => [
    { met: newPassword.length >= 8,                                        label: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),        label: 'Upper & lowercase' },
    { met: /\d/.test(newPassword),                                         label: 'At least one number' },
    { met: /[^A-Za-z0-9]/.test(newPassword),                              label: 'Special character' },
  ], [newPassword]);

  const passwordsMatch   = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!oldPassword || !newPassword || !confirmPassword) { setError('All fields are required.'); return; }
    if (newPassword.length < 8)          { setError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword)  { setError('New passwords do not match.'); return; }
    if (oldPassword === newPassword)      { setError('New password must differ from current.'); return; }
    try {
      setLoading(true);
      await authService.changePassword(oldPassword, newPassword);
      setSuccess('Password updated successfully.');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.email?.split('@')[0] || 'User';
  const initials    = (user?.email?.charAt(0) || 'U').toUpperCase();

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f4f6f8' }}>

      {/* ── Cover photo ── */}
      <Box
        sx={{
          height: { xs: 90, sm: 100, md: 110 },
          background: `linear-gradient(135deg, #004364 0%, #00A6CA 50%, #00c4ee 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle pattern overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />
      </Box>

      {/* ── Profile identity strip ── */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', px: { xs: 2, sm: 3, md: 5 }, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 2, sm: 3 }, mt: { xs: '-36px', sm: '-42px', md: '-46px' }, mb: 2, flexWrap: 'wrap' }}>

          {/* Avatar */}
          <Avatar
            sx={{
              width:  { xs: 72, sm: 84, md: 92 },
              height: { xs: 72, sm: 84, md: 92 },
              bgcolor: P,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
              fontWeight: 700,
              border: '4px solid #ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>

          {/* Name + meta */}
          <Box sx={{ flex: 1, minWidth: 0, pb: 1, pt: { xs: '44px', sm: '56px', md: '60px' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: { xs: '1.125rem', sm: '1.375rem' }, fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2 }}>
                {displayName}
              </Typography>
              <VerifiedOutlined sx={{ fontSize: 18, color: P }} />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', color: '#666666', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<AdminPanelSettingsOutlined sx={{ fontSize: '14px !important' }} />}
                label="System Administrator"
                size="small"
                sx={{ bgcolor: PB, color: P, border: `1px solid ${PBR}`, fontWeight: 600, fontSize: '0.72rem', height: 22 }}
              />
              <Chip
                label="System"
                size="small"
                sx={{ bgcolor: '#f2f2f2', color: '#666666', fontSize: '0.72rem', height: 22 }}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Tabs ── */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 44, color: '#666666', px: 2 },
            '& .Mui-selected': { color: P },
            '& .MuiTabs-indicator': { bgcolor: P, height: 2.5 },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Security" />
        </Tabs>
      </Box>

      {/* ── Tab content ── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, py: 3, maxWidth: 900, mx: 'auto' }}>

        {/* ══ OVERVIEW TAB ══ */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>

            {/* Left — about card */}
            <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
              <Box sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1C1C1E', mb: 0.5 }}>
                    About
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#666666', lineHeight: 1.6 }}>
                    System administrator account with full platform access.
                  </Typography>
                </Box>
                <Box sx={{ px: 2, pb: 1.5 }}>
                  <InfoItem icon={<EmailOutlined sx={{ fontSize: 17 }} />}              label="Email"        value={user?.email || '—'} />
                  <InfoItem icon={<BadgeOutlined sx={{ fontSize: 17 }} />}              label="Role"         value="System Administrator" />
                  <InfoItem icon={<PersonOutlined sx={{ fontSize: 17 }} />}             label="Account Type" value="System" />
                  <InfoItem icon={<AdminPanelSettingsOutlined sx={{ fontSize: 17 }} />} label="Access Level" value="Full Access" />
                </Box>
              </Box>
            </Box>

            {/* Right — account info card */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2, p: { xs: 2, sm: 3 } }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1C1C1E', mb: 2.5 }}>
                  Account Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ fontSize: 18, color: '#999999' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={displayName}
                    disabled
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlined sx={{ fontSize: 18, color: '#999999' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{
                  mt: 2.5, px: 2, py: 1.5, borderRadius: 2,
                  bgcolor: alpha(P, 0.04), border: `1px solid ${PBR}`,
                  display: 'flex', alignItems: 'center', gap: 1,
                }}>
                  <ShieldOutlined sx={{ fontSize: 15, color: P, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.78rem' }}>
                    Account details are managed by the system and cannot be edited directly.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* ══ SECURITY TAB ══ */}
        {tab === 1 && (
          <Box sx={{ maxWidth: 560 }}>
            <Box sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2, p: { xs: 2, sm: 3 } }}>

              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: PB, border: `1px solid ${PBR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P, flexShrink: 0 }}>
                  <LockOutlined sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1C1C1E', lineHeight: 1.2 }}>
                    Change Password
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#666666' }}>
                    Keep your account secure with a strong password
                  </Typography>
                </Box>
              </Box>

              {success && (
                <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

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
                        <IconButton onClick={() => setShowOld(p => !p)} edge="end" disabled={loading} size="small" sx={{ color: '#999999', '&:hover': { color: P } }}>
                          {showOld ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Divider sx={{ borderStyle: 'dashed', borderColor: '#e0e0e0' }} />

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
                          <IconButton onClick={() => setShowNew(p => !p)} edge="end" disabled={loading} size="small" sx={{ color: '#999999', '&:hover': { color: P } }}>
                            {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Strength indicator */}
                  {newPassword.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.75rem' }}>Password strength</Typography>
                        {strength.label && (
                          <Typography variant="caption" sx={{ fontWeight: 700, color: strength.color, fontSize: '0.75rem' }}>
                            {strength.label}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                        {[1, 2, 3, 4].map(i => (
                          <LinearProgress
                            key={i}
                            variant="determinate"
                            value={strength.score >= i ? 100 : 0}
                            sx={{
                              flex: 1, height: 3, borderRadius: 2, bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 2, transition: 'none' },
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75,
                        p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e0e0e0',
                      }}>
                        {requirements.map((r, i) => <Req key={i} met={r.met} label={r.label} />)}
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
                  helperText={passwordsMismatch ? 'Passwords do not match' : passwordsMatch ? 'Passwords match' : ''}
                  FormHelperTextProps={{ sx: { color: passwordsMatch ? '#10b981' : undefined } }}
                  sx={{
                    ...fieldSx,
                    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                      borderColor: passwordsMismatch ? '#ef4444' : passwordsMatch ? '#10b981' : P,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConf(p => !p)} edge="end" disabled={loading} size="small" sx={{ color: '#999999', '&:hover': { color: P } }}>
                          {showConf ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                    mt: 0.5, py: 1.25,
                    bgcolor: P,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover:not(:disabled)': { bgcolor: PH, boxShadow: 'none' },
                    '&:disabled': { bgcolor: alpha(P, 0.4) },
                  }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : 'Update Password'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfilePage;

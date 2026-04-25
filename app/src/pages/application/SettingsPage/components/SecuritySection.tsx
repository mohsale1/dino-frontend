import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { authService } from '../../../../services/auth';

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

const BRAND = {
  primary: '#1976D2',
  primaryHover: '#1565C0',
  primaryBg: 'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

// ---------------------------------------------------------------------------
// Password strength
// ---------------------------------------------------------------------------

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw))   score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);
  const map: Record<number, { label: string; color: string }> = {
    0: { label: '',       color: '#e2e8f0' },
    1: { label: 'Weak',   color: '#ef4444' },
    2: { label: 'Fair',   color: '#f59e0b' },
    3: { label: 'Good',   color: '#3b82f6' },
    4: { label: 'Strong', color: '#10b981' },
  };
  return { score, ...map[score] };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
    <Box sx={{
      width: { xs: 34, sm: 38 }, height: { xs: 34, sm: 38 },
      borderRadius: 2, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: BRAND.primary, flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const Requirement: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {met
      ? <CheckCircle sx={{ fontSize: 14, color: '#10b981', flexShrink: 0 }} />
      : <Cancel      sx={{ fontSize: 14, color: '#cbd5e1', flexShrink: 0 }} />
    }
    <Typography variant="caption" sx={{ color: met ? '#10b981' : '#94a3b8', fontWeight: met ? 600 : 400 }}>
      {label}
    </Typography>
  </Box>
);

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#ffffff',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: BRAND.primaryBorder },
    '&.Mui-focused fieldset': { borderColor: BRAND.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND.primary },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface SecuritySectionProps {
  onSave?: (data: unknown) => Promise<void>;
  onChangePassword?: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const SecuritySection: React.FC<SecuritySectionProps> = () => {
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading,   setPwLoading]   = useState(false);
  const [pwSuccess,   setPwSuccess]   = useState('');
  const [pwError,     setPwError]     = useState('');

  const strength = useMemo(() => getPasswordStrength(newPw), [newPw]);

  const requirements = useMemo(() => [
    { met: newPw.length >= 8,                           label: 'At least 8 characters'       },
    { met: /[A-Z]/.test(newPw) && /[a-z]/.test(newPw), label: 'Upper & lowercase letters'   },
    { met: /\d/.test(newPw),                            label: 'At least one number'         },
    { met: /[^A-Za-z0-9]/.test(newPw),                 label: 'At least one special character' },
  ], [newPw]);

  const passwordsMatch   = confirmPw.length > 0 && newPw === confirmPw;
  const passwordMismatch = confirmPw.length > 0 && newPw !== confirmPw;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPw)           { setPwError('Current password is required.'); return; }
    if (strength.score < 2)   { setPwError('New password is too weak.'); return; }
    if (!passwordsMatch)      { setPwError('New passwords do not match.'); return; }
    if (currentPw === newPw)  { setPwError('New password must differ from current password.'); return; }

    setPwLoading(true);
    try {
      await authService.changePassword(currentPw, newPw);
      setPwSuccess('Password updated successfully.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <SectionHeader
          icon={<LockOutlined sx={{ fontSize: 20 }} />}
          title="Change Password"
          subtitle="Update your account password to keep it secure"
        />

        {pwSuccess && (
          <Alert severity="success" onClose={() => setPwSuccess('')} sx={{ mb: 2.5, borderRadius: 2 }}>
            {pwSuccess}
          </Alert>
        )}
        {pwError && (
          <Alert severity="error" onClose={() => setPwError('')} sx={{ mb: 2.5, borderRadius: 2 }}>
            {pwError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handlePasswordSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Current password */}
          <TextField
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            fullWidth size="small" required
            autoComplete="current-password"
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ fontSize: 16, color: '#94a3b8' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowCurrent(v => !v)} edge="end" tabIndex={-1}>
                    {showCurrent ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* New password */}
          <Box>
            <TextField
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              fullWidth size="small" required
              autoComplete="new-password"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ fontSize: 16, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew(v => !v)} edge="end" tabIndex={-1}>
                      {showNew ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Strength bar + requirements */}
            {newPw.length > 0 && (
              <Box sx={{ mt: 1.25 }}>
                {/* Strength bar */}
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                  {[1, 2, 3, 4].map((seg) => (
                    <Box key={seg} sx={{
                      flex: 1, height: 4, borderRadius: 99,
                      bgcolor: strength.score >= seg ? strength.color : '#e2e8f0',
                      transition: 'background-color 0.25s',
                    }} />
                  ))}
                </Box>
                {strength.label && (
                  <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                  </Typography>
                )}
                {/* Requirements — 2-column grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mt: 0.75 }}>
                  {requirements.map((r) => (
                    <Requirement key={r.label} met={r.met} label={r.label} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Confirm password */}
          <TextField
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            fullWidth size="small" required
            autoComplete="new-password"
            helperText={
              passwordMismatch ? 'Passwords do not match' :
              passwordsMatch   ? 'Passwords match'        : ''
            }
            FormHelperTextProps={{
              sx: { color: passwordMismatch ? '#ef4444' : passwordsMatch ? '#10b981' : 'inherit', fontWeight: 600, mx: 0 },
            }}
            sx={{
              ...fieldSx,
              ...(passwordsMatch   && { '& .MuiOutlinedInput-root fieldset': { borderColor: '#10b981' } }),
              ...(passwordMismatch && { '& .MuiOutlinedInput-root fieldset': { borderColor: '#ef4444' } }),
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ fontSize: 16, color: '#94a3b8' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowConfirm(v => !v)} edge="end" tabIndex={-1}>
                    {showConfirm ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Divider + action row — matches WorkspaceSection pattern */}
          <Divider sx={{ borderColor: '#e0e0e0' }} />

          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <Button
              type="submit"
              variant="contained"
              disabled={pwLoading}
              startIcon={pwLoading ? <CircularProgress size={15} color="inherit" /> : <LockOutlined sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 3,
                bgcolor: BRAND.primary,
                boxShadow: 'none',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { bgcolor: BRAND.primaryHover, boxShadow: 'none' },
                '&:disabled': { bgcolor: 'rgba(25,118,210,0.4)' },
              }}
            >
              {pwLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SecuritySection;

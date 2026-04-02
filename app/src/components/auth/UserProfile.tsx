import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PersonOutlined,
  LockOutlined,
  ShieldOutlined,
  EmailOutlined,
  PhoneOutlined,
  CalendarToday,
  Edit,
  Cancel,
  SaveOutlined,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel as CancelIcon,
  BadgeOutlined,
  VerifiedUser,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/common/Auth';
import { authService } from '../../services/auth';
import {
  getUserFirstName,
  getUserLastName,
  getUserCreatedAt,
  getUserInitials,
} from '../../utils/data/userUtils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BRAND = {
  primary: '#1976D2',
  primaryHover: '#1565C0',
  primaryLight: '#42A5F5',
  primaryBg: 'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#f8fafc',
    '&.Mui-focused': { bgcolor: '#fff' },
    '&.Mui-disabled': { bgcolor: '#f8fafc' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
};

const fieldSxEditing = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#fff',
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TabPanel({
  children,
  value,
  index,
  ...other
}: {
  children?: React.ReactNode;
  value: number;
  index: number;
  [key: string]: unknown;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 1.5,
      py: 1.5,
      borderRadius: 2,
      bgcolor: '#f8fafc',
      border: '1px solid #e2e8f0',
      minWidth: 0,
    }}
  >
    <Box
      sx={{
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
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: '#0f172a',
          mt: 0.25,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
    <Box
      sx={{
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
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.2,
          fontSize: { xs: '0.9rem', sm: '1rem' },
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(score, 4);
  const map: Record<number, { label: string; color: string }> = {
    0: { label: '', color: '#e2e8f0' },
    1: { label: 'Weak', color: '#ef4444' },
    2: { label: 'Fair', color: '#f59e0b' },
    3: { label: 'Good', color: '#3b82f6' },
    4: { label: 'Strong', color: '#10b981' },
  };
  return { score, ...map[score] };
}

const Requirement = ({ met, label }: { met: boolean; label: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {met ? (
      <CheckCircle sx={{ fontSize: 15, color: '#10b981' }} />
    ) : (
      <CancelIcon sx={{ fontSize: 15, color: '#cbd5e1' }} />
    )}
    <Typography
      variant="caption"
      sx={{ color: met ? '#10b981' : '#94a3b8', fontWeight: met ? 600 : 400 }}
    >
      {label}
    </Typography>
  </Box>
);

// ---------------------------------------------------------------------------
// Role display helper
// ---------------------------------------------------------------------------

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    operator: 'Operator',
    customer: 'Customer',
  };
  return map[role] ?? role;
}

function getRoleColor(
  role: string
): 'error' | 'warning' | 'info' | 'success' | 'default' {
  const map: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
    superadmin: 'error',
    admin: 'warning',
    operator: 'info',
    customer: 'success',
  };
  return map[role] ?? 'default';
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const UserProfile: React.FC = () => {
  const { user, updateUser, userPermissions, getPermissionsList } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Personal info form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Sync profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: getUserFirstName(user),
        lastName: getUserLastName(user),
        phone: user.phone ?? '',
      });
    }
  }, [user]);

  // Derived values
  const initials = useMemo(() => getUserInitials(user), [user]);
  const createdAt = useMemo(() => getUserCreatedAt(user), [user]);
  const memberSince = useMemo(() => {
    if (!createdAt) return '-';
    return createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [createdAt]);

  const fullName = useMemo(() => {
    const fn = getUserFirstName(user);
    const ln = getUserLastName(user);
    return `${fn} ${ln}`.trim() || user?.email || '-';
  }, [user]);

  // Password strength
  const strength = useMemo(
    () => getPasswordStrength(passwordData.newPassword),
    [passwordData.newPassword]
  );

  const requirements = useMemo(
    () => ({
      length: passwordData.newPassword.length >= 8,
      upperLower:
        /[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword),
      number: /\d/.test(passwordData.newPassword),
      special: /[^A-Za-z0-9]/.test(passwordData.newPassword),
    }),
    [passwordData.newPassword]
  );

  const passwordsMatch =
    passwordData.newPassword.length > 0 &&
    passwordData.confirmPassword.length > 0 &&
    passwordData.newPassword === passwordData.confirmPassword;

  const passwordMismatch =
    passwordData.confirmPassword.length > 0 &&
    passwordData.newPassword !== passwordData.confirmPassword;

  // Permissions list
  const permissionsList = useMemo(() => getPermissionsList(), [getPermissionsList]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setError(null);
    if (user) {
      setProfileData({
        firstName: getUserFirstName(user),
        lastName: getUserLastName(user),
        phone: user.phone ?? '',
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUser({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        phone: profileData.phone.trim() || undefined,
      });
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(null);
    if (!passwordData.currentPassword) {
      setError('Current password is required.');
      return;
    }
    if (!requirements.length || !requirements.upperLower || !requirements.number) {
      setError('New password does not meet the requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('New passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password updated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setError(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', pb: { xs: 4, sm: 6 } }}>
      {/* ------------------------------------------------------------------ */}
      {/* Hero Banner                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 45%, #1565C0 100%)',
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 5, sm: 6, md: 7 },
          pb: { xs: 5, sm: 6, md: 7 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(25,118,210,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80,
            left: '25%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Hero content */}
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 900, mx: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2.5, sm: 3 },
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: { xs: 72, sm: 88 },
                height: { xs: 72, sm: 88 },
                bgcolor: BRAND.primary,
                border: '3px solid rgba(255,255,255,0.25)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                fontSize: { xs: '1.5rem', sm: '1.875rem' },
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>

            {/* Text block */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {fullName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                  mb: 1.5,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                {user.email}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={getRoleLabel(user.role)}
                  color={getRoleColor(user.role)}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  <CalendarToday sx={{ fontSize: 13 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                    Member since {memberSince}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, mt: { xs: 3, sm: 4 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* ---------------------------------------------------------------- */}
          {/* LEFT COLUMN - Identity card                                       */}
          {/* ---------------------------------------------------------------- */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Dark band */}
              <Box
                sx={{
                  height: 80,
                  background: 'linear-gradient(135deg, #0d1b2e 0%, #1565C0 100%)',
                  position: 'relative',
                }}
              />

              {/* Avatar centered on band/white boundary */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  sx={{
                    width: 88,
                    height: 88,
                    bgcolor: BRAND.primary,
                    border: '4px solid #fff',
                    boxShadow: '0 4px 16px rgba(25,118,210,0.25)',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#fff',
                    mt: '-44px',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {initials}
                </Avatar>
              </Box>

              {/* Identity info */}
              <Box sx={{ px: 2.5, pb: 2.5, pt: 1.5, textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.3 }}
                >
                  {fullName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.8rem',
                    mt: 0.25,
                    mb: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </Typography>
                <Chip
                  label={getRoleLabel(user.role)}
                  color={getRoleColor(user.role)}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                />
              </Box>

              <Divider sx={{ mx: 2 }} />

              {/* Info rows */}
              <Box sx={{ px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <InfoRow
                  icon={<EmailOutlined sx={{ fontSize: 17 }} />}
                  label="Email"
                  value={user.email}
                />
                <InfoRow
                  icon={<PhoneOutlined sx={{ fontSize: 17 }} />}
                  label="Phone"
                  value={user.phone || '-'}
                />
                <InfoRow
                  icon={<CalendarToday sx={{ fontSize: 17 }} />}
                  label="Member Since"
                  value={memberSince}
                />
              </Box>

              <Divider sx={{ mx: 2 }} />

              {/* Status chips */}
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Chip
                  icon={<BadgeOutlined sx={{ fontSize: 14 }} />}
                  label={user.isActive ? 'Active' : 'Inactive'}
                  color={user.isActive ? 'success' : 'default'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                />
                <Chip
                  icon={<VerifiedUser sx={{ fontSize: 14 }} />}
                  label={user.isVerified ? 'Verified' : 'Unverified'}
                  color={user.isVerified ? 'info' : 'default'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                />
              </Box>
            </Card>
          </Grid>

          {/* ---------------------------------------------------------------- */}
          {/* RIGHT COLUMN - Tabbed card                                        */}
          {/* ---------------------------------------------------------------- */}
          <Grid item xs={12} md={8}>
            {/* Alerts */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity="success"
                onClose={() => setSuccess(null)}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {success}
              </Alert>
            )}

            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Tabs */}
              <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    px: { xs: 1, sm: 2 },
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      minHeight: 52,
                      color: '#64748b',
                      '&.Mui-selected': { color: BRAND.primary },
                    },
                    '& .MuiTabs-indicator': { backgroundColor: BRAND.primary, height: 3 },
                  }}
                >
                  <Tab
                    icon={<PersonOutlined sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Personal Info"
                    id="profile-tab-0"
                    aria-controls="profile-tabpanel-0"
                  />
                  <Tab
                    icon={<LockOutlined sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Security"
                    id="profile-tab-1"
                    aria-controls="profile-tabpanel-1"
                  />
                  <Tab
                    icon={<ShieldOutlined sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Permissions"
                    id="profile-tab-2"
                    aria-controls="profile-tabpanel-2"
                  />
                </Tabs>
              </Box>

              {/* ------------------------------------------------------------ */}
              {/* Tab 0 - Personal Info                                          */}
              {/* ------------------------------------------------------------ */}
              <TabPanel value={tabValue} index={0}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                  }}
                >
                  <SectionHeader
                    icon={<PersonOutlined sx={{ fontSize: 20 }} />}
                    title="Personal Information"
                    subtitle="Manage your name and contact details"
                  />
                  {!editing ? (
                    <Button
                      startIcon={<Edit sx={{ fontSize: 16 }} />}
                      onClick={() => setEditing(true)}
                      size="small"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: BRAND.primary,
                        borderColor: BRAND.primaryBorder,
                        border: `1px solid ${BRAND.primaryBorder}`,
                        borderRadius: 2,
                        px: 1.5,
                        flexShrink: 0,
                        ml: 1,
                        '&:hover': { bgcolor: BRAND.primaryBg },
                      }}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      startIcon={<Cancel sx={{ fontSize: 16 }} />}
                      onClick={handleCancelEdit}
                      size="small"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: '#64748b',
                        borderColor: '#e2e8f0',
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        px: 1.5,
                        flexShrink: 0,
                        ml: 1,
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* First + Last name row */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        disabled={!editing}
                        fullWidth
                        size="small"
                        sx={editing ? fieldSxEditing : fieldSx}
                        InputProps={{ readOnly: !editing }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        disabled={!editing}
                        fullWidth
                        size="small"
                        sx={editing ? fieldSxEditing : fieldSx}
                        InputProps={{ readOnly: !editing }}
                      />
                    </Grid>
                  </Grid>

                  {/* Phone */}
                  <TextField
                    label="Phone"
                    value={profileData.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setProfileData((prev) => ({ ...prev, phone: digitsOnly }));
                    }}
                    disabled={!editing}
                    fullWidth
                    size="small"
                    placeholder="10-digit phone number"
                    inputProps={{ maxLength: 10, pattern: '[0-9]*', inputMode: 'numeric' }}
                    sx={editing ? fieldSxEditing : fieldSx}
                    InputProps={{ readOnly: !editing }}
                  />

                  {/* Email - always disabled */}
                  <TextField
                    label="Email Address"
                    value={user.email}
                    disabled
                    fullWidth
                    size="small"
                    helperText="Email cannot be changed"
                    sx={fieldSx}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <LockOutlined sx={{ fontSize: 16, color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Save button - only when editing */}
                  {editing && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: { xs: 'stretch', sm: 'flex-end' },
                        mt: 0.5,
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={
                          saving ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <SaveOutlined sx={{ fontSize: 18 }} />
                          )
                        }
                        onClick={handleProfileUpdate}
                        disabled={saving}
                        fullWidth={false}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          bgcolor: BRAND.primary,
                          borderRadius: 2,
                          px: 3,
                          width: { xs: '100%', sm: 'auto' },
                          '&:hover': { bgcolor: BRAND.primaryHover },
                        }}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* ------------------------------------------------------------ */}
              {/* Tab 1 - Security                                               */}
              {/* ------------------------------------------------------------ */}
              <TabPanel value={tabValue} index={1}>
                <SectionHeader
                  icon={<LockOutlined sx={{ fontSize: 20 }} />}
                  title="Change Password"
                  subtitle="Update your account password"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Current password */}
                  <TextField
                    label="Current Password"
                    type={showCurrent ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                    fullWidth
                    size="small"
                    sx={fieldSxEditing}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowCurrent((v) => !v)}
                            edge="end"
                          >
                            {showCurrent ? (
                              <VisibilityOff sx={{ fontSize: 18 }} />
                            ) : (
                              <Visibility sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* New password */}
                  <TextField
                    label="New Password"
                    type={showNew ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    fullWidth
                    size="small"
                    sx={fieldSxEditing}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowNew((v) => !v)}
                            edge="end"
                          >
                            {showNew ? (
                              <VisibilityOff sx={{ fontSize: 18 }} />
                            ) : (
                              <Visibility sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Strength bar */}
                  {passwordData.newPassword.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', gap: 0.75, mb: 0.75 }}>
                        {[1, 2, 3, 4].map((seg) => (
                          <Box
                            key={seg}
                            sx={{
                              flex: 1,
                              height: 5,
                              borderRadius: 99,
                              bgcolor:
                                strength.score >= seg ? strength.color : '#e2e8f0',
                              transition: 'background-color 0.25s',
                            }}
                          />
                        ))}
                      </Box>
                      {strength.label && (
                        <Typography
                          variant="caption"
                          sx={{ color: strength.color, fontWeight: 600 }}
                        >
                          {strength.label}
                        </Typography>
                      )}

                      {/* Requirements */}
                      <Grid container spacing={0.5} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <Requirement met={requirements.length} label="At least 8 characters" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Requirement
                            met={requirements.upperLower}
                            label="Upper and lowercase letters"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Requirement met={requirements.number} label="At least one number" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Requirement
                            met={requirements.special}
                            label="At least one special character"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Confirm password */}
                  <TextField
                    label="Confirm New Password"
                    type={showConfirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#fff',
                        ...(passwordsMatch && {
                          '& fieldset': { borderColor: '#10b981' },
                        }),
                        ...(passwordMismatch && {
                          '& fieldset': { borderColor: '#ef4444' },
                        }),
                      },
                      '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                    }}
                    helperText={
                      passwordMismatch
                        ? 'Passwords do not match'
                        : passwordsMatch
                        ? 'Passwords match'
                        : ''
                    }
                    FormHelperTextProps={{
                      sx: {
                        color: passwordMismatch
                          ? '#ef4444'
                          : passwordsMatch
                          ? '#10b981'
                          : 'inherit',
                        fontWeight: 600,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowConfirm((v) => !v)}
                            edge="end"
                          >
                            {showConfirm ? (
                              <VisibilityOff sx={{ fontSize: 18 }} />
                            ) : (
                              <Visibility sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Submit */}
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                    <Button
                      variant="contained"
                      startIcon={
                        passwordSaving ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <LockOutlined sx={{ fontSize: 18 }} />
                        )
                      }
                      onClick={handlePasswordChange}
                      disabled={passwordSaving}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: BRAND.primary,
                        borderRadius: 2,
                        px: 3,
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': { bgcolor: BRAND.primaryHover },
                      }}
                    >
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Box>
                </Box>
              </TabPanel>

              {/* ------------------------------------------------------------ */}
              {/* Tab 2 - Permissions                                            */}
              {/* ------------------------------------------------------------ */}
              <TabPanel value={tabValue} index={2}>
                <SectionHeader
                  icon={<ShieldOutlined sx={{ fontSize: 20 }} />}
                  title="Role and Permissions"
                  subtitle="Your access level and granted permissions"
                />

                {/* Role card */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: BRAND.primaryBg,
                      border: `1px solid ${BRAND.primaryBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: BRAND.primary,
                      flexShrink: 0,
                    }}
                  >
                    <BadgeOutlined sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', lineHeight: 1.2, mb: 0.5 }}
                    >
                      Assigned Role
                    </Typography>
                    <Chip
                      label={
                        userPermissions?.role?.name
                          ? getRoleLabel(userPermissions.role.name)
                          : getRoleLabel(user.role)
                      }
                      color={getRoleColor(user.role)}
                      sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                    />
                  </Box>
                </Box>

                {/* Permissions list */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}
                  >
                    Granted Permissions
                  </Typography>
                  {permissionsList.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {permissionsList.map((perm) => (
                        <Chip
                          key={perm}
                          label={perm}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderColor: BRAND.primaryBorder,
                            color: BRAND.primary,
                            bgcolor: BRAND.primaryBg,
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      No specific permissions assigned.
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {/* Account status */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}
                  >
                    Account Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <BadgeOutlined
                        sx={{ fontSize: 16, color: user.isActive ? '#10b981' : '#94a3b8' }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        Account
                      </Typography>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <VerifiedUser
                        sx={{ fontSize: 16, color: user.isVerified ? '#3b82f6' : '#94a3b8' }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        Verification
                      </Typography>
                      <Chip
                        label={user.isVerified ? 'Verified' : 'Unverified'}
                        color={user.isVerified ? 'info' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                      />
                    </Box>
                  </Box>
                </Box>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserProfile;
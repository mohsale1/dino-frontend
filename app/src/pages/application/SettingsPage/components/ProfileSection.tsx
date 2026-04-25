import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Typography,
  Chip,
  Divider,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  PersonOutlined,
  EditOutlined,
  CloseOutlined,
  EmailOutlined,
  PhoneOutlined,
  CalendarToday,
  LockOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../../contexts/common/Auth';
import { useUserData } from '../../../../contexts/application/UserData';
import {
  getUserFirstName,
  getUserLastName,
  getUserInitials,
  getUserCreatedAt,
} from '../../../../utils/data/userUtils';

export interface ProfileSectionProps {
  onSave?: (data: any) => Promise<void>;
}

// ── Shared style tokens ──────────────────────────────────────────────────────
const PRIMARY        = '#1976D2';
const PRIMARY_BG     = 'rgba(25,118,210,0.08)';
const PRIMARY_BORDER = 'rgba(25,118,210,0.2)';

// ── InfoRow ──────────────────────────────────────────────────────────────────
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1.5,
      px: 1.5,
      py: 1.25,
      borderRadius: 2,
      bgcolor: '#f8fafc',
      border: '1px solid #e0e0e0',
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.5,
        bgcolor: PRIMARY_BG,
        border: `1px solid ${PRIMARY_BORDER}`,
        color: PRIMARY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {value || '\u2014'}
      </Typography>
    </Box>
  </Box>
);

// ── ProfileSection ───────────────────────────────────────────────────────────
const ProfileSection: React.FC<ProfileSectionProps> = ({ onSave }) => {
  const { user, updateUser } = useAuth();
  const { userData } = useUserData();

  const effectiveUser = userData?.user ?? null;
  const initFirstName = effectiveUser?.firstName || getUserFirstName(user);
  const initLastName  = effectiveUser?.lastName  || getUserLastName(user);
  const initPhone     = effectiveUser?.phone     || user?.phone || '';
  const initials      = effectiveUser
    ? ((effectiveUser.firstName?.charAt(0) || '') + (effectiveUser.lastName?.charAt(0) || '')).toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
    : getUserInitials(user);
  const createdAt = effectiveUser?.createdAt
    ? new Date(effectiveUser.createdAt)
    : getUserCreatedAt(user);
  const userRole  = effectiveUser?.role || (user as any)?.role?.name || (user as any)?.role || 'User';
  const userEmail = effectiveUser?.email || user?.email || '';

  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [alert, setAlert]       = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: initFirstName,
    lastName:  initLastName,
    phone:     initPhone,
  });

  // Sync form data when user/userData loads asynchronously
  useEffect(() => {
    if (!editing) {
      setFormData({
        firstName: initFirstName,
        lastName:  initLastName,
        phone:     initPhone,
      });
    }
  }, [initFirstName, initLastName, initPhone, editing]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setFormData({ firstName: initFirstName, lastName: initLastName, phone: initPhone });
    setAlert(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({ firstName: initFirstName, lastName: initLastName, phone: initPhone });
    setAlert(null);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUser({
        firstName: formData.firstName,
        lastName:  formData.lastName,
        phone:     formData.phone,
      });
      if (onSave) await onSave(formData);
      setAlert({ type: 'success', message: 'Profile updated successfully.' });
      setEditing(false);
    } catch (err: any) {
      setAlert({ type: 'error', message: err?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: '#f8fafc',
      '&:hover fieldset': { borderColor: '#94a3b8' },
      '&.Mui-focused fieldset': { borderColor: PRIMARY },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: PRIMARY },
  };

  const fieldSxEditing = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: '#ffffff',
      '&:hover fieldset': { borderColor: '#94a3b8' },
      '&.Mui-focused fieldset': { borderColor: PRIMARY },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: PRIMARY },
  };

  const memberSince = createdAt
    ? createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '\u2014';

  const displayName = [initFirstName, initLastName].filter(Boolean).join(' ') || userEmail || 'User';

  return (
    <Box>
      {/* Fix 3: responsive Grid container spacing */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>

        {/* ── Left: Identity Card ── */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}
          >
            {/* Dark band */}
            <Box
              sx={{
                height: 72,
                background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
              }}
            />

            {/* Avatar */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                sx={{
                  mt: '-36px',
                  width: 72,
                  height: 72,
                  bgcolor: PRIMARY,
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 16px rgba(25,118,210,0.25)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
            </Box>

            {/* Name / email / role */}
            <Box sx={{ px: 2.5, pb: 2.5, pt: 1, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', mb: 0.25 }}>
                {displayName}
              </Typography>
              {/* Fix 2: minWidth: 0 on email Typography to prevent overflow */}
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {userEmail}
              </Typography>
              <Chip
                label={typeof userRole === 'string' ? userRole : (userRole as any)?.displayName || (userRole as any)?.name || 'User'}
                size="small"
                sx={{
                  bgcolor: PRIMARY_BG,
                  color: PRIMARY,
                  border: `1px solid ${PRIMARY_BORDER}`,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  height: 24,
                  textTransform: 'capitalize',
                }}
              />
            </Box>

            <Divider />

            {/* Fix 7: responsive px on info rows box */}
            <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <InfoRow
                icon={<EmailOutlined sx={{ fontSize: 16 }} />}
                label="Email"
                value={userEmail}
              />
              <InfoRow
                icon={<PhoneOutlined sx={{ fontSize: 16 }} />}
                label="Phone"
                value={initPhone}
              />
              <InfoRow
                icon={<CalendarToday sx={{ fontSize: 16 }} />}
                label="Member Since"
                value={memberSince}
              />
            </Box>
          </Card>
        </Grid>

        {/* ── Right: Form Card ── */}
        <Grid item xs={12} md={8}>
          {/* Alert */}
          {alert && (
            <Alert
              severity={alert.type}
              onClose={() => setAlert(null)}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {alert.message}
            </Alert>
          )}

          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
            {/* Fix 6: CardContent p already responsive — kept as-is */}
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

              {/* Fix 5: section header row with responsive gap */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: { xs: 1, sm: 1.5 },
                  flexWrap: 'wrap',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: PRIMARY_BG,
                      border: `1px solid ${PRIMARY_BORDER}`,
                      color: PRIMARY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <PersonOutlined sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C1C1E' }}>
                      Personal Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Update your name and contact details
                    </Typography>
                  </Box>
                </Box>

                {editing ? (
                  <IconButton size="small" onClick={handleCancel} sx={{ color: '#64748b' }}>
                    <CloseOutlined fontSize="small" />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    onClick={handleEdit}
                    sx={{
                      color: PRIMARY,
                      bgcolor: PRIMARY_BG,
                      border: `1px solid ${PRIMARY_BORDER}`,
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: 'rgba(25,118,210,0.14)' },
                    }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {/* Form fields */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Fix 4: responsive inner Grid spacing */}
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      InputProps={{ readOnly: !editing }}
                      sx={editing ? fieldSxEditing : fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      InputProps={{ readOnly: !editing }}
                      sx={editing ? fieldSxEditing : fieldSx}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleChange('phone', digits);
                  }}
                  inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                  InputProps={{ readOnly: !editing }}
                  sx={editing ? fieldSxEditing : fieldSx}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  value={userEmail}
                  disabled
                  helperText="Email cannot be changed"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <LockOutlined sx={{ fontSize: 18, color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                    },
                  }}
                />

                {editing && (
                  /* Fix 1: 'stretch' → 'flex-start' for xs justifyContent */
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
                      sx={{
                        bgcolor: PRIMARY,
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': { bgcolor: '#1565C0' },
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileSection;

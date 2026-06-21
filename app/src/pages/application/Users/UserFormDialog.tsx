
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Edit,
  PersonAddAltOutlined,
  Email,
  PhoneOutlined,
  LockResetOutlined,
  BusinessOutlined,
  BadgeOutlined,
} from '@mui/icons-material';
import { applicationUserService } from '../../../services/application/user';

// ─── Design tokens ──────────────────────────────────────────────────────────
const PRIMARY = '#1976D2';
const PRIMARY_BG = 'rgba(25,118,210,0.08)';
const PRIMARY_BORDER = 'rgba(25,118,210,0.2)';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#f8fafc',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: PRIMARY_BORDER },
    '&.Mui-focused fieldset': { borderColor: PRIMARY },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: PRIMARY },
};

const selectSx = {
  borderRadius: 2,
  bgcolor: '#f8fafc',
  '& fieldset': { borderColor: '#e0e0e0' },
  '&:hover fieldset': { borderColor: PRIMARY_BORDER },
  '&.Mui-focused fieldset': { borderColor: PRIMARY },
};

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirm_password: string;
  role_id: string;
  venueId: string;
}

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser: any | null;
  workspaceId: string;
  venueId: string;
  venues: any[];
  roles: any[];
}

// ─── Component ───────────────────────────────────────────────────────────────
const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
  editingUser,
  workspaceId,
  venueId,
  venues,
  roles,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirm_password: '',
    role_id: '',
    venueId: venueId,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    if (open) {
      setFormError('');
      setPasswordMismatch(false);
      if (editingUser) {
        setFormData({
          email: editingUser.email || '',
          firstName: editingUser.firstName || editingUser.first_name || '',
          lastName: editingUser.lastName || editingUser.last_name || '',
          phone: editingUser.phone || '',
          password: '',
          confirm_password: '',
          role_id: String(editingUser.role?.id || editingUser.role_id || ''),
          venueId: String(editingUser.venueId || venueId || ''),
        });
      } else {
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          password: '',
          confirm_password: '',
          role_id: '',
          venueId: String(venueId || ''),
        });
      }
    }
  }, [open, editingUser, workspaceId, venueId]);

  const handleConfirmPasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, confirm_password: value }));
    setPasswordMismatch(!!formData.password && value !== formData.password);
  };

  const handleSubmit = async () => {
    setFormError('');

    if (editingUser) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setFormError('First name and last name are required.');
        return;
      }
    } else {
      if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.role_id) {
        setFormError('Email, first name, last name, and role are required.');
        return;
      }
      if (!formData.password || formData.password.length < 8) {
        setFormError('Password must be at least 8 characters.');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setPasswordMismatch(true);
        setFormError('Passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);

      if (editingUser) {
        await applicationUserService.updateUser(editingUser.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role_id: Number(formData.role_id),
        });
      } else {
        const createData: any = {
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role_id: Number(formData.role_id),
        };
        if (formData.venueId) {
          createData.persona_ids = [Number(formData.venueId)];
        }
        await applicationUserService.createUser(createData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setFormError(error?.message || 'Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSaveDisabled =
    loading ||
    !formData.firstName.trim() ||
    !formData.lastName.trim() ||
    (!editingUser && (!formData.email.trim() || !formData.password || !formData.role_id)) ||
    passwordMismatch;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '12px' },
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', px: 3, pt: 3, pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: PRIMARY_BG,
                border: `1px solid ${PRIMARY_BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {editingUser
                ? <Edit sx={{ fontSize: 20, color: PRIMARY }} />
                : <PersonAddAltOutlined sx={{ fontSize: 20, color: PRIMARY }} />
              }
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#1C1C1E', fontWeight: 700, lineHeight: 1.2 }}>
                {editingUser ? 'Edit User' : 'Add User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem' }}>
                {editingUser ? 'Update user information' : 'Add a new user to your workspace'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: '#666666', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ── Form content ────────────────────────────────────────────────────── */}
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Inline error alert */}
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')} sx={{ borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          {/* Email — read-only in edit mode, hidden in create until below */}
          {editingUser ? (
            <TextField
              label="Email Address"
              fullWidth
              size="small"
              type="email"
              value={formData.email}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ fontSize: 18, color: '#999999' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          ) : (
            <TextField
              label="Email Address"
              fullWidth
              size="small"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ fontSize: 18, color: '#999999' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          )}

          {/* First / Last name side by side */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                fullWidth
                size="small"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                fullWidth
                size="small"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          {/* Password fields — create only */}
          {!editingUser && (
            <>
              <TextField
                label="Password"
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                helperText="Minimum 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockResetOutlined sx={{ fontSize: 18, color: '#999999' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword
                          ? <VisibilityOff sx={{ fontSize: 18 }} />
                          : <Visibility sx={{ fontSize: 18 }} />
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />

              <TextField
                label="Confirm Password"
                fullWidth
                size="small"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
                error={passwordMismatch}
                helperText={passwordMismatch ? 'Passwords do not match' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockResetOutlined sx={{ fontSize: 18, color: '#999999' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                        {showConfirmPassword
                          ? <VisibilityOff sx={{ fontSize: 18 }} />
                          : <Visibility sx={{ fontSize: 18 }} />
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </>
          )}

          {/* Phone */}
          <TextField
            label="Phone"
            fullWidth
            size="small"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlined sx={{ fontSize: 18, color: '#999999' }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {/* Role */}
          <FormControl
            fullWidth
            size="small"
            required
            sx={{ '& .MuiInputLabel-root.Mui-focused': { color: PRIMARY } }}
          >
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value as string })}
              sx={selectSx}
              renderValue={(value) => {
                if (!value) {
                  return (
                    <Typography variant="body2" sx={{ color: '#999999' }}>
                      Select a role...
                    </Typography>
                  );
                }
                const role = roles.find((r) => String(r.id) === String(value));
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeOutlined sx={{ fontSize: 16, color: '#666666' }} />
                    <Typography variant="body2">{role?.displayName || role?.name || value}</Typography>
                  </Box>
                );
              }}
            >
              <MenuItem value="" disabled>
                <Typography variant="body2" sx={{ color: '#999999' }}>Select a role...</Typography>
              </MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={String(role.id)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeOutlined sx={{ fontSize: 16, color: '#666666' }} />
                    <Typography variant="body2">{role.displayName || role.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Outlet / Persona — create mode only */}
          {!editingUser && (
            <FormControl
              fullWidth
              size="small"
              sx={{ '& .MuiInputLabel-root.Mui-focused': { color: PRIMARY } }}
            >
              <InputLabel>Outlet / Persona</InputLabel>
              <Select
                label="Outlet / Persona"
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value as string })}
                sx={selectSx}
                renderValue={(value) => {
                  if (!value) {
                    return (
                      <Typography variant="body2" sx={{ color: '#999999' }}>
                        Select an outlet...
                      </Typography>
                    );
                  }
                  const venue = venues.find((v) => String(v.id) === String(value));
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessOutlined sx={{ fontSize: 16, color: '#666666' }} />
                      <Typography variant="body2">{venue?.name || value}</Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="">
                  <Typography variant="body2" sx={{ color: '#999999' }}>None</Typography>
                </MenuItem>
                {venues.map((venue) => (
                  <MenuItem key={venue.id} value={String(venue.id)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessOutlined sx={{ fontSize: 16, color: '#666666' }} />
                      <Typography variant="body2">{venue.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

        </Box>
      </DialogContent>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            color: '#666666',
            borderColor: '#e0e0e0',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: '#bdbdbd' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSaveDisabled}
          startIcon={
            loading
              ? <CircularProgress size={16} color="inherit" />
              : editingUser
                ? <Edit sx={{ fontSize: 17 }} />
                : <PersonAddAltOutlined sx={{ fontSize: 17 }} />
          }
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            bgcolor: PRIMARY,
            '&:hover': { bgcolor: '#1565C0' },
            '&.Mui-disabled': { bgcolor: '#e0e0e0' },
          }}
        >
          {editingUser ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;

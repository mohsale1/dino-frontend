/**
 * UserFormDialog Component - System-style dark gradient dialog
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  FormControl,
  Select,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
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
  Store,
} from '@mui/icons-material';
import { applicationUserService } from '../../../services/application/user';
import { apiService } from '../../../utils/api';

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  dark0:   '#0f172a',
  dark1:   '#1e293b',
  slate:   '#64748b',
  muted:   '#94a3b8',
  border:  '#e2e8f0',
  surface: '#ffffff',
  bg:      '#f1f5f9',
  emerald: '#10b981',
  rose:    '#f43f5e',
  amber:   '#f59e0b',
};

const HEADER_GRADIENT = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)';

const labelSx = {
  fontWeight: 600,
  color: C.slate,
  mb: 0.75,
  display: 'block',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
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
  role_name: string;
  workspaceId: string;
  venueId: string;
  isActive: boolean;
}

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser: any | null;
  workspaceId: string;
  venueId: string;
  venues: any[];
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
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirm_password: '',
    role_id: '',
    role_name: '',
    workspaceId: workspaceId,
    venueId: venueId,
    isActive: true,
  });

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      loadRoles();
      setFormError('');
      if (editingUser) {
        setFormData({
          email: editingUser.email || '',
          firstName: editingUser.firstName || '',
          lastName: editingUser.lastName || '',
          phone: editingUser.phone || '',
          password: '',
          confirm_password: '',
          role_id: editingUser.role?.id || '',
          role_name: editingUser.role?.name || '',
          workspaceId: editingUser.workspaceId || workspaceId,
          venueId: editingUser.venueId || venueId,
          isActive: editingUser.isActive !== undefined ? editingUser.isActive : true,
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
          role_name: '',
          workspaceId: workspaceId,
          venueId: venueId,
          isActive: true,
        });
      }
    }
  }, [open, editingUser, workspaceId, venueId]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      // GET /application/roles — returns application roles only (role_type=1)
      const response = await apiService.get('/application/roles', {
        params: { page: 1, page_size: 100 },
      });
      const raw = (response.data as any);
      let rolesArray: any[] = [];
      if (Array.isArray(raw)) {
        rolesArray = raw;
      } else if (Array.isArray(raw?.data)) {
        rolesArray = raw.data;
      } else if (Array.isArray(raw?.items)) {
        rolesArray = raw.items;
      }
      setRoles(rolesArray);
    } catch {
      setFormError('Failed to load roles. Please close and try again.');
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setFormError('');

      if (editingUser) {
        const updateData: any = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        };
        if (formData.role_id) {
          updateData.role_id = Number(formData.role_id);
        }
        await applicationUserService.updateUser(editingUser.id, updateData);
      } else {
        if (formData.password !== formData.confirm_password) {
          setFormError('Passwords do not match');
          setLoading(false);
          return;
        }

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
      setFormError(error?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  // Save button disabled logic
  const isSaveDisabled = loading
    || !formData.firstName
    || !formData.lastName
    || (!editingUser && (!formData.email || !formData.password || !formData.role_id));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Dark gradient header ─────────────────────────────────────────────── */}
      <Box
        sx={{
          background: HEADER_GRADIENT,
          px: 3,
          pt: 3,
          pb: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -60,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#6366f1', 0.25)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: alpha('#fff', 0.12),
                border: `1px solid ${alpha('#fff', 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {editingUser
                ? <Edit sx={{ fontSize: 20, color: '#fff' }} />
                : <PersonAddAltOutlined sx={{ fontSize: 20, color: '#fff' }} />
              }
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                {editingUser ? 'Edit User' : 'Create New User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.7)', fontSize: '0.75rem' }}>
                {editingUser ? 'Update user information' : 'Add a new user to your venue'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: alpha('#fff', 0.7), '&:hover': { bgcolor: alpha('#fff', 0.1) } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ── Form content ────────────────────────────────────────────────────── */}
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>

          {/* Inline error alert */}
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')} sx={{ borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          {/* First / Last name */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={labelSx}>First Name</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={labelSx}>Last Name</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                sx={inputSx}
              />
            </Grid>
          </Grid>

          {/* Email — create only */}
          {!editingUser && (
            <Box>
              <Typography variant="caption" sx={labelSx}>Email Address</Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 18, color: C.muted }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Box>
          )}

          {/* Password fields — create only */}
          {!editingUser && (
            <>
              <Box>
                <Typography variant="caption" sx={labelSx}>Password</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockResetOutlined sx={{ fontSize: 18, color: C.muted }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={labelSx}>Confirm Password</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockResetOutlined sx={{ fontSize: 18, color: C.muted }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                          {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>
            </>
          )}

          {/* Phone */}
          <Box>
            <Typography variant="caption" sx={labelSx}>Phone</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlined sx={{ fontSize: 18, color: C.muted }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Box>

          {/* Role — FIX: no longer disabled in edit mode; role_id included in update payload */}
          <Box>
            <Typography variant="caption" sx={labelSx}>Role</Typography>
            <FormControl fullWidth size="small" required>
              <Select
                value={formData.role_id}
                onChange={(e) => {
                  const selectedRole = roles.find((r) => r.id === e.target.value);
                  setFormData({
                    ...formData,
                    role_id: e.target.value as string,
                    role_name: selectedRole?.name || '',
                  });
                }}
                displayEmpty
                disabled={loadingRoles}
                sx={{ borderRadius: 2 }}
                renderValue={(value) => {
                  if (!value) {
                    return <Typography variant="body2" sx={{ color: C.muted }}>
                      {loadingRoles ? 'Loading roles...' : 'Select a role...'}
                    </Typography>;
                  }
                  const role = roles.find((r) => r.id === value);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store sx={{ fontSize: 16, color: C.slate }} />
                      <Typography variant="body2">{role?.displayName || role?.name || value}</Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="" disabled>
                  <Typography variant="body2" sx={{ color: C.muted }}>Select a role...</Typography>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store sx={{ fontSize: 16, color: C.slate }} />
                      <Typography variant="body2">{role.displayName || role.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Venue */}
          <Box>
            <Typography variant="caption" sx={labelSx}>Venue</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value as string })}
                displayEmpty
                disabled={!!editingUser}
                sx={{ borderRadius: 2 }}
                renderValue={(value) => {
                  if (!value) {
                    return <Typography variant="body2" sx={{ color: C.muted }}>Select a venue...</Typography>;
                  }
                  const venue = venues.find((v) => v.id === value);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessOutlined sx={{ fontSize: 16, color: C.slate }} />
                      <Typography variant="body2">{venue?.name || value}</Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="" disabled>
                  <Typography variant="body2" sx={{ color: C.muted }}>Select a venue...</Typography>
                </MenuItem>
                {venues.map((venue) => (
                  <MenuItem key={venue.id} value={venue.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessOutlined sx={{ fontSize: 16, color: C.slate }} />
                      <Typography variant="body2">{venue.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

        </Stack>
      </DialogContent>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${C.border}`, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: C.slate,
            borderRadius: 2,
            px: 2.5,
            '&:hover': { bgcolor: alpha(C.slate, 0.06) },
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
            bgcolor: C.dark0,
            '&:hover': { bgcolor: C.dark1 },
            '&.Mui-disabled': { bgcolor: C.border },
          }}
        >
          {editingUser ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;

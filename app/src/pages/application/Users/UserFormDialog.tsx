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
  Store,
} from '@mui/icons-material';
import { applicationUserService } from '../../../services/application/user';
import { apiService } from '../../../utils/api';

// ─── Design tokens ──────────────────────────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#f8fafc',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: 'rgba(0,166,202,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#00A6CA' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#00A6CA' },
};

const selectSx = {
  borderRadius: 2,
  bgcolor: '#f8fafc',
  '& fieldset': { borderColor: '#e0e0e0' },
  '&:hover fieldset': { borderColor: 'rgba(0,166,202,0.4)' },
  '&.Mui-focused fieldset': { borderColor: '#00A6CA' },
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
          borderRadius: { xs: 0, sm: '12px' },
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Clean white header ───────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', px: 3, pt: 3, pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(0,166,202,0.08)',
                border: '1px solid rgba(0,166,202,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {editingUser
                ? <Edit sx={{ fontSize: 20, color: '#00A6CA' }} />
                : <PersonAddAltOutlined sx={{ fontSize: 20, color: '#00A6CA' }} />
              }
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#1C1C1E', fontWeight: 700, lineHeight: 1.2 }}>
                {editingUser ? 'Edit User' : 'Create New User'}
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

          {/* First / Last name */}
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

          {/* Email — create only */}
          {!editingUser && (
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockResetOutlined sx={{ fontSize: 18, color: '#999999' }} />
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
                sx={fieldSx}
              />

              <TextField
                label="Confirm Password"
                fullWidth
                size="small"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockResetOutlined sx={{ fontSize: 18, color: '#999999' }} />
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
          <FormControl fullWidth size="small" required sx={{ '& .MuiInputLabel-root.Mui-focused': { color: '#00A6CA' } }}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={formData.role_id}
              onChange={(e) => {
                const selectedRole = roles.find((r) => r.id === e.target.value);
                setFormData({
                  ...formData,
                  role_id: e.target.value as string,
                  role_name: selectedRole?.name || '',
                });
              }}
              disabled={loadingRoles}
              sx={selectSx}
              renderValue={(value) => {
                if (!value) {
                  return (
                    <Typography variant="body2" sx={{ color: '#999999' }}>
                      {loadingRoles ? 'Loading roles...' : 'Select a role...'}
                    </Typography>
                  );
                }
                const role = roles.find((r) => r.id === value);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Store sx={{ fontSize: 16, color: '#666666' }} />
                    <Typography variant="body2">{role?.displayName || role?.name || value}</Typography>
                  </Box>
                );
              }}
            >
              <MenuItem value="" disabled>
                <Typography variant="body2" sx={{ color: '#999999' }}>Select a role...</Typography>
              </MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Store sx={{ fontSize: 16, color: '#666666' }} />
                    <Typography variant="body2">{role.displayName || role.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Venue */}
          <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root.Mui-focused': { color: '#00A6CA' } }}>
            <InputLabel>Persona</InputLabel>
            <Select
              label="Persona"
              value={formData.venueId}
              onChange={(e) => setFormData({ ...formData, venueId: e.target.value as string })}
              disabled={!!editingUser}
              sx={selectSx}
              renderValue={(value) => {
                if (!value) {
                  return <Typography variant="body2" sx={{ color: '#999999' }}>Select a persona...</Typography>;
                }
                const venue = venues.find((v) => v.id === value);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessOutlined sx={{ fontSize: 16, color: '#666666' }} />
                    <Typography variant="body2">{venue?.name || value}</Typography>
                  </Box>
                );
              }}
            >
              <MenuItem value="" disabled>
                <Typography variant="body2" sx={{ color: '#999999' }}>Select a persona...</Typography>
              </MenuItem>
              {venues.map((venue) => (
                <MenuItem key={venue.id} value={venue.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessOutlined sx={{ fontSize: 16, color: '#666666' }} />
                    <Typography variant="body2">{venue.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Box>
      </DialogContent>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#666666',
            borderRadius: 2,
            px: 2.5,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
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
            bgcolor: '#00A6CA',
            '&:hover': { bgcolor: '#005F8D' },
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

/**
 * UserFormDialog Component - Clean Professional Design
 * 
 * Create and edit users with a modern, minimal dialog
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { applicationUserService } from '../../../services/application/user';
import { roleService } from '../../../services/auth/role';

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

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
  editingUser,
  workspaceId,
  venueId,
  venues,
}) => {
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

  useEffect(() => {
    if (open) {
      loadRoles();
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
      const response = await roleService.getRoles({ page: 1, page_size: 100 });
      let rolesArray: any[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          rolesArray = response.data;
        } else if (typeof response.data === 'object' && 'items' in response.data && Array.isArray((response.data as any).items)) {
          rolesArray = (response.data as any).items;
        }
      }
      const applicationRoles = rolesArray.filter((role: any) => 
        role.role_type === 1 || role.roleType === 1 || role.role_type === '1'
      );
      setRoles(applicationRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (editingUser) {
        // Update existing user
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          isActive: formData.isActive,
        };
        await applicationUserService.updateUser(editingUser.id, updateData);
      } else {
        // Validate password confirmation
        if (formData.password !== formData.confirm_password) {
          alert('Passwords do not match');
          setLoading(false);
          return;
        }

        // Create new user
        const createData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          roleId: formData.role_id,
          organizationId: formData.venueId || undefined,
        };
        await applicationUserService.createUser(createData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.25rem' }}>
              {editingUser ? 'Edit User' : 'Create New User'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem', mt: 0.5 }}>
              {editingUser ? 'Update user information' : 'Add a new user to your venue'}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            />
          </Grid>

          {!editingUser && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a1a1a',
                  },
                }}
              />
            </Grid>
          )}

          {!editingUser && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1a1a1a',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1a1a1a',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1a1a1a',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1a1a1a',
                    },
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Role"
              value={formData.role_id}
              onChange={(e) => {
                const selectedRole = roles.find(r => r.id === e.target.value);
                setFormData({
                  ...formData,
                  role_id: e.target.value,
                  role_name: selectedRole?.name || '',
                });
              }}
              disabled={editingUser || loadingRoles}
              required={!editingUser}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.displayName || role.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Venue"
              value={formData.venueId}
              onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
              disabled={editingUser}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            >
              {venues.map((venue) => (
                <MenuItem key={venue.id} value={venue.id}>
                  {venue.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1a1a1a',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#1a1a1a',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1a1a' }}>
                    Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                    User can access the system
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            px: 3,
            color: '#374151',
            '&:hover': {
              backgroundColor: '#f3f4f6',
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            px: 3,
            backgroundColor: '#1a1a1a',
            '&:hover': {
              backgroundColor: '#374151',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : editingUser ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
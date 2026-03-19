/**
 * SecuritySection Component
 * 
 * Clean, professional security settings
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Save,
  Lock,
  VpnKey,
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

export interface SecuritySectionProps {
  securitySettings?: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
  };
  onSave?: (data: any) => Promise<void>;
  onChangePassword?: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  securitySettings,
  onSave,
  onChangePassword,
}) => {
  const [formData, setFormData] = useState({
    twoFactorEnabled: securitySettings?.twoFactorEnabled ?? false,
    sessionTimeout: securitySettings?.sessionTimeout ?? 30,
    loginNotifications: securitySettings?.loginNotifications ?? true,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setPasswordError('');
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaving(true);
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save security settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!onChangePassword) return;

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      await onChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Change Password */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              color: '#1a1a1a',
              mb: 0.5,
            }}
          >
            Change Password
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: '0.875rem',
            }}
          >
            Update your password to keep your account secure
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {passwordError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 1.5,
                border: '1px solid #fecaca',
              }}
            >
              {passwordError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
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

            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              helperText="Must be at least 8 characters long"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
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

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={changingPassword ? <CircularProgress size={16} color="inherit" /> : <VpnKey />}
                onClick={handlePasswordSubmit}
                disabled={changingPassword}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 3,
                  backgroundColor: '#1a1a1a',
                  '&:hover': {
                    backgroundColor: '#374151',
                  },
                }}
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Security Settings */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              color: '#1a1a1a',
              mb: 0.5,
            }}
          >
            Security Settings
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: '0.875rem',
            }}
          >
            Manage your account security preferences
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#374151',
                  flexShrink: 0,
                }}
              >
                <Lock sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: '#1a1a1a',
                    mb: 0.25,
                  }}
                >
                  Two-Factor Authentication
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.8125rem',
                  }}
                >
                  Add an extra layer of security to your account
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={formData.twoFactorEnabled}
              onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#1a1a1a',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#1a1a1a',
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#374151',
                  flexShrink: 0,
                }}
              >
                <SecurityIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: '#1a1a1a',
                    mb: 0.25,
                  }}
                >
                  Login Notifications
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.8125rem',
                  }}
                >
                  Get notified when someone logs into your account
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={formData.loginNotifications}
              onChange={(e) => handleChange('loginNotifications', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#1a1a1a',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#1a1a1a',
                },
              }}
            />
          </Box>

          {hasChanges && (
            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData({
                    twoFactorEnabled: securitySettings?.twoFactorEnabled ?? false,
                    sessionTimeout: securitySettings?.sessionTimeout ?? 30,
                    loginNotifications: securitySettings?.loginNotifications ?? true,
                  });
                  setHasChanges(false);
                }}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 3,
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 3,
                  backgroundColor: '#1a1a1a',
                  '&:hover': {
                    backgroundColor: '#374151',
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SecuritySection;
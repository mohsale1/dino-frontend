import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  VpnKey as VpnKeyIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

interface PasswordUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newPassword: string) => void | Promise<void>;
  userName: string;
  loading?: boolean;
}

const PasswordUpdateDialog: React.FC<PasswordUpdateDialogProps> = ({
  open,
  onClose,
  onConfirm,
  userName,
  loading = false,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsUpdating(false);
      setErrors({ newPassword: '', confirmPassword: '' });
    }
  }, [open]);

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return '#ef4444';
    if (strength < 70) return '#f59e0b';
    return '#10b981';
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  const handleConfirm = async () => {
    // Validate
    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError = newPassword !== confirmPassword ? 'Passwords do not match' : '';

    setErrors({
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    });

    if (newPasswordError || confirmPasswordError) {
      return;
    }

    try {
      setIsUpdating(true);
      await onConfirm(newPassword);
      onClose();
    } catch (error) {
      // Error handling is done by the parent component
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating && !loading) {
      onClose();
    }
  };

  const isConfirmDisabled = !newPassword || !confirmPassword || isUpdating || loading;
  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: alpha('#8b5cf6', 0.1),
              color: '#8b5cf6',
            }}
          >
            <VpnKeyIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: '1.125rem' }}>
              Update Password
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userName}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isUpdating || loading}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* New Password */}
          <Box>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!errors.newPassword}
              helperText={errors.newPassword || 'Minimum 8 characters with uppercase, lowercase, and number'}
              disabled={isUpdating || loading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                ),
              }}
            />
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Password Strength
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 600,
                      color: getStrengthColor(passwordStrength),
                    }}
                  >
                    {getStrengthLabel(passwordStrength)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(getStrengthColor(passwordStrength), 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getStrengthColor(passwordStrength),
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Confirm Password */}
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={isUpdating || loading}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  size="small"
                >
                  {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          gap: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isUpdating || loading}
          variant="outlined"
          sx={{
            minWidth: 110,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            py: 1,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: 'action.hover',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          variant="contained"
          sx={{
            minWidth: 140,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            py: 1,
            bgcolor: '#8b5cf6',
            '&:hover': {
              bgcolor: '#7c3aed',
            },
            '&:disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          {isUpdating || loading ? 'Updating...' : 'Update Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordUpdateDialog;
/**
 * ProfileSection Component
 *
 * Clean, professional profile settings
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Person,
} from '@mui/icons-material';

export interface ProfileSectionProps {
  userData?: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role?: string;
  };
  onSave?: (data: any) => Promise<void>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  userData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!onSave) return;

    try {
      setSaving(true);
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
    });
    setHasChanges(false);
  };

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#94a3b8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#1976d2',
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            color: '#0f172a',
            mb: 0.5,
          }}
        >
          Profile Information
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontSize: '0.875rem',
          }}
        >
          Update your personal information and profile picture
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Avatar Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            mb: 4,
            pb: 3,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={userData?.avatar}
              sx={{
                width: 80,
                height: 80,
                backgroundColor: '#1976d2',
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 600,
                border: '3px solid #e2e8f0',
              }}
            >
              {userData?.name?.charAt(0).toUpperCase() || <Person sx={{ fontSize: 40 }} />}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#1976d2',
                color: '#ffffff',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <PhotoCamera sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.125rem',
                color: '#0f172a',
                mb: 0.5,
              }}
            >
              {userData?.name || 'User Name'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.875rem',
                mb: 1,
              }}
            >
              {userData?.email || 'user@example.com'}
            </Typography>
            {userData?.role && (
              <Box
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(25,118,210,0.08)',
                  border: '1px solid rgba(25,118,210,0.2)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#1976d2',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {userData.role}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Form Fields */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              sx={textFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              sx={textFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Optional"
              sx={textFieldSx}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        {hasChanges && (
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                borderColor: '#e2e8f0',
                color: '#475569',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  backgroundColor: '#f8fafc',
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
                backgroundColor: '#1976d2',
                boxShadow: '0 4px 14px rgba(25,118,210,0.3)',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileSection;
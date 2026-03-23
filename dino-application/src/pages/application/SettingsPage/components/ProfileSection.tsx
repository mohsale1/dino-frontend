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
  Divider,
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

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
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
          Profile Information
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6b7280',
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
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={userData?.avatar}
              sx={{
                width: 80,
                height: 80,
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 600,
                border: '3px solid #f3f4f6',
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
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                width: 32,
                height: 32,
                '&:hover': { 
                  backgroundColor: '#374151',
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
                color: '#1a1a1a',
                mb: 0.5,
              }}
            >
              {userData?.name || 'User Name'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6b7280',
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
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#374151',
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Optional"
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
        </Grid>

        {/* Action Buttons */}
        {hasChanges && (
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid #f3f4f6',
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
  );
};

export default ProfileSection;
/**
 * WorkspaceSection Component
 * 
 * Clean, professional workspace settings
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import {
  Save,
  Business,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

export interface WorkspaceSectionProps {
  workspaceData?: {
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
    isActive: boolean;
  };
  onSave?: (data: any) => Promise<void>;
}

const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({
  workspaceData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: workspaceData?.name || '',
    description: workspaceData?.description || '',
    address: workspaceData?.address || '',
    city: workspaceData?.city || '',
    state: workspaceData?.state || '',
    postalCode: workspaceData?.postalCode || '',
    phone: workspaceData?.phone || '',
    email: workspaceData?.email || '',
    isActive: workspaceData?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
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
      console.error('Failed to save workspace:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: workspaceData?.name || '',
      description: workspaceData?.description || '',
      address: workspaceData?.address || '',
      city: workspaceData?.city || '',
      state: workspaceData?.state || '',
      postalCode: workspaceData?.postalCode || '',
      phone: workspaceData?.phone || '',
      email: workspaceData?.email || '',
      isActive: workspaceData?.isActive ?? true,
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
          Workspace Settings
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6b7280',
            fontSize: '0.875rem',
          }}
        >
          Manage your workspace information and operational details
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Status Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            pb: 3,
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Business sx={{ fontSize: 24, color: '#ffffff' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.125rem',
                color: '#1a1a1a',
                mb: 0.5,
              }}
            >
              {formData.name || 'Workspace Name'}
            </Typography>
            <Chip
              icon={formData.isActive ? <CheckCircle /> : <Cancel />}
              label={formData.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                height: 24,
                fontWeight: 600,
                fontSize: '0.75rem',
                backgroundColor: formData.isActive ? '#dcfce7' : '#fee2e2',
                color: formData.isActive ? '#166534' : '#991b1b',
                border: formData.isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
                '& .MuiChip-icon': {
                  color: formData.isActive ? '#166534' : '#991b1b',
                },
              }}
            />
          </Box>
        </Box>

        {/* Form Fields */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Workspace Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
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

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
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
                    Workspace Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                    Enable or disable workspace operations
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
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

export default WorkspaceSection;
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
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
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
          Workspace Settings
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
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
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              backgroundColor: '#1976d2',
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
                color: '#0f172a',
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
                backgroundColor: formData.isActive
                  ? 'rgba(25,118,210,0.08)'
                  : '#fee2e2',
                color: formData.isActive ? '#1976d2' : '#991b1b',
                border: formData.isActive
                  ? '1px solid rgba(25,118,210,0.2)'
                  : '1px solid #fecaca',
                '& .MuiChip-icon': {
                  color: formData.isActive ? '#1976d2' : '#991b1b',
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
              sx={textFieldSx}
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
              sx={textFieldSx}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              sx={textFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              required
              sx={textFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              required
              sx={textFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              required
              sx={textFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              sx={textFieldSx}
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
              sx={textFieldSx}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}
                  >
                    Workspace Active
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontSize: '0.8125rem' }}
                  >
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

export default WorkspaceSection;

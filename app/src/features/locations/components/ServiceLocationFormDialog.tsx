import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { ServiceLocation, ServiceLocationCreate, ServiceLocationUpdate } from '../types';

export interface ServiceLocationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServiceLocationCreate | ServiceLocationUpdate) => void;
  location?: ServiceLocation | null;
  loading?: boolean;
}

export const ServiceLocationFormDialog: React.FC<ServiceLocationFormDialogProps> = ({
  open,
  onClose,
  onSave,
  location,
  loading = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    identifier: '',
    name: '',
    capacity: '',
    description: '',
  });

  const [errors, setErrors] = useState({
    identifier: '',
    capacity: '',
  });

  useEffect(() => {
    if (location) {
      setFormData({
        identifier: location.identifier || '',
        name: location.name || '',
        capacity: location.capacity?.toString() || '',
        description: location.description || '',
      });
    } else {
      setFormData({
        identifier: '',
        name: '',
        capacity: '',
        description: '',
      });
    }
    setErrors({ identifier: '', capacity: '' });
  }, [location, open]);

  const validate = (): boolean => {
    const newErrors = { identifier: '', capacity: '' };

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Location identifier is required';
    }
    if (formData.capacity && parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    setErrors(newErrors);
    return !newErrors.identifier && !newErrors.capacity;
  };

  const handleSave = () => {
    if (validate()) {
      const data: ServiceLocationCreate | ServiceLocationUpdate = {
        identifier: formData.identifier,
        name: formData.name || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        description: formData.description || undefined,
      };
      onSave(data);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const isEdit = Boolean(location);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          px: 3,
          py: 2.5,
          overflow: 'hidden',
        }}
      >
        {/* Glow orb */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
          {/* Icon box */}
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha('#fff', 0.12),
              border: `1px solid ${alpha('#fff', 0.20)}`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LocationOnIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>

          {/* Title + subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}
            >
              {isEdit ? 'Edit Location' : 'Add Location'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: alpha('#fff', 0.65), lineHeight: 1.2 }}
            >
              {isEdit ? 'Update location details' : 'Create a new service location'}
            </Typography>
          </Box>

          {/* Close button */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: alpha('#fff', 0.7),
              '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.1) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
        <Grid container spacing={2}>
          {/* Row 1: Identifier + Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location Identifier"
              value={formData.identifier}
              onChange={(e) => handleChange('identifier', e.target.value)}
              error={Boolean(errors.identifier)}
              helperText={errors.identifier || 'e.g., LOC-001, Table-1'}
              required
              autoFocus
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Display Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              helperText="Optional friendly name"
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>

          {/* Row 2: Capacity full-width */}
          <Grid item xs={12}>
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              error={Boolean(errors.capacity)}
              helperText={errors.capacity || ' '}
              inputProps={{ min: 1 }}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>

          {/* Row 3: Description full-width */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          borderTop: '1px solid #e2e8f0',
          px: 3,
          py: 2,
          gap: 1,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}
      >
        <Button
          onClick={onClose}
          variant="text"
          disabled={loading}
          fullWidth={fullScreen}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            color: '#64748b',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          fullWidth={fullScreen}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 1.5,
            bgcolor: '#0f172a',
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          {isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceLocationFormDialog;
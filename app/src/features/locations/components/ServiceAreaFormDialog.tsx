import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Stack,
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
import GridViewIcon from '@mui/icons-material/GridView';
import type { ServiceArea, ServiceAreaCreate, ServiceAreaUpdate } from '../types';

export interface ServiceAreaFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServiceAreaCreate | ServiceAreaUpdate) => void;
  area?: ServiceArea | null;
  loading?: boolean;
}

export const ServiceAreaFormDialog: React.FC<ServiceAreaFormDialogProps> = ({
  open,
  onClose,
  onSave,
  area,
  loading = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState({
    name: '',
  });

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name || '',
        description: area.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
    setErrors({ name: '' });
  }, [area, open]);

  const validate = (): boolean => {
    const newErrors = { name: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Area name is required';
    }

    setErrors(newErrors);
    return !newErrors.name;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors.name && field === 'name') {
      setErrors({ name: '' });
    }
  };

  const isEdit = Boolean(area);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xs"
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
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          px: 3,
          py: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Icon box */}
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha('#1976D2', 0.08),
              border: `1px solid ${alpha('#1976D2', 0.20)}`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GridViewIcon sx={{ color: '#1976D2', fontSize: 20 }} />
          </Box>

          {/* Title + subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: '#1C1C1E', fontWeight: 700, lineHeight: 1.2 }}
            >
              {isEdit ? 'Edit Area' : 'Add Area'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#666666', lineHeight: 1.2 }}
            >
              {isEdit ? 'Update area details' : 'Create a new service area'}
            </Typography>
          </Box>

          {/* Close button */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#666666',
              '&:hover': { color: '#1C1C1E', bgcolor: alpha('#000', 0.06) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
        <Stack spacing={2}>
          <TextField
            label="Area Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name || ' '}
            required
            autoFocus
            variant="outlined"
            size="small"
            fullWidth
          />
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
        </Stack>
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
            bgcolor: '#1976D2',
            '&:hover': { bgcolor: '#1565C0' },
          }}
        >
          {isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceAreaFormDialog;

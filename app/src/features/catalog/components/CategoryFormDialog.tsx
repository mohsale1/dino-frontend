import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Box, Typography, IconButton,
  Stack, Alert, useTheme, useMediaQuery, alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit,
  CategoryOutlined as CategoryOutlinedIcon,
} from '@mui/icons-material';
import type { Category, CategoryCreate, CategoryUpdate } from '../types';

const HEADER_GRADIENT = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)';

const labelSx = {
  fontWeight: 600,
  color: '#64748b',
  mb: 0.75,
  display: 'block',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

export interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CategoryCreate | CategoryUpdate) => void;
  category?: Category | null;
  loading?: boolean;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open, onClose, onSave, category, loading = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setFormError('');
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
        });
      } else {
        setFormData({ name: '', description: '' });
      }
    }
  }, [open, category]);

  const handleSubmit = () => {
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return;
    }
    onSave({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });
  };

  const isSaveDisabled = loading || !formData.name.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 }, overflow: 'hidden' } }}
    >
      {/* Dark gradient header */}
      <Box
        sx={{
          background: HEADER_GRADIENT,
          px: 3, pt: 3, pb: 3,
          position: 'relative', overflow: 'hidden',
          '&::before': {
            content: '""', position: 'absolute', top: -60, right: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#6366f1', 0.25)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: alpha('#fff', 0.12), border: `1px solid ${alpha('#fff', 0.2)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {category
                ? <Edit sx={{ fontSize: 20, color: '#fff' }} />
                : <CategoryOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />
              }
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                {category ? 'Edit Category' : 'New Category'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.7)', fontSize: '0.75rem' }}>
                {category ? 'Update category details' : 'Add a new category to your catalog'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: alpha('#fff', 0.7), '&:hover': { bgcolor: alpha('#fff', 0.1) } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Form content */}
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')} sx={{ borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          {/* Name */}
          <Box>
            <Typography variant="caption" sx={labelSx}>Category Name *</Typography>
            <TextField
              fullWidth size="small"
              placeholder="e.g. Starters, Main Course, Beverages"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              autoFocus
              sx={inputSx}
            />
          </Box>

          {/* Description */}
          <Box>
            <Typography variant="caption" sx={labelSx}>Description</Typography>
            <TextField
              fullWidth size="small" multiline rows={3}
              placeholder="Describe this category..."
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              sx={inputSx}
            />
          </Box>

        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e2e8f0', gap: 1 }}>
        <Button
          onClick={onClose} disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b', borderRadius: 2, px: 2.5, '&:hover': { bgcolor: alpha('#64748b', 0.06) } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSaveDisabled}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : category ? <Edit sx={{ fontSize: 17 }} /> : <CategoryOutlinedIcon sx={{ fontSize: 17 }} />}
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
            bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' },
            '&.Mui-disabled': { bgcolor: '#e2e8f0' },
          }}
        >
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;
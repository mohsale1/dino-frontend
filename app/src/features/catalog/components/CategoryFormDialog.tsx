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

const labelSx = {
  fontWeight: 600,
  color: '#666666',
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
      {/* Light header */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          px: 3, pt: 3, pb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {category
                ? <Edit sx={{ fontSize: 20, color: '#1976D2' }} />
                : <CategoryOutlinedIcon sx={{ fontSize: 20, color: '#1976D2' }} />
              }
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#1C1C1E', fontWeight: 700, lineHeight: 1.2 }}>
                {category ? 'Edit Category' : 'New Category'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem' }}>
                {category ? 'Update category details' : 'Add a new category to your catalog'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#666666', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
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
      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button
          onClick={onClose} disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#666666', borderRadius: 2, px: 2.5, '&:hover': { bgcolor: alpha('#666666', 0.06) } }}
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
            bgcolor: '#1976D2', '&:hover': { bgcolor: '#1565C0' },
            '&.Mui-disabled': { bgcolor: '#e0e0e0' },
          }}
        >
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;

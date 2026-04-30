import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, TextField,
  Grid, MenuItem, CircularProgress, Box, Typography,
  IconButton, InputAdornment, Alert,
  useTheme, useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { CatalogItem, Category, CatalogItemCreate, CatalogItemUpdate } from '../types';

const labelSx = {
  fontWeight: 600, color: '#666666', mb: 0.75, display: 'block',
  fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
};

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

export interface CatalogItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CatalogItemCreate | CatalogItemUpdate) => Promise<void>;
  item?: CatalogItem | null;
  categories: Category[];
  loading?: boolean;
}

export const CatalogItemFormDialog: React.FC<CatalogItemFormDialogProps> = ({
  open, onClose, onSave, item, categories, loading = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    isVegetarian: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (open) {
      setFormError('');
      if (item) {
        setFormData({
          name: item.name || '',
          description: item.description || '',
          basePrice: item.basePrice?.toString() || '',
          categoryId: item.categoryId || '',
          isVegetarian: item.isVegetarian || false,
        });
        setImagePreview(item.imageUrl || null);
      } else {
        setFormData({
          name: '',
          description: '',
          basePrice: '',
          categoryId: categories[0]?.id || '',
          isVegetarian: false,
        });
        setImagePreview(null);
      }
    }
  }, [open, item, categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!formData.name.trim()) { setFormError('Item name is required'); return; }
    const price = parseFloat(formData.basePrice);
    if (isNaN(price) || price <= 0) { setFormError('A valid price is required'); return; }
    if (!formData.categoryId) { setFormError('Please select a category'); return; }

    const payload: CatalogItemCreate | CatalogItemUpdate = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      basePrice: price,
      categoryId: formData.categoryId,
      isVegetarian: formData.isVegetarian,
    };

    await onSave(payload);
  };

  const isEdit = Boolean(item);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            {isEdit ? 'Edit Item' : 'Add Item'}
          </Typography>
          <Typography sx={{ color: '#666666', fontSize: '0.78rem', mt: 0.25 }}>
            {isEdit ? 'Update catalog item details' : 'Create a new catalog item'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#666666', '&:hover': { color: '#1C1C1E', bgcolor: 'rgba(0,0,0,0.04)' } }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {formError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setFormError('')}>
            {formError}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Image upload */}
          <Grid item xs={12}>
            <Typography component="span" sx={labelSx}>Item Image</Typography>
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed #e0e0e0',
                borderRadius: 2,
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: '#f8fafc',
                transition: 'border-color 0.15s, bgcolor 0.15s',
                '&:hover': { borderColor: '#999999', bgcolor: '#f7f9fa' },
              }}
            >
              {imagePreview ? (
                <>
                  <Box component="img" src={imagePreview} alt="Preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box
                    onClick={e => { e.stopPropagation(); setImagePreview(null); }}
                    sx={{
                      position: 'absolute', top: 8, right: 8,
                      width: 28, height: 28, borderRadius: '50%',
                      bgcolor: 'rgba(239,68,68,0.9)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', '&:hover': { bgcolor: '#ef4444' },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 14, color: '#fff' }} />
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <ImageIcon sx={{ fontSize: 32, color: '#cbd5e1', mb: 0.5 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Click to upload image</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1' }}>PNG, JPG up to 5MB</Typography>
                </Box>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </Box>
          </Grid>

          {/* Name */}
          <Grid item xs={12}>
            <Typography component="span" sx={labelSx}>Item Name *</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Margherita Pizza"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              autoFocus
              sx={inputSx}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography component="span" sx={labelSx}>Description</Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="Describe the item..."
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              sx={inputSx}
            />
          </Grid>

          {/* Price + Category */}
          <Grid item xs={12} sm={6}>
            <Typography component="span" sx={labelSx}>Base Price *</Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder="0.00"
              value={formData.basePrice}
              onChange={e => setFormData(p => ({ ...p, basePrice: e.target.value }))}
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: '0.85rem', color: '#666666' }}>₹</Typography></InputAdornment>,
              }}
              sx={inputSx}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography component="span" sx={labelSx}>Category *</Typography>
            <TextField
              fullWidth
              size="small"
              select
              value={formData.categoryId}
              onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))}
              sx={inputSx}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Dietary */}
          <Grid item xs={12} sm={6}>
            <Typography component="span" sx={labelSx}>Dietary</Typography>
            <TextField
              fullWidth
              size="small"
              select
              value={formData.isVegetarian ? 'vegetarian' : 'non-vegetarian'}
              onChange={e => setFormData(p => ({ ...p, isVegetarian: e.target.value === 'vegetarian' }))}
              sx={inputSx}
            >
              <MenuItem value="vegetarian">Vegetarian</MenuItem>
              <MenuItem value="non-vegetarian">Non-Vegetarian</MenuItem>
            </TextField>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#666666', '&:hover': { bgcolor: '#f8fafc' } }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 700,
            bgcolor: '#1976D2', '&:hover': { bgcolor: '#1565C0' },
            boxShadow: 'none', px: 3,
          }}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatalogItemFormDialog;

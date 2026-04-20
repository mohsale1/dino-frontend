import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, TextField,
  Grid, MenuItem, CircularProgress, Box, Typography,
  IconButton, InputAdornment, Stack, Alert,
  useTheme, useMediaQuery, Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import type { CatalogItem, Category, CatalogItemCreate, CatalogItemUpdate } from '../types';

const HEADER_GRADIENT = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)';

const labelSx = {
  fontWeight: 600, color: '#64748b', mb: 0.75, display: 'block',
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
    preparationTime: '',
    isVegetarian: false,
    tags: [] as string[],
  });
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setFormError('');
      setTagInput('');
      setImageFile(null);
      if (item) {
        setFormData({
          name: item.name || '',
          description: item.description || '',
          basePrice: item.basePrice?.toString() || '',
          categoryId: item.categoryId || '',
          preparationTime: item.preparationTime?.toString() || '',
          isVegetarian: item.isVegetarian || false,
          tags: item.tags || [],
        });
        setImagePreview(item.imageUrls?.[0] || null);
      } else {
        setFormData({
          name: '',
          description: '',
          basePrice: '',
          categoryId: categories[0]?.id || '',
          preparationTime: '',
          isVegetarian: false,
          tags: [],
        });
        setImagePreview(null);
      }
    }
  }, [open, item, categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) =>
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

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
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      preparationTime: formData.preparationTime ? parseInt(formData.preparationTime, 10) : undefined,
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
      <Box sx={{ background: HEADER_GRADIENT, px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            {isEdit ? 'Edit Item' : 'Add Item'}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', mt: 0.25 }}>
            {isEdit ? 'Update catalog item details' : 'Create a new catalog item'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
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
                border: '2px dashed #e2e8f0',
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
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' },
              }}
            >
              {imagePreview ? (
                <>
                  <Box component="img" src={imagePreview} alt="Preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box
                    onClick={e => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
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
                startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>₹</Typography></InputAdornment>,
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

          {/* Prep time + Dietary */}
          <Grid item xs={12} sm={6}>
            <Typography component="span" sx={labelSx}>Preparation Time</Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder="e.g. 15"
              value={formData.preparationTime}
              onChange={e => setFormData(p => ({ ...p, preparationTime: e.target.value }))}
              inputProps={{ min: 0 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><TimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>min</Typography></InputAdornment>,
              }}
              sx={inputSx}
            />
          </Grid>

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

          {/* Tags */}
          <Grid item xs={12}>
            <Typography component="span" sx={labelSx}>Tags</Typography>
            {formData.tags.length > 0 && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}
                  />
                ))}
              </Stack>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                sx={{ flex: 1, ...inputSx }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderColor: '#e2e8f0', color: '#475569', '&:hover': { borderColor: '#94a3b8' } }}
              >
                Add
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#64748b', '&:hover': { bgcolor: '#f8fafc' } }}
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
            bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' },
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
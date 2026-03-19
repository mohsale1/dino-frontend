import React, { useState, useEffect } from 'react';
import {
  Grid,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Add,
  AttachMoney,
  Schedule,
} from '@mui/icons-material';
import { FormDialog, FormField } from '../../../components';
import type { CatalogItem, CatalogItemCreate, CatalogItemUpdate, Category } from '../types';

export interface CatalogItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CatalogItemCreate | CatalogItemUpdate) => void;
  item?: CatalogItem | null;
  categories: Category[];
  loading?: boolean;
}

export const CatalogItemFormDialog: React.FC<CatalogItemFormDialogProps> = ({
  open,
  onClose,
  onSave,
  item,
  categories,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    preparationTime: '',
    isVegetarian: false,
    tags: [] as string[],
  });

  const [errors, setErrors] = useState({
    name: '',
    basePrice: '',
    categoryId: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        basePrice: item.basePrice.toString(),
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
    setErrors({ name: '', basePrice: '', categoryId: '' });
    setNewTag('');
  }, [item, categories, open]);

  const validate = (): boolean => {
    const newErrors = { name: '', basePrice: '', categoryId: '' };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Valid price is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.basePrice && !newErrors.categoryId;
  };

  const handleSave = () => {
    if (validate()) {
      const data = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        categoryId: formData.categoryId,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
        metadata: {
          isVegetarian: formData.isVegetarian,
        },
      };
      onSave(data);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={item ? 'Edit Item' : 'Add Item'}
      subtitle={item ? 'Update item details' : 'Create a new catalog item'}
      submitText={item ? 'Update' : 'Add'}
      loading={loading}
    >
      <Grid container spacing={3}>
        {/* Image Upload Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Item Image
          </Typography>
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              backgroundColor: 'grey.50',
              position: 'relative',
            }}
          >
            {imagePreview ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 1,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'error.main',
                      color: 'white',
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box>
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PNG, JPG up to 5MB
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Basic Information
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormField
            label="Item Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            helperText={errors.name}
            required
            autoFocus
            placeholder="Enter item name"
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
            placeholder="Describe your item..."
          />
        </Grid>

        {/* Pricing & Category */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Pricing & Category
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Price"
            type="number"
            value={formData.basePrice}
            onChange={(e) => handleChange('basePrice', e.target.value)}
            error={errors.basePrice}
            helperText={errors.basePrice}
            required
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Category"
            select
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            error={errors.categoryId}
            helperText={errors.categoryId}
            required
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </FormField>
        </Grid>

        {/* Additional Details */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Additional Details
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Preparation Time"
            type="number"
            value={formData.preparationTime}
            onChange={(e) => handleChange('preparationTime', e.target.value)}
            inputProps={{ min: 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Schedule fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    minutes
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Dietary"
            select
            value={formData.isVegetarian ? 'vegetarian' : 'non-vegetarian'}
            onChange={(e) => handleChange('isVegetarian', e.target.value === 'vegetarian')}
          >
            <MenuItem value="vegetarian">🟢 Vegetarian</MenuItem>
            <MenuItem value="non-vegetarian">🔴 Non-Vegetarian</MenuItem>
          </FormField>
        </Grid>

        {/* Tags */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Tags
          </Typography>
          <Stack direction="row" spacing={1} mb={1} flexWrap="wrap" useFlexGap>
            {formData.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              sx={{ flex: 1 }}
            />
            <IconButton
              size="small"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&:disabled': {
                  backgroundColor: 'grey.300',
                },
              }}
            >
              <Add />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </FormDialog>
  );
};

export default CatalogItemFormDialog;
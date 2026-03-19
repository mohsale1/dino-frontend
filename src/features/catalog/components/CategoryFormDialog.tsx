import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, TextField, MenuItem } from '@mui/material';
import { FormDialog, FormField } from '../../../components';
import type { Category, CategoryCreate, CategoryUpdate } from '../types';

export interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CategoryCreate | CategoryUpdate) => void;
  category?: Category | null;
  loading?: boolean;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onClose,
  onSave,
  category,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    displayOrder: '',
  });

  const [errors, setErrors] = useState({
    name: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '',
        displayOrder: category.displayOrder?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: '',
        displayOrder: '',
      });
    }
    setErrors({ name: '' });
  }, [category, open]);

  const validate = (): boolean => {
    const newErrors = { name: '' };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return !newErrors.name;
  };

  const handleSave = () => {
    if (validate()) {
      const data = {
        name: formData.name,
        description: formData.description,
        ...(formData.icon && { icon: formData.icon }),
        ...(formData.displayOrder && { displayOrder: parseInt(formData.displayOrder) }),
      };
      onSave(data);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors.name && field === 'name') {
      setErrors({ name: '' });
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={category ? 'Edit Category' : 'Add Category'}
      subtitle={category ? 'Update category details' : 'Create a new category'}
      submitText={category ? 'Update' : 'Add'}
      loading={loading}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Basic Information
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormField
            label="Category Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            helperText={errors.name}
            required
            autoFocus
            placeholder="Enter category name"
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
            placeholder="Describe this category..."
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Display Settings
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Icon (Emoji)"
            value={formData.icon}
            onChange={(e) => handleChange('icon', e.target.value)}
            placeholder="📦"
            helperText="Use an emoji to represent this category"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Display Order"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => handleChange('displayOrder', e.target.value)}
            inputProps={{ min: 1 }}
            helperText="Order in which category appears"
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Tip:</strong> Use clear, descriptive names and organize categories by display order for better navigation.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </FormDialog>
  );
};

export default CategoryFormDialog;
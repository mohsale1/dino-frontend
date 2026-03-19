import React, { useState, useEffect } from 'react';
import { Grid, MenuItem } from '@mui/material';
import { FormDialog, FormField } from '../../../components';
import type { ServiceLocation, ServiceLocationCreate, ServiceLocationUpdate, ServiceArea } from '../types';

export interface ServiceLocationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServiceLocationCreate | ServiceLocationUpdate) => void;
  location?: ServiceLocation | null;
  areas: ServiceArea[];
  loading?: boolean;
}

export const ServiceLocationFormDialog: React.FC<ServiceLocationFormDialogProps> = ({
  open,
  onClose,
  onSave,
  location,
  areas,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    identifier: '',
    name: '',
    areaId: '',
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
        areaId: location.areaId || '',
        capacity: location.capacity?.toString() || '',
        description: location.description || '',
      });
    } else {
      setFormData({
        identifier: '',
        name: '',
        areaId: areas[0]?.id || '',
        capacity: '',
        description: '',
      });
    }
    setErrors({ identifier: '', capacity: '' });
  }, [location, areas, open]);

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
      const data = {
        identifier: formData.identifier,
        name: formData.name || undefined,
        areaId: formData.areaId || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        description: formData.description || undefined,
      };
      onSave(data);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={location ? 'Edit Location' : 'Add Location'}
      subtitle={location ? 'Update location details' : 'Create a new service location'}
      submitText={location ? 'Update' : 'Add'}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormField
            label="Location Identifier"
            value={formData.identifier}
            onChange={(e) => handleChange('identifier', e.target.value)}
            error={errors.identifier}
            helperText={errors.identifier || 'e.g., LOC-001, Table-1'}
            required
            autoFocus
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Display Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            helperText="Optional friendly name"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Area"
            select
            value={formData.areaId}
            onChange={(e) => handleChange('areaId', e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {areas.map((area) => (
              <MenuItem key={area.id} value={area.id}>
                {area.name}
              </MenuItem>
            ))}
          </FormField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
            error={errors.capacity}
            helperText={errors.capacity}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </FormDialog>
  );
};

export default ServiceLocationFormDialog;
import React, { useState, useEffect } from 'react';
import { FormDialog, FormField } from '../../../components';
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

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={area ? 'Edit Area' : 'Add Area'}
      subtitle={area ? 'Update area details' : 'Create a new service area'}
      submitText={area ? 'Update' : 'Add'}
      loading={loading}
    >
      <FormField
        label="Area Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        helperText={errors.name}
        required
        autoFocus
      />
      <FormField
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        multiline
        rows={3}
      />
    </FormDialog>
  );
};

export default ServiceAreaFormDialog;
import React from 'react';
import { Box, TextField } from '@mui/material';
import { RegistrationFormData } from '../types';

interface WorkspaceDetailsStepProps {
  formData: RegistrationFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '&.Mui-focused fieldset': { borderColor: '#1976D2' },
  },
  '& label.Mui-focused': { color: '#1976D2' },
};

const WorkspaceDetailsStep: React.FC<WorkspaceDetailsStepProps> = ({
  formData,
  onInputChange,
  errors,
}) => {
  return (
    <Box>
      <TextField
        fullWidth
        label="Workspace Name"
        value={formData.workspaceName}
        onChange={(e) => onInputChange('workspaceName', e.target.value)}
        error={!!errors.workspaceName}
        helperText={errors.workspaceName || 'A unique name for your workspace (e.g., "Acme Corp")'}
        required
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <TextField
        fullWidth
        label="Workspace Description"
        value={formData.workspaceDescription}
        onChange={(e) => onInputChange('workspaceDescription', e.target.value)}
        error={!!errors.workspaceDescription}
        helperText={errors.workspaceDescription || 'Optional description of your workspace'}
        multiline
        rows={3}
        sx={{ mb: 3.5, ...fieldSx }}
      />
    </Box>
  );
};

export default WorkspaceDetailsStep;

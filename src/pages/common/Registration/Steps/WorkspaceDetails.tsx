import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { Business } from '@mui/icons-material';
import { RegistrationFormData } from '../types';

interface WorkspaceDetailsStepProps {
  formData: RegistrationFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const WorkspaceDetailsStep: React.FC<WorkspaceDetailsStepProps> = ({
  formData,
  onInputChange,
  errors,
}) => {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Business sx={{ fontSize: 32, color: '#0f172a' }} />
        <Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
            Workspace Details
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Set up your workspace information
          </Typography>
        </Box>
      </Box>

      <TextField
        fullWidth
        label="Workspace Name"
        value={formData.workspaceName}
        onChange={(e) => onInputChange('workspaceName', e.target.value)}
        error={!!errors.workspaceName}
        helperText={errors.workspaceName || 'A unique name for your workspace (e.g., "Acme Corp")'}
        required
        sx={{ mb: 3.5 }}
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
        sx={{ mb: 3.5 }}
      />
    </Box>
  );
};

export default WorkspaceDetailsStep;
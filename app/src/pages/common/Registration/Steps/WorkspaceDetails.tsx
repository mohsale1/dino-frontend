import React from 'react';
import { Box, TextField, Typography, alpha } from '@mui/material';
import { Business } from '@mui/icons-material';
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
      <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: alpha('#1976D2', 0.1),
            border: `1.5px solid ${alpha('#1976D2', 0.25)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Business sx={{ fontSize: 26, color: '#1976D2' }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700 }}>
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

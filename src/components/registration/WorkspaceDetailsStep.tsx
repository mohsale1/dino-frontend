import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { Business } from '@mui/icons-material';
import { RegistrationFormData } from './types';
import { darkTextFieldStyles, darkTypographyStyles } from './formStyles';

interface WorkspaceDetailsStepProps {
  formData: RegistrationFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const WorkspaceDetailsStep: React.FC<WorkspaceDetailsStepProps> = ({
  formData,
  onInputChange,
  errors
}) => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: '1.25rem',
            ...darkTypographyStyles.heading,
          }}
        >
          <Business sx={{ color: '#ffffff' }} />
          Workspace Information
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ mb: 3, ...darkTypographyStyles.body }}
        >
          Set up your business workspace that will contain all your venues
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Workspace Name"
          value={formData.workspaceName}
          onChange={(e) => onInputChange('workspaceName', e.target.value)}
          error={!!errors.workspaceName}
          helperText={errors.workspaceName || `This will be your main business identifier (${formData.workspaceName.length}/100)`}
          required
          sx={darkTextFieldStyles}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Workspace Description"
          value={formData.workspaceDescription}
          onChange={(e) => onInputChange('workspaceDescription', e.target.value)}
          multiline
          rows={3}
          error={!!errors.workspaceDescription}
          helperText={errors.workspaceDescription || `Brief description of your business (optional) (${formData.workspaceDescription.length}/500)`}
          sx={darkTextFieldStyles}
        />
      </Grid>
    </Grid>
  );
};

export default WorkspaceDetailsStep;
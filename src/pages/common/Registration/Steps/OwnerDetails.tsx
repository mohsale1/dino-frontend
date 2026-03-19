import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { RegistrationFormData } from '../types';

interface AdminAccountStepProps {
  formData: RegistrationFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

const AdminAccountStep: React.FC<AdminAccountStepProps> = ({
  formData,
  onInputChange,
  errors,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
}) => {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Person sx={{ fontSize: 32, color: '#0f172a' }} />
        <Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
            Admin Account
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Create your administrator account
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.adminFirstName}
            onChange={(e) => onInputChange('adminFirstName', e.target.value)}
            error={!!errors.adminFirstName}
            helperText={errors.adminFirstName}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.adminLastName}
            onChange={(e) => onInputChange('adminLastName', e.target.value)}
            error={!!errors.adminLastName}
            helperText={errors.adminLastName}
            required
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.adminEmail}
            onChange={(e) => onInputChange('adminEmail', e.target.value)}
            error={!!errors.adminEmail}
            helperText={errors.adminEmail}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.adminPhone}
            onChange={(e) => onInputChange('adminPhone', e.target.value)}
            error={!!errors.adminPhone}
            helperText={errors.adminPhone || 'Contact phone number'}
            required
            placeholder="+1234567890"
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.adminPassword}
        onChange={(e) => onInputChange('adminPassword', e.target.value)}
        error={!!errors.adminPassword}
        helperText={errors.adminPassword || 'Minimum 8 characters'}
        required
        sx={{ mb: 3.5 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onTogglePassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={(e) => onInputChange('confirmPassword', e.target.value)}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onToggleConfirmPassword} edge="end">
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default AdminAccountStep;
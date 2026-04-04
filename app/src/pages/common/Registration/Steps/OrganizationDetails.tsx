import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  alpha,
} from '@mui/material';
import { Store } from '@mui/icons-material';
import { RegistrationFormData } from '../types';

interface OrganizationInformationStepProps {
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

const selectSx = {
  borderRadius: 2,
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
};

const OrganizationInformationStep: React.FC<OrganizationInformationStepProps> = ({
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
          <Store sx={{ fontSize: 26, color: '#1976D2' }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700 }}>
            Organization Details
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Tell us about your first venue/branch
          </Typography>
        </Box>
      </Box>

      <TextField
        fullWidth
        label="Organization Name"
        value={formData.organizationName}
        onChange={(e) => onInputChange('organizationName', e.target.value)}
        error={!!errors.organizationName}
        helperText={errors.organizationName || 'The name of your venue/branch'}
        required
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <TextField
        fullWidth
        label="Organization Description"
        value={formData.organizationDescription}
        onChange={(e) => onInputChange('organizationDescription', e.target.value)}
        error={!!errors.organizationDescription}
        helperText={errors.organizationDescription || 'Brief description of your venue'}
        multiline
        rows={3}
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ '&.Mui-focused': { color: '#1976D2' } }}>
              Organization Type
            </InputLabel>
            <Select
              value={formData.organizationType}
              onChange={(e) => onInputChange('organizationType', e.target.value)}
              label="Organization Type"
              sx={selectSx}
            >
              <MenuItem value={0}>Food &amp; Beverage</MenuItem>
              <MenuItem value={1}>Non-Food (Retail, Services, etc.)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ '&.Mui-focused': { color: '#1976D2' } }}>
              Order Type
            </InputLabel>
            <Select
              value={formData.orderType}
              onChange={(e) => onInputChange('orderType', e.target.value)}
              label="Order Type"
              sx={selectSx}
            >
              <MenuItem value={0}>Online (Self-Service/QR)</MenuItem>
              <MenuItem value={1}>Manual (Counter-Based)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 600, mb: 2 }}>
        Venue Location
      </Typography>

      <TextField
        fullWidth
        label="Address"
        value={formData.organizationLocation.address}
        onChange={(e) => onInputChange('organizationLocation.address', e.target.value)}
        error={!!errors['organizationLocation.address']}
        helperText={errors['organizationLocation.address']}
        required
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            value={formData.organizationLocation.city}
            onChange={(e) => onInputChange('organizationLocation.city', e.target.value)}
            error={!!errors['organizationLocation.city']}
            helperText={errors['organizationLocation.city']}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="State"
            value={formData.organizationLocation.state}
            onChange={(e) => onInputChange('organizationLocation.state', e.target.value)}
            error={!!errors['organizationLocation.state']}
            helperText={errors['organizationLocation.state']}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Postal Code"
            value={formData.organizationLocation.postal_code}
            onChange={(e) => onInputChange('organizationLocation.postal_code', e.target.value)}
            error={!!errors['organizationLocation.postal_code']}
            helperText={errors['organizationLocation.postal_code']}
            required
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Business Phone"
            value={formData.organizationPhone}
            onChange={(e) => onInputChange('organizationPhone', e.target.value)}
            error={!!errors.organizationPhone}
            helperText={errors.organizationPhone || 'Contact phone number'}
            required
            placeholder="+1234567890"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Business Email"
            type="email"
            value={formData.organizationEmail}
            onChange={(e) => onInputChange('organizationEmail', e.target.value)}
            error={!!errors.organizationEmail}
            helperText={errors.organizationEmail || 'Contact email address'}
            required
            sx={fieldSx}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrganizationInformationStep;
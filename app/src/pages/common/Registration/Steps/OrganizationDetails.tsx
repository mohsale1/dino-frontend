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
} from '@mui/material';
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
      <TextField
        fullWidth
        label="Persona Name"
        value={formData.personaName}
        onChange={(e) => onInputChange('personaName', e.target.value)}
        error={!!errors.personaName}
        helperText={errors.personaName || 'The name of your venue or branch'}
        required
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <TextField
        fullWidth
        label="Description"
        value={formData.personaDescription}
        onChange={(e) => onInputChange('personaDescription', e.target.value)}
        error={!!errors.personaDescription}
        helperText={errors.personaDescription || 'Brief description of your venue'}
        multiline
        rows={3}
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ '&.Mui-focused': { color: '#1976D2' } }}>
              Persona Type
            </InputLabel>
            <Select
              value={formData.personaType}
              onChange={(e) => onInputChange('personaType', e.target.value)}
              label="Persona Type"
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
              <MenuItem value={0}>Online (Self-Service / QR)</MenuItem>
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
        value={formData.personaLocation.address}
        onChange={(e) => onInputChange('personaLocation.address', e.target.value)}
        error={!!errors['personaLocation.address']}
        helperText={errors['personaLocation.address']}
        required
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            value={formData.personaLocation.city}
            onChange={(e) => onInputChange('personaLocation.city', e.target.value)}
            error={!!errors['personaLocation.city']}
            helperText={errors['personaLocation.city']}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="State"
            value={formData.personaLocation.state}
            onChange={(e) => onInputChange('personaLocation.state', e.target.value)}
            error={!!errors['personaLocation.state']}
            helperText={errors['personaLocation.state']}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Postal Code"
            value={formData.personaLocation.postal_code}
            onChange={(e) => onInputChange('personaLocation.postal_code', e.target.value)}
            error={!!errors['personaLocation.postal_code']}
            helperText={errors['personaLocation.postal_code']}
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
            value={formData.personaPhone}
            onChange={(e) => onInputChange('personaPhone', e.target.value)}
            error={!!errors.personaPhone}
            helperText={errors.personaPhone || 'Contact phone number'}
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
            value={formData.personaEmail}
            onChange={(e) => onInputChange('personaEmail', e.target.value)}
            error={!!errors.personaEmail}
            helperText={errors.personaEmail || 'Contact email address'}
            required
            sx={fieldSx}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrganizationInformationStep;
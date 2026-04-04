import React from 'react';
import { Box, TextField, Typography, Grid, alpha } from '@mui/material';
import { Payment } from '@mui/icons-material';
import { RegistrationFormData } from '../types';

interface BillingDetailsStepProps {
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

const BillingDetailsStep: React.FC<BillingDetailsStepProps> = ({
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
          <Payment sx={{ fontSize: 26, color: '#1976D2' }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700 }}>
            Billing Details
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Enter your billing information for invoicing
          </Typography>
        </Box>
      </Box>

      <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 600, mb: 2 }}>
        Billing Contact
      </Typography>

      <TextField
        fullWidth
        label="Billing Name"
        value={formData.billingName}
        onChange={(e) => onInputChange('billingName', e.target.value)}
        error={!!errors.billingName}
        helperText={errors.billingName || 'Full name for billing purposes'}
        required
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.billingEmail}
            onChange={(e) => onInputChange('billingEmail', e.target.value)}
            error={!!errors.billingEmail}
            helperText={errors.billingEmail || 'Email for invoices and receipts'}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.billingPhone}
            onChange={(e) => onInputChange('billingPhone', e.target.value)}
            error={!!errors.billingPhone}
            helperText={errors.billingPhone || 'Contact phone number'}
            placeholder="+1234567890"
            required
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 600, mb: 2 }}>
        Billing Address
      </Typography>

      <TextField
        fullWidth
        label="Address"
        value={formData.billingAddress.address}
        onChange={(e) => onInputChange('billingAddress.address', e.target.value)}
        error={!!errors['billingAddress.address']}
        helperText={errors['billingAddress.address']}
        required
        sx={{ mb: 3.5, ...fieldSx }}
      />

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            value={formData.billingAddress.city}
            onChange={(e) => onInputChange('billingAddress.city', e.target.value)}
            error={!!errors['billingAddress.city']}
            helperText={errors['billingAddress.city']}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="State"
            value={formData.billingAddress.state}
            onChange={(e) => onInputChange('billingAddress.state', e.target.value)}
            error={!!errors['billingAddress.state']}
            helperText={errors['billingAddress.state']}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Postal Code"
            value={formData.billingAddress.postal_code}
            onChange={(e) => onInputChange('billingAddress.postal_code', e.target.value)}
            error={!!errors['billingAddress.postal_code']}
            helperText={errors['billingAddress.postal_code']}
            required
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Country"
        value={formData.billingAddress.country}
        onChange={(e) => onInputChange('billingAddress.country', e.target.value)}
        error={!!errors['billingAddress.country']}
        helperText={errors['billingAddress.country'] || 'Country for billing'}
        placeholder="e.g., India"
        sx={fieldSx}
      />
    </Box>
  );
};

export default BillingDetailsStep;
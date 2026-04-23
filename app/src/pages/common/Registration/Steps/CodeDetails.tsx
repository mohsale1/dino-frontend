import React from 'react';
import {
  Box,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { RegistrationFormData } from '../types';

interface RegistrationCodeStepProps {
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

const RegistrationCodeStep: React.FC<RegistrationCodeStepProps> = ({
  formData,
  onInputChange,
  errors,
}) => {
  return (
    <Box>
      <TextField
        fullWidth
        label="Referral Code *"
        value={formData.referralCode}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
          onInputChange('referralCode', value);
          if (formData.referralCodeValid) {
            onInputChange('referralCodeValid', false);
            onInputChange('referredByName', '');
          }
        }}
        error={!!errors.referralCode}
        helperText={errors.referralCode || '4-digit code from your agent'}
        required
        type="password"
        placeholder="••••"
        inputProps={{
          maxLength: 4,
          style: {
            fontSize: '2rem',
            textAlign: 'center',
            letterSpacing: '0.5rem',
            fontWeight: 600,
          },
        }}
        sx={{ mb: 3, ...fieldSx }}
      />

      {formData.referralCodeValid && formData.referredByName && (
        <Box
          sx={{
            p: 2.5,
            backgroundColor: alpha('#10b981', 0.08),
            borderRadius: 2,
            border: `1.5px solid ${alpha('#10b981', 0.4)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 600 }}>
            Valid Code — Referred by: {formData.referredByName}
          </Typography>
        </Box>
      )}
    </Box>
  );
};


export default RegistrationCodeStep;

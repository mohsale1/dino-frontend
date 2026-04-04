import React from 'react';
import {
  Box,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { CheckCircle, VpnKey } from '@mui/icons-material';
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
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: alpha('#1976D2', 0.1),
            border: `2px solid ${alpha('#1976D2', 0.25)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <VpnKey sx={{ fontSize: 40, color: '#1976D2' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, mb: 1 }}>
          Referral Code Required
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
          Enter the 4-digit code provided by your onboarding agent
        </Typography>
      </Box>

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
        placeholder="0000"
        inputProps={{
          maxLength: 4,
          style: {
            fontSize: '2rem',
            textAlign: 'center',
            letterSpacing: '0.5rem',
            fontWeight: 600,
          },
        }}
        sx={{
          mb: 3,
          ...fieldSx,
        }}
      />

      {formData.referralCodeValid && formData.referredByName && (
        <Box
          sx={{
            p: 2.5,
            mb: 3,
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

      <Box
        sx={{
          p: 3,
          backgroundColor: alpha('#1976D2', 0.04),
          borderRadius: 2,
          border: `1.5px solid ${alpha('#1976D2', 0.2)}`,
        }}
      >
        <Typography variant="body2" sx={{ color: '#0f172a', mb: 0.75, fontWeight: 600 }}>
          Don't have a code?
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.6 }}>
          Contact your onboarding agent or sales representative to obtain a referral code.
          This code is required to create a new workspace.
        </Typography>
      </Box>
    </Box>
  );
};

export default RegistrationCodeStep;
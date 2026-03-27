import React from 'react';
import {
  Box,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { VpnKey } from '@mui/icons-material';
import { RegistrationFormData } from '../types';

interface RegistrationCodeStepProps {
  formData: RegistrationFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

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
            backgroundColor: alpha('#0f172a', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <VpnKey sx={{ fontSize: 40, color: '#0f172a' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mb: 1 }}>
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
          // Only allow 4 digits
          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
          onInputChange('referralCode', value);
          // Reset validation when code changes
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
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      {formData.referralCodeValid && formData.referredByName && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: alpha('#10b981', 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha('#10b981', 0.3)}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 600 }}>
            âœ“ Valid Code - Referred by: {formData.referredByName}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          p: 3,
          backgroundColor: alpha('#3b82f6', 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha('#3b82f6', 0.2)}`,
        }}
      >
        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
          <strong>Don't have a code?</strong>
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Contact your onboarding agent or sales representative to obtain a referral code. 
          This code is required to create a new workspace.
        </Typography>
      </Box>
    </Box>
  );
};

export default RegistrationCodeStep;
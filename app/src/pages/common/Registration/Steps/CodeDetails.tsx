import React from 'react';
import {
  Box,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { CheckCircle, PersonSearch } from '@mui/icons-material';
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
      {/* Instruction banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: alpha('#1976D2', 0.06),
          border: `1px solid ${alpha('#1976D2', 0.18)}`,
        }}
      >
        <PersonSearch sx={{ color: '#1976D2', fontSize: 20, mt: 0.1, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: '#1e3a5f', lineHeight: 1.6 }}>
          If you were referred by an agent, enter their email address below — we will verify
          their account and link your registration to them. This step is optional.
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Agent Email Address"
        type="email"
        value={formData.referralEmail}
        onChange={(e) => {
          const value = e.target.value.trim();
          onInputChange('referralEmail', value);
          // Reset validation state whenever the email changes
          if (formData.referralEmailValid) {
            onInputChange('referralEmailValid', false);
            onInputChange('referredByName', '');
          }
        }}
        error={!!errors.referralEmail}
        helperText={errors.referralEmail || 'Optional — enter if you were referred by an agent'}
        placeholder="agent@example.com"
        autoComplete="off"
        sx={{ mb: 3, ...fieldSx }}
      />

      {/* Validated agent card */}
      {formData.referralEmailValid && formData.referredByName && (
        <Box
          sx={{
            p: 2.5,
            backgroundColor: alpha('#10b981', 0.07),
            borderRadius: 2,
            border: `1.5px solid ${alpha('#10b981', 0.35)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <CheckCircle sx={{ color: '#10b981', fontSize: 22, flexShrink: 0 }} />
          <Box>
            <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 700, lineHeight: 1.4 }}>
              Agent verified
            </Typography>
            <Typography variant="caption" sx={{ color: '#047857' }}>
              Referred by: {formData.referredByName}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RegistrationCodeStep;

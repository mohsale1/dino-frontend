import React from 'react';
import { Box, LinearProgress, Typography, Stack, Chip } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { validatePasswordStrength } from '../../utils/security';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  compact?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
  compact = false,
}) => {
  const validation = validatePasswordStrength(password);
  
  const getStrengthColor = () => {
    if (!password) return 'grey';
    if (validation.score >= 4) return 'success';
    if (validation.score >= 3) return 'info';
    if (validation.score >= 2) return 'warning';
    return 'error';
  };

  const getStrengthLabel = () => {
    if (!password) return 'Enter password';
    if (validation.score >= 4) return 'Strong';
    if (validation.score >= 3) return 'Good';
    if (validation.score >= 2) return 'Fair';
    return 'Weak';
  };

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  if (compact) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Password strength:
          </Typography>
          <Typography
            variant="caption"
            fontWeight={600}
            color={`${getStrengthColor()}.main`}
          >
            {getStrengthLabel()}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(validation.score / 5) * 100}
          color={getStrengthColor() as any}
          sx={{ height: 4, borderRadius: 2 }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Password strength
          </Typography>
          <Chip
            label={getStrengthLabel()}
            size="small"
            color={getStrengthColor() as any}
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={(validation.score / 5) * 100}
          color={getStrengthColor() as any}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {showRequirements && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Password requirements:
          </Typography>
          <Stack spacing={0.5}>
            {requirements.map((req, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {req.met ? (
                  <Check sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <Close sx={{ fontSize: 16, color: 'text.disabled' }} />
                )}
                <Typography
                  variant="caption"
                  color={req.met ? 'success.main' : 'text.secondary'}
                  sx={{ fontWeight: req.met ? 500 : 400 }}
                >
                  {req.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthIndicator;
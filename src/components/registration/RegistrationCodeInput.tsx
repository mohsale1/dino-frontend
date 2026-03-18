import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  useTheme,
  alpha,
} from '@mui/material';
import { LockOutlined, ArrowForward } from '@mui/icons-material';
import { configService } from '../../services/business/configService';

interface RegistrationCodeInputProps {
  onCodeVerified: (code: string) => void;
}

const RegistrationCodeInput: React.FC<RegistrationCodeInputProps> = ({ onCodeVerified }) => {
  const theme = useTheme();
  
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    
    if (pastedData.length === 4) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError(null);
      // Focus last input
      inputRefs.current[3]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isValid = await configService.verifyRegistrationCode(enteredCode);
      
      if (isValid) {
        onCodeVerified(enteredCode);
      } else {
        setError('Invalid registration code. Please try again.');
        setCode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code. Please try again.');
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography
          variant="h5"
          component="h2"
          fontWeight="700"
          sx={{
            mb: 1,
            fontSize: { xs: '1.25rem', sm: '1.25rem' },
            color: 'text.primary',
          }}
        >
          Enter Registration Code
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.8rem', sm: '1rem' },
          }}
        >
          Please enter the 4-digit code to proceed
        </Typography>
      </Box>

      {/* Lock Icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockOutlined
            sx={{
              fontSize: 35,
              color: 'primary.main',
            }}
          />
        </Box>
      </Box>

      {/* OTP Input Fields */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 1, sm: 1 },
          mb: 1,
        }}
      >
        {code.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e as any)}
            onPaste={index === 0 ? handlePaste : undefined}
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: 700,
                padding: '14px 0',
              },
            }}
            sx={{
              width: { xs: 55, sm: 65 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                  borderColor: 'primary.main',
                },
              },
              '& input': {
                color: 'primary.main',
              },
            }}
            disabled={loading}
            error={!!error}
          />
        ))}
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 1, width: '100%' }}>
          {error}
        </Alert>
      )}

      {/* Verify Button */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleVerify}
        disabled={!isCodeComplete || loading}
        endIcon={loading ? <CircularProgress size={20} /> : <ArrowForward />}
        sx={{
          py: 1,
          borderRadius: 1,
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
          mb: 1,
        }}
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </Button>

      {/* Help Text */}
      <Box
        sx={{
          mt: 1,
          p: 1,
          borderRadius: 1,
          backgroundColor: alpha(theme.palette.info.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.2),
          width: '100%',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
            textAlign: 'center',
          }}
        >
          Don't have a registration code? Please contact your administrator to obtain one.
        </Typography>
      </Box>
    </Box>
  );
};

export default RegistrationCodeInput;
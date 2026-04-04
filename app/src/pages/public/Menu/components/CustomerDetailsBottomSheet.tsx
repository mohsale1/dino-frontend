import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Slide,
  InputAdornment,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { Person as PersonIcon, Phone as PhoneIcon } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CustomerDetailsBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}

const COLORS = {
  primary: '#1a1a1a',
  accent: '#f97316',
  border: '#e8e8e8',
  bg: '#fafafa',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: COLORS.bg,
    fontSize: '0.95rem',
    '& fieldset': { borderColor: COLORS.border },
    '&:hover fieldset': { borderColor: '#d1d5db' },
    '&.Mui-focused fieldset': { borderColor: COLORS.accent, borderWidth: 2 },
  },
  '& .MuiFormHelperText-root': {
    mx: 0,
    mt: 0.75,
  },
};

const CustomerDetailsBottomSheet: React.FC<CustomerDetailsBottomSheetProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(name, phone);
      setName('');
      setPhone('');
      setErrors({});
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          m: 0,
          width: '100%',
          maxWidth: '100%',
          borderRadius: '20px 20px 0 0',
          maxHeight: '90vh',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        },
        '& .MuiBackdrop-root': {
          bgcolor: 'rgba(0,0,0,0.4)',
        },
      }}
    >
      {/* Handle bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 1.5,
          pb: 0.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: '2px',
            bgcolor: '#d1d5db',
          }}
        />
      </Box>

      {/* Header */}
      <Box sx={{ px: 3, pt: 1.5, pb: 0 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ color: COLORS.textPrimary, letterSpacing: '-0.02em', mb: 0.5 }}
        >
          Almost there!
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          We need a few details to process your order.
        </Typography>
      </Box>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Box display="flex" flexDirection="column" gap={2.5}>
          {/* Name Field */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: COLORS.textSecondary,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'block',
                mb: 1,
              }}
            >
              Full Name
            </Typography>
            <TextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="Your full name"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Box>

          {/* Phone Field */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: COLORS.textSecondary,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'block',
                mb: 1,
              }}
            >
              Phone Number
            </Typography>
            <TextField
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="Your phone number"
              type="tel"
              inputProps={{ maxLength: 15 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pt: 2, pb: 3, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          sx={{
            flex: 1,
            fontWeight: 600,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.95rem',
            color: COLORS.textSecondary,
            borderColor: COLORS.border,
            '&:hover': {
              borderColor: '#d1d5db',
              bgcolor: COLORS.bg,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          sx={{
            flex: 2,
            fontWeight: 700,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.95rem',
            bgcolor: COLORS.primary,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            '&:hover': {
              bgcolor: '#2d2d2d',
              boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Continue to Checkout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDetailsBottomSheet;
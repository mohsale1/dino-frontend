import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { Close as CloseIcon, Person as PersonIcon, Phone as PhoneIcon } from '@mui/icons-material';

interface CustomerDetailsBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CustomerDetailsBottomSheet: React.FC<CustomerDetailsBottomSheetProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validate = (): boolean => {
    let valid = true;
    if (name.trim().length < 2) {
      setNameError('Please enter your full name (at least 2 characters)');
      valid = false;
    } else {
      setNameError('');
    }
    if (!/^\d{10,}$/.test(phone.trim())) {
      setPhoneError('Please enter a valid phone number (at least 10 digits)');
      valid = false;
    } else {
      setPhoneError('');
    }
    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(name.trim(), phone.trim());
    setName('');
    setPhone('');
    setNameError('');
    setPhoneError('');
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setNameError('');
    setPhoneError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideUp}
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          m: 0,
          borderRadius: '20px 20px 0 0',
          maxWidth: '100%',
          maxHeight: '90dvh',
        },
      }}
    >
      <Box sx={{ px: 2.5, pt: 2, pb: 3 }}>
        {/* Handle bar */}
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: '#e2e8f0', mx: 'auto', mb: 2 }} />

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Your Details</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mt: 0.25 }}>
              We need this to process your order
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, p: 0.75 }}>
            <CloseIcon sx={{ fontSize: 16, color: '#64748b' }} />
          </IconButton>
        </Box>

        {/* Name field */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
            <PersonIcon sx={{ fontSize: 15, color: '#64748b' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Full Name</Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            autoComplete="name"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.9rem',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#f97316' },
                '&.Mui-focused fieldset': { borderColor: '#f97316', borderWidth: 1.5 },
              },
              '& .MuiFormHelperText-root': { fontSize: '0.72rem' },
            }}
          />
        </Box>

        {/* Phone field */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
            <PhoneIcon sx={{ fontSize: 15, color: '#64748b' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Phone Number</Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            error={!!phoneError}
            helperText={phoneError}
            inputMode="numeric"
            autoComplete="tel"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.9rem',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#f97316' },
                '&.Mui-focused fieldset': { borderColor: '#f97316', borderWidth: 1.5 },
              },
              '& .MuiFormHelperText-root': { fontSize: '0.72rem' },
            }}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              borderColor: '#e2e8f0',
              color: '#64748b',
              py: 1.2,
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              flex: 2,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: '#0f172a',
              color: '#fff',
              py: 1.2,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
            }}
          >
            Continue to Checkout
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CustomerDetailsBottomSheet;
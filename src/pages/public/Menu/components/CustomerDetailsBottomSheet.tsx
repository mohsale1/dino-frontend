import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Slide,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { Close as CloseIcon, Person as PersonIcon, Phone as PhoneIcon } from '@mui/icons-material';

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

const CustomerDetailsBottomSheet: React.FC<CustomerDetailsBottomSheetProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
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
          borderRadius: 0,
          maxHeight: '85vh',
          boxShadow: theme.shadows[24],
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Enter Your Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              We need this to process your order
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.grey[500], 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[500], 0.2),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                FULL NAME
              </Typography>
            </Box>
            <TextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="Enter your full name"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                  '&.Mui-focused': {
                    bgcolor: 'background.paper',
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                PHONE NUMBER
              </Typography>
            </Box>
            <TextField
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="Enter your phone number"
              type="tel"
              inputProps={{ maxLength: 15 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                  '&.Mui-focused': {
                    bgcolor: 'background.paper',
                  },
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          size="large"
          sx={{
            flex: 1,
            fontWeight: 600,
            borderRadius: 0,
            textTransform: 'none',
            color: 'text.secondary',
            border: '1px solid #e5e7eb',
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
            borderRadius: 0,
            textTransform: 'none',
            bgcolor: '#1a1a1a',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              bgcolor: '#2d2d2d',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s',
          }}
        >
          Continue to Checkout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDetailsBottomSheet;
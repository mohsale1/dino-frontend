import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography,
  alpha,
} from '@mui/material';
import {
  WarningAmber,
  ErrorOutline,
  InfoOutlined,
  LogoutOutlined,
} from '@mui/icons-material';

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  severity?: 'info' | 'warning' | 'error';
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmText,
  cancelLabel = 'Cancel',
  severity = 'warning',
}) => {
  const buttonText = confirmText || confirmLabel || 'Confirm';
  
  const getColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getIcon = () => {
    if (title.toLowerCase().includes('logout')) {
      return <LogoutOutlined sx={{ fontSize: 48 }} />;
    }
    switch (severity) {
      case 'error':
        return <ErrorOutline sx={{ fontSize: 48 }} />;
      case 'warning':
        return <WarningAmber sx={{ fontSize: 48 }} />;
      default:
        return <InfoOutlined sx={{ fontSize: 48 }} />;
    }
  };

  const getIconColor = () => {
    if (title.toLowerCase().includes('logout')) {
      return '#1976d2'; // Primary blue for logout
    }
    switch (severity) {
      case 'error':
        return '#d32f2f';
      case 'warning':
        return '#1976d2'; // Use primary blue instead of orange
      default:
        return '#1976d2';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogContent sx={{ pt: 4, pb: 2, px: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(getIconColor(), 0.1)}, ${alpha(getIconColor(), 0.05)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <Box sx={{ color: getIconColor() }}>
            {getIcon()}
          </Box>
        </Box>
        
        <Typography 
          variant="h5" 
          fontWeight={700} 
          gutterBottom
          sx={{ mb: 1.5 }}
        >
          {title}
        </Typography>
        
        <DialogContentText 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            py: 1.25,
            borderRadius: 2,
            borderWidth: 1.5,
            '&:hover': {
              borderWidth: 1.5,
            },
          }}
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color={getColor()} 
          fullWidth
          autoFocus
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            py: 1.25,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
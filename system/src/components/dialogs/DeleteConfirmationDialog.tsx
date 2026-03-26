import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import { Close as CloseIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  itemName: string;
  itemType: string;
  description?: string;
  loading?: boolean;
  additionalWarnings?: string[];
  requireTyping?: boolean;
  customConfirmText?: string;
  isSoftDelete?: boolean; // If true, shows soft-delete messaging
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  description,
  loading = false,
  additionalWarnings = [],
  requireTyping = true,
  customConfirmText = 'delete',
  isSoftDelete = false,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setConfirmText('');
      setIsDeleting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (requireTyping && confirmText.toLowerCase() !== customConfirmText.toLowerCase()) {
      return;
    }

    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {      // Error handling is done by the parent component
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting && !loading) {
      onClose();
    }
  };

  const isConfirmDisabled = requireTyping 
    ? confirmText.toLowerCase() !== customConfirmText.toLowerCase() || isDeleting || loading
    : isDeleting || loading;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: isSoftDelete ? 'warning.50' : 'error.50',
              color: isSoftDelete ? 'warning.main' : 'error.main',
            }}
          >
            <WarningIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: '1.125rem' }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isDeleting || loading}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        {/* Main Question */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.primary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Are you sure you want to {isSoftDelete ? 'deactivate' : 'delete'} {itemType}{' '}
            <Chip
              label={itemName}
              size="small"
              sx={{
                backgroundColor: isSoftDelete ? 'warning.50' : 'error.50',
                color: isSoftDelete ? 'warning.main' : 'error.main',
                fontWeight: 600,
                mx: 0.5,
                fontSize: '0.875rem',
              }}
            />
            ?
          </Typography>

          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              {description}
            </Typography>
          )}
        </Box>

        {/* Main Alert */}
        {isSoftDelete ? (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%',
              }
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              This {itemType} will be deactivated
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              The {itemType} will be hidden from the system but data will be preserved. You can restore it later if needed.
            </Typography>
          </Alert>
        ) : (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%',
              }
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              This action cannot be undone!
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              All data associated with this {itemType} will be permanently removed.
            </Typography>
          </Alert>
        )}

        {/* Additional Warnings */}
        {additionalWarnings.length > 0 && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              backgroundColor: 'info.50',
              '& .MuiAlert-message': {
                width: '100%',
              }
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
              Please note:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {additionalWarnings.map((warning, index) => (
                <Typography
                  key={index}
                  component="li"
                  variant="body2"
                  sx={{ 
                    mb: index < additionalWarnings.length - 1 ? 1 : 0,
                    lineHeight: 1.6,
                  }}
                >
                  {warning}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}

        {/* Confirmation Input */}
        {requireTyping && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.primary" sx={{ mb: 2, lineHeight: 1.6 }}>
              To confirm {isSoftDelete ? 'deactivation' : 'deletion'}, please type{' '}
              <Typography
                component="span"
                variant="body2"
                fontWeight={700}
                sx={{
                  backgroundColor: 'grey.100',
                  px: 1,
                  py: 0.5,
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }}
              >
                {customConfirmText}
              </Typography>{' '}
              below:
            </Typography>
            <TextField
              fullWidth
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${customConfirmText}" to confirm`}
              disabled={isDeleting || loading}
              error={requireTyping && confirmText.length > 0 && confirmText.toLowerCase() !== customConfirmText.toLowerCase()}
              helperText={
                requireTyping && confirmText.length > 0 && confirmText.toLowerCase() !== customConfirmText.toLowerCase()
                  ? `Please type "${customConfirmText}" exactly`
                  : ''
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused': {
                    '& fieldset': {
                      borderColor: confirmText.toLowerCase() === customConfirmText.toLowerCase() 
                        ? 'success.main' 
                        : 'error.main',
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          gap: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isDeleting || loading}
          variant="outlined"
          sx={{
            minWidth: 110,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            py: 1,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: 'action.hover',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          variant="contained"
          color={isSoftDelete ? 'warning' : 'error'}
          startIcon={
            isDeleting || loading ? undefined : <DeleteIcon sx={{ fontSize: 18 }} />
          }
          sx={{
            minWidth: 140,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            py: 1,
            '&:disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          {isDeleting || loading 
            ? (isSoftDelete ? 'Deactivating...' : 'Deleting...') 
            : (isSoftDelete ? `Deactivate ${itemType}` : `Delete ${itemType}`)
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
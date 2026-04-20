import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  AlertTitle,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  DeleteForever as DeleteForeverIcon,
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
  isSoftDelete?: boolean;
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
  requireTyping = false,
  customConfirmText = 'delete',
  isSoftDelete = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
    } catch {
      // Error handling is done by the parent component
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

  // Colors
  const errorColor = '#f43f5e';
  const errorHover = '#e11d48';
  const errorBg = 'rgba(244,63,94,0.08)';
  const errorBorder = 'rgba(244,63,94,0.2)';
  const warningColor = '#f59e0b';
  const warningHover = '#d97706';
  const warningBg = 'rgba(245,158,11,0.08)';
  const warningBorder = 'rgba(245,158,11,0.2)';

  const accentColor = isSoftDelete ? warningColor : errorColor;
  const accentHover = isSoftDelete ? warningHover : errorHover;
  const accentBg = isSoftDelete ? warningBg : errorBg;
  const accentBorder = isSoftDelete ? warningBorder : errorBorder;
  const glowBg = isSoftDelete
    ? 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)'
    : 'radial-gradient(circle, rgba(244,63,94,0.25) 0%, transparent 70%)';

  const confirmMatches =
    confirmText.length > 0 &&
    confirmText.toLowerCase() === customConfirmText.toLowerCase();
  const confirmMismatch =
    confirmText.length > 0 &&
    confirmText.toLowerCase() !== customConfirmText.toLowerCase();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.20)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          px: 3,
          py: 2.5,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -60,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: glowBg,
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left: icon + text */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha('#fff', 0.12),
                border: `1px solid ${alpha('#fff', 0.20)}`,
                borderRadius: 2,
              }}
            >
              {isSoftDelete ? (
                <WarningIcon sx={{ color: warningColor, fontSize: 20 }} />
              ) : (
                <DeleteForeverIcon sx={{ color: errorColor, fontSize: 20 }} />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1.0625rem',
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(199,210,254,0.70)',
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                  mt: 0.25,
                }}
              >
                {isSoftDelete
                  ? 'This action can be reversed later'
                  : 'This action is permanent and irreversible'}
              </Typography>
            </Box>
          </Box>

          {/* Close */}
          <IconButton
            onClick={handleClose}
            disabled={isDeleting || loading}
            size="small"
            sx={{
              ml: 1,
              flexShrink: 0,
              color: alpha('#ffffff', 0.70),
              transition: 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
              '&:hover': { bgcolor: alpha('#ffffff', 0.10), color: '#ffffff' },
              '&.Mui-disabled': { color: alpha('#ffffff', 0.28) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 3, pt: 3, pb: 2.5, bgcolor: '#ffffff' }}>
        {/* Main question */}
        <Typography
          variant="body1"
          sx={{ color: '#0f172a', lineHeight: 1.7, mb: description ? 1.5 : 2.5 }}
        >
          Are you sure you want to{' '}
          {isSoftDelete ? 'deactivate' : 'permanently delete'} the {itemType}{' '}
          <Box
            component="span"
            sx={{ fontWeight: 700, color: '#0f172a' }}
          >
            {itemName}
          </Box>
          ?
        </Typography>

        {/* Optional description */}
        {description && (
          <Typography
            variant="body2"
            sx={{ color: '#64748b', lineHeight: 1.7, mb: 2.5 }}
          >
            {description}
          </Typography>
        )}

        {/* Main alert */}
        <Alert
          severity={isSoftDelete ? 'warning' : 'error'}
          icon={isSoftDelete ? <WarningIcon fontSize="small" /> : <DeleteForeverIcon fontSize="small" />}
          sx={{
            mb: additionalWarnings.length > 0 || requireTyping ? 2 : 0,
            borderRadius: 1.5,
            bgcolor: accentBg,
            border: `1px solid ${accentBorder}`,
            color: '#0f172a',
            '& .MuiAlert-icon': {
              alignItems: 'center',
              pt: 0,
              color: accentColor,
            },
            '& .MuiAlert-message': { width: '100%', py: 0 },
          }}
        >
          <AlertTitle
            sx={{
              fontWeight: 700,
              fontSize: '0.8125rem',
              mb: 0.4,
              color: accentColor,
            }}
          >
            {isSoftDelete
              ? `This ${itemType} will be deactivated`
              : 'This action cannot be undone'}
          </AlertTitle>
          <Typography variant="body2" sx={{ lineHeight: 1.65, color: '#475569' }}>
            {isSoftDelete
              ? `The ${itemType} will be hidden from the system but all data will be preserved. You can restore it later if needed.`
              : `All data associated with this ${itemType} will be permanently removed from the system.`}
          </Typography>
        </Alert>

        {/* Additional warnings */}
        {additionalWarnings.length > 0 && (
          <Alert
            severity="info"
            sx={{
              mb: requireTyping ? 2 : 0,
              borderRadius: 1.5,
              border: '1px solid rgba(14,165,233,0.22)',
              bgcolor: 'rgba(14,165,233,0.06)',
              '& .MuiAlert-icon': { alignItems: 'flex-start', pt: 0.5 },
              '& .MuiAlert-message': { width: '100%', py: 0 },
            }}
          >
            <AlertTitle sx={{ fontWeight: 700, fontSize: '0.8125rem', mb: 0.75, color: '#0369a1' }}>
              Please note:
            </AlertTitle>
            <Box
              component="ul"
              sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.6 }}
            >
              {additionalWarnings.map((warning, index) => (
                <Typography
                  key={index}
                  component="li"
                  variant="body2"
                  sx={{ lineHeight: 1.65, color: '#475569' }}
                >
                  {warning}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}

        {/* Typing confirmation */}
        {requireTyping && (
          <Box
            sx={{
              p: 2,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: '#0f172a', lineHeight: 1.65, mb: 1.25 }}
            >
              To confirm {isSoftDelete ? 'deactivation' : 'deletion'}, type{' '}
              <Box
                component="span"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: accentColor,
                  bgcolor: accentBg,
                  border: `1px solid ${accentBorder}`,
                  px: 0.75,
                  py: 0.15,
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                {customConfirmText}
              </Box>{' '}
              below:
            </Typography>

            <TextField
              fullWidth
              size="small"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${customConfirmText}" to confirm`}
              disabled={isDeleting || loading}
              error={confirmMismatch}
              helperText={
                confirmMismatch
                  ? `Type "${customConfirmText}" exactly to proceed`
                  : confirmMatches
                  ? 'Confirmed'
                  : ''
              }
              inputProps={{ spellCheck: false, autoComplete: 'off' }}
              FormHelperTextProps={{
                sx: {
                  color: confirmMatches ? '#059669' : undefined,
                  fontWeight: confirmMatches ? 600 : undefined,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  bgcolor: '#ffffff',
                  transition: 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
                  '& fieldset': {
                    borderColor: confirmMatches
                      ? '#059669'
                      : confirmMismatch
                      ? accentColor
                      : '#e2e8f0',
                    transition: 'border-color 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
                  },
                  '&:hover fieldset': {
                    borderColor: confirmMatches
                      ? '#059669'
                      : confirmMismatch
                      ? accentColor
                      : '#94a3b8',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: confirmMatches ? '#059669' : accentColor,
                    borderWidth: '1.5px',
                  },
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.25,
          bgcolor: '#fafafa',
          borderTop: '1px solid #f1f5f9',
          gap: 1.25,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isDeleting || loading}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            borderRadius: 2,
            px: 3,
            py: 0.875,
            borderColor: '#e2e8f0',
            color: '#64748b',
            width: { xs: '100%', sm: 'auto' },
            transition: 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
            '&:hover': {
              borderColor: '#94a3b8',
              bgcolor: 'rgba(100,116,139,0.05)',
              color: '#475569',
            },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          variant="contained"
          startIcon={
            isDeleting || loading ? undefined : isSoftDelete ? (
              <WarningIcon sx={{ fontSize: 17 }} />
            ) : (
              <DeleteForeverIcon sx={{ fontSize: 17 }} />
            )
          }
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9375rem',
            borderRadius: 2,
            px: 3,
            py: 0.875,
            bgcolor: accentColor,
            color: '#ffffff',
            boxShadow: 'none',
            width: { xs: '100%', sm: 'auto' },
            transition: 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
            '&:hover': {
              bgcolor: accentHover,
              boxShadow: `0 4px 16px ${alpha(accentColor, 0.38)}`,
            },
            '&.Mui-disabled': {
              bgcolor: '#e2e8f0',
              color: '#94a3b8',
              boxShadow: 'none',
            },
          }}
        >
          {isDeleting || loading
            ? isSoftDelete
              ? 'Deactivating...'
              : 'Deleting...'
            : isSoftDelete
            ? `Deactivate ${itemType}`
            : `Delete ${itemType}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
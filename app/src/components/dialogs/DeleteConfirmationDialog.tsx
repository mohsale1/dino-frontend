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
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Close,
  Warning as WarningIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';

// ── Types ──────────────────────────────────────────────────────────────────────
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

// ── Colour tokens ──────────────────────────────────────────────────────────────
const COLORS = {
  error: {
    main:   '#ef4444',
    hover:  '#dc2626',
    bg:     'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
  warning: {
    main:   '#f59e0b',
    hover:  '#d97706',
    bg:     'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  info: {
    main:   '#1976D2',
    bg:     'rgba(25,118,210,0.06)',
    border: 'rgba(25,118,210,0.2)',
    title:  '#1565C0',
  },
  success: {
    main:   '#16a34a',
  },
};

// ── Component ──────────────────────────────────────────────────────────────────
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
  const theme      = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting,  setIsDeleting]  = useState(false);

  useEffect(() => {
    if (open) {
      setConfirmText('');
      setIsDeleting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (requireTyping && confirmText.toLowerCase() !== customConfirmText.toLowerCase()) return;
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch {
      // parent handles errors
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting && !loading) onClose();
  };

  const isBusy = isDeleting || loading;

  const isConfirmDisabled = requireTyping
    ? confirmText.toLowerCase() !== customConfirmText.toLowerCase() || isBusy
    : isBusy;

  // Accent palette
  const accent = isSoftDelete ? COLORS.warning : COLORS.error;

  // Typing field state
  const confirmMatches  = confirmText.length > 0 && confirmText.toLowerCase() === customConfirmText.toLowerCase();
  const confirmMismatch = confirmText.length > 0 && !confirmMatches;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          px: 3,
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        {/* Icon + title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: accent.bg,
              border: `1px solid ${accent.border}`,
              borderRadius: 2,
            }}
          >
            {isSoftDelete
              ? <WarningIcon      sx={{ fontSize: 20, color: accent.main }} />
              : <DeleteForeverIcon sx={{ fontSize: 20, color: accent.main }} />
            }
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: '#1C1C1E',
                fontWeight: 700,
                fontSize: '1rem',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                color: '#94a3b8',
                fontSize: '0.72rem',
                lineHeight: 1.4,
                mt: 0.2,
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
          size="small"
          onClick={handleClose}
          disabled={isBusy}
          sx={{
            flexShrink: 0,
            color: '#64748b',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#1C1C1E' },
            '&.Mui-disabled': { color: 'rgba(0,0,0,0.26)' },
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── CONTENT ── */}
      <DialogContent sx={{ px: 3, pt: 2.5, pb: 2, bgcolor: '#ffffff' }}>

        {/* Main question */}
        <Typography
          sx={{
            color: '#374151',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            mb: description ? 1.25 : 2,
          }}
        >
          Are you sure you want to{' '}
          <Box component="span" sx={{ fontWeight: 600, color: '#1C1C1E' }}>
            {isSoftDelete ? 'deactivate' : 'permanently delete'}
          </Box>
          {' '}the {itemType}{' '}
          <Box component="span" sx={{ fontWeight: 700, color: '#1C1C1E' }}>
            {itemName}
          </Box>
          ?
        </Typography>

        {/* Optional description */}
        {description && (
          <Typography
            sx={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7, mb: 2 }}
          >
            {description}
          </Typography>
        )}

        {/* Main alert */}
        <Alert
          severity={isSoftDelete ? 'warning' : 'error'}
          icon={
            isSoftDelete
              ? <WarningIcon      fontSize="small" />
              : <DeleteForeverIcon fontSize="small" />
          }
          sx={{
            mb: additionalWarnings.length > 0 || requireTyping ? 1.75 : 0,
            borderRadius: 1.5,
            bgcolor: accent.bg,
            border: `1px solid ${accent.border}`,
            '& .MuiAlert-icon': { alignItems: 'center', pt: 0, color: accent.main },
            '& .MuiAlert-message': { width: '100%', py: 0 },
          }}
        >
          <AlertTitle
            sx={{ fontWeight: 700, fontSize: '0.8125rem', mb: 0.4, color: accent.main }}
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
              mb: requireTyping ? 1.75 : 0,
              borderRadius: 1.5,
              bgcolor: COLORS.info.bg,
              border: `1px solid ${COLORS.info.border}`,
              '& .MuiAlert-icon': { alignItems: 'flex-start', pt: 0.5, color: COLORS.info.main },
              '& .MuiAlert-message': { width: '100%', py: 0 },
            }}
          >
            <AlertTitle
              sx={{ fontWeight: 700, fontSize: '0.8125rem', mb: 0.75, color: COLORS.info.title }}
            >
              Please note:
            </AlertTitle>
            <Box
              component="ul"
              sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.6 }}
            >
              {additionalWarnings.map((warning, i) => (
                <Typography
                  key={i}
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
              border: '1px solid #e0e0e0',
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: '#374151', lineHeight: 1.65, mb: 1.25 }}
            >
              To confirm {isSoftDelete ? 'deactivation' : 'deletion'}, type{' '}
              <Box
                component="span"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: accent.main,
                  bgcolor: accent.bg,
                  border: `1px solid ${accent.border}`,
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
              disabled={isBusy}
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
                  color: confirmMatches ? COLORS.success.main : undefined,
                  fontWeight: confirmMatches ? 600 : undefined,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  letterSpacing: '0.04em',
                  bgcolor: '#ffffff',
                  borderRadius: 1.5,
                  '& fieldset': {
                    borderColor: confirmMatches
                      ? COLORS.success.main
                      : confirmMismatch
                      ? accent.main
                      : '#e0e0e0',
                    transition: 'border-color 0.18s ease',
                  },
                  '&:hover fieldset': {
                    borderColor: confirmMatches
                      ? COLORS.success.main
                      : confirmMismatch
                      ? accent.main
                      : '#94a3b8',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: confirmMatches ? COLORS.success.main : accent.main,
                    borderWidth: '1px',
                  },
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      {/* ── ACTIONS ── */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: '#fafafa',
          borderTop: '1px solid #f1f5f9',
          gap: 1.25,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
        }}
      >
        {/* Cancel */}
        <Button
          onClick={handleClose}
          disabled={isBusy}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: 1.5,
            px: 2.5,
            py: 0.875,
            borderColor: '#e0e0e0',
            color: '#64748b',
            boxShadow: 'none',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: '#94a3b8',
              bgcolor: 'rgba(100,116,139,0.05)',
              color: '#475569',
              boxShadow: 'none',
            },
          }}
        >
          Cancel
        </Button>

        {/* Confirm / Delete */}
        <Button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          variant="contained"
          startIcon={
            isBusy
              ? <CircularProgress size={15} sx={{ color: 'inherit' }} />
              : isSoftDelete
              ? <WarningIcon      sx={{ fontSize: 16 }} />
              : <DeleteForeverIcon sx={{ fontSize: 16 }} />
          }
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            borderRadius: 1.5,
            px: 2.5,
            py: 0.875,
            bgcolor: accent.main,
            color: '#ffffff',
            boxShadow: 'none',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              bgcolor: accent.hover,
              boxShadow: `0 4px 14px ${alpha(accent.main, 0.35)}`,
            },
            '&.Mui-disabled': {
              bgcolor: '#e2e8f0',
              color: '#94a3b8',
              boxShadow: 'none',
            },
          }}
        >
          {isBusy
            ? isSoftDelete ? 'Deactivating...' : 'Deleting...'
            : isSoftDelete ? `Deactivate ${itemType}` : `Delete ${itemType}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;

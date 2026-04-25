import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Close,
  WarningAmber,
  ErrorOutline,
  InfoOutlined,
  LogoutOutlined,
  CheckCircleOutline,
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
  severity?: 'info' | 'warning' | 'error' | 'success';
  variant?: 'danger' | 'warning' | 'info';
}

// ── Severity config ────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  error: {
    color:  '#ef4444',
    hover:  '#dc2626',
    bg:     'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
  warning: {
    color:  '#f59e0b',
    hover:  '#d97706',
    bg:     'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  info: {
    color:  '#1976D2',
    hover:  '#1565C0',
    bg:     'rgba(25,118,210,0.08)',
    border: 'rgba(25,118,210,0.2)',
  },
  success: {
    color:  '#16a34a',
    hover:  '#15803d',
    bg:     'rgba(22,163,74,0.08)',
    border: 'rgba(22,163,74,0.2)',
  },
};

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
  const isLogout   = title.toLowerCase().includes('logout');

  // Resolve effective severity
  const effectiveSeverity: keyof typeof SEVERITY_CONFIG =
    isLogout ? 'info' : (severity in SEVERITY_CONFIG ? severity as keyof typeof SEVERITY_CONFIG : 'info');

  const cfg = SEVERITY_CONFIG[effectiveSeverity];

  // Icon
  const Icon = (() => {
    if (isLogout)              return LogoutOutlined;
    if (severity === 'error')  return ErrorOutline;
    if (severity === 'warning') return WarningAmber;
    if (severity === 'success') return CheckCircleOutline;
    return InfoOutlined;
  })();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
        },
      }}
    >
      {/* ── Header ── */}
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
              bgcolor: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 2,
            }}
          >
            <Icon sx={{ fontSize: 20, color: cfg.color }} />
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
              {severity === 'error' ? 'This action cannot be undone' : 'Please confirm to continue'}
            </Typography>
          </Box>
        </Box>

        {/* Close */}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            flexShrink: 0,
            color: '#64748b',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#1C1C1E' },
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Content ── */}
      <DialogContent sx={{ px: 3, pt: 2.5, pb: 2, bgcolor: '#ffffff' }}>
        <Typography
          sx={{
            color: '#374151',
            fontSize: '0.9rem',
            lineHeight: 1.7,
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: '#fafafa',
          borderTop: '1px solid #f1f5f9',
          gap: 1.25,
        }}
      >
        {/* Cancel */}
        <Button
          onClick={onClose}
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
            '&:hover': {
              borderColor: '#94a3b8',
              bgcolor: 'rgba(100,116,139,0.05)',
              color: '#475569',
              boxShadow: 'none',
            },
          }}
        >
          {cancelLabel}
        </Button>

        {/* Confirm */}
        <Button
          onClick={onConfirm}
          variant="contained"
          autoFocus
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            borderRadius: 1.5,
            px: 2.5,
            py: 0.875,
            bgcolor: cfg.color,
            color: '#ffffff',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: cfg.hover,
              boxShadow: `0 4px 14px ${alpha(cfg.color, 0.35)}`,
            },
            '&.Mui-disabled': {
              bgcolor: '#e2e8f0',
              color: '#94a3b8',
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

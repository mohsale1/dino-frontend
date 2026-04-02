import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { Close, SettingsOutlined } from '@mui/icons-material';

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onSubmit: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  submitLabel?: string;
  submitText?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  onSubmit,
  children,
  maxWidth = 'sm',
  submitLabel = 'Save',
  submitText,
  cancelLabel = 'Cancel',
  loading = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'hidden',
        },
      }}
    >
      {/* Dark gradient header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          px: 3,
          pt: 3,
          pb: 3,
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
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left: icon + title/subtitle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha('#ffffff', 0.12),
                border: `1px solid ${alpha('#ffffff', 0.20)}`,
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <SettingsOutlined sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: '#ffffff', fontWeight: 700, lineHeight: 1.2 }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(199,210,254,0.7)', fontSize: '0.75rem', lineHeight: 1.4 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Close button */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: alpha('#ffffff', 0.7),
              '&:hover': { bgcolor: alpha('#ffffff', 0.10) },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: '1px solid #e2e8f0',
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            borderRadius: 2,
            px: 2.5,
            '&:hover': { bgcolor: 'rgba(100,116,139,0.06)' },
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            bgcolor: '#0f172a',
            '&:hover': { bgcolor: '#1e293b' },
            '&.Mui-disabled': { bgcolor: '#e2e8f0' },
          }}
        >
          {submitText || submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
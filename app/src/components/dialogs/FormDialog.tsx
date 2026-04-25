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
      {/* Clean white header */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          px: 3,
          pt: 3,
          pb: 3,
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left: icon + title/subtitle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha('#1976D2', 0.08),
                border: `1px solid ${alpha('#1976D2', 0.20)}`,
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <SettingsOutlined sx={{ color: '#1976D2', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: '#1C1C1E', fontWeight: 700, lineHeight: 1.2 }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.4 }}
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
              color: '#64748b',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
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
            bgcolor: '#1976D2',
            '&:hover': { bgcolor: '#1565C0' },
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

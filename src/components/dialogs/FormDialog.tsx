import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';

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
  onSubmit,
  children,
  maxWidth = 'sm',
  submitLabel = 'Save',
  submitText,
  cancelLabel = 'Cancel',
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {title}
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading}
        >
          {submitText || submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
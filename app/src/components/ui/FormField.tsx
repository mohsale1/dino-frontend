import React from 'react';
import {
  TextField,
  TextFieldProps,
} from '@mui/material';

export interface FormFieldProps extends Omit<TextFieldProps, 'variant' | 'error'> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <TextField
      {...props}
      label={label}
      error={!!error}
      helperText={error || helperText}
      fullWidth
      margin="normal"
      variant="outlined"
    />
  );
};

export default FormField;

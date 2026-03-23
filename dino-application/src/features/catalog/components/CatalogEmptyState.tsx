import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';

export interface CatalogEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        border: '1px dashed #bdbdbd',
        borderRadius: 1,
        backgroundColor: '#fafafa',
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2 }}>
        {React.cloneElement(icon as React.ReactElement, {
          sx: { fontSize: 48 },
        })}
      </Box>
      
      <Typography variant="h6" gutterBottom fontWeight={600} color="text.primary">
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" mb={3}>
        {description}
      </Typography>
      
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAction}
        sx={{ textTransform: 'none' }}
      >
        {actionLabel}
      </Button>
    </Paper>
  );
};

export default CatalogEmptyState;
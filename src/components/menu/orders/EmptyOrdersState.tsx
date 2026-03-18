import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { Receipt } from '@mui/icons-material';

const EmptyOrdersState: React.FC = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 5,
        backgroundColor: 'white',
        borderRadius: 1,
        border: '1px solid #E0E0E0',
      }}
    >
      <Receipt sx={{ fontSize: 56, color: '#CED4DA', mb: 2 }} />
      <Typography 
        variant="h6" 
        color="text.secondary" 
        sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}
      >
        No Orders Yet
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ fontSize: '0.85rem' }}
      >
        Your order history will appear here
      </Typography>
    </Box>
  );
};

export default EmptyOrdersState;
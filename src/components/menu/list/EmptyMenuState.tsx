import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

interface EmptyMenuStateProps {
  searchQuery: string;
  onClearFilters: () => void;
}

const EmptyMenuState: React.FC<EmptyMenuStateProps> = ({ searchQuery, onClearFilters }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 5,
        backgroundColor: 'white',
        borderRadius: 2,
        border: '1px solid #E0E0E0',
      }}
    >
      <Search sx={{ fontSize: 48, color: '#CED4DA', mb: 1.5 }} />
      <Typography 
        variant="h6" 
        color="text.secondary" 
        sx={{ mb: 0.75, fontWeight: 600, fontSize: '1rem' }}
      >
        No items found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
        {searchQuery 
          ? `No results for "${searchQuery}"`
          : 'Try adjusting your filters'}
      </Typography>
      <Button
        variant="outlined"
        startIcon={<Clear />}
        size="small"
        onClick={onClearFilters}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderColor: '#1E3A5F',
          color: '#1E3A5F',
          fontSize: '0.85rem',
          '&:hover': {
            borderColor: '#2C5282',
            backgroundColor: 'rgba(30, 58, 95, 0.04)',
          },
        }}
      >
        Clear Filters
      </Button>
    </Box>
  );
};

export default EmptyMenuState;
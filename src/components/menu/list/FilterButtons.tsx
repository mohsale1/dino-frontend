import React from 'react';
import {
  Stack,
  Button,
  Box,
} from '@mui/material';

export type VegFilterType = 'all' | 'veg' | 'non-veg';

interface FilterButtonsProps {
  activeFilter: VegFilterType;
  onFilterChange: (filter: VegFilterType) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ activeFilter, onFilterChange }) => {
  const VegIcon = ({ isActive, isVeg }: { isActive: boolean; isVeg: boolean }) => (
    <Box
      sx={{
        width: 12,
        height: 12,
        border: `2px solid ${isActive ? 'white' : (isVeg ? '#4CAF50' : '#F44336')}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: isVeg ? '50%' : 0,
          backgroundColor: isActive ? 'white' : (isVeg ? '#4CAF50' : '#F44336'),
        }}
      />
    </Box>
  );

  return (
    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
      <Button
        variant={activeFilter === 'all' ? 'contained' : 'outlined'}
        onClick={() => onFilterChange('all')}
        size="small"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          height: 32,
          borderColor: '#E0E0E0',
          color: activeFilter === 'all' ? 'white' : '#2C3E50',
          backgroundColor: activeFilter === 'all' ? '#1E3A5F' : 'transparent',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: '#1E3A5F',
            backgroundColor: activeFilter === 'all' ? '#2C5282' : 'rgba(30, 58, 95, 0.04)',
          },
        }}
      >
        All Items
      </Button>
      <Button
        variant={activeFilter === 'veg' ? 'contained' : 'outlined'}
        onClick={() => onFilterChange('veg')}
        size="small"
        startIcon={<VegIcon isActive={activeFilter === 'veg'} isVeg={true} />}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          height: 32,
          borderColor: activeFilter === 'veg' ? '#4CAF50' : '#E0E0E0',
          color: activeFilter === 'veg' ? 'white' : '#2C3E50',
          backgroundColor: activeFilter === 'veg' ? '#4CAF50' : 'transparent',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: '#4CAF50',
            backgroundColor: activeFilter === 'veg' ? '#45A049' : 'rgba(76, 175, 80, 0.04)',
          },
        }}
      >
        Veg
      </Button>
      <Button
        variant={activeFilter === 'non-veg' ? 'contained' : 'outlined'}
        onClick={() => onFilterChange('non-veg')}
        size="small"
        startIcon={<VegIcon isActive={activeFilter === 'non-veg'} isVeg={false} />}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          height: 32,
          borderColor: activeFilter === 'non-veg' ? '#F44336' : '#E0E0E0',
          color: activeFilter === 'non-veg' ? 'white' : '#2C3E50',
          backgroundColor: activeFilter === 'non-veg' ? '#F44336' : 'transparent',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: '#F44336',
            backgroundColor: activeFilter === 'non-veg' ? '#E53935' : 'rgba(244, 67, 54, 0.04)',
          },
        }}
      >
        Non-Veg
      </Button>
    </Stack>
  );
};

export default FilterButtons;
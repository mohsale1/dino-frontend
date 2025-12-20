
import React from 'react';
import { Box } from '@mui/material';

interface VegNonVegIconProps {
  isVeg: boolean;
  size?: number;
}

const VegNonVegIcon: React.FC<VegNonVegIconProps> = ({ isVeg, size = 16 }) => {
  const dotSize = Math.max(6, size * 0.4);
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        border: `2px solid ${isVeg ? '#4CAF50' : '#F44336'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: dotSize,
          height: dotSize,
          borderRadius: isVeg ? '50%' : 0,
          backgroundColor: isVeg ? '#4CAF50' : '#F44336',
        }}
      />
    </Box>
  );
};

export default VegNonVegIcon;

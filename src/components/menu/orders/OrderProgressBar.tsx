import React from 'react';
import {
  Box,
  Stack,
  Typography,
  LinearProgress,
} from '@mui/material';

interface OrderProgressBarProps {
  status: string;
  percentage: number;
  color: string;
}

const OrderProgressBar: React.FC<OrderProgressBarProps> = ({ status, percentage, color }) => {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Progress
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {Math.round(percentage)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#E0E0E0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          },
        }}
      />
    </Box>
  );
};

export default OrderProgressBar;
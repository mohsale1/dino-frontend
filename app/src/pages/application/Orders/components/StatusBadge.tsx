import React from 'react';
import { Box, Typography } from '@mui/material';
import { Order, STATUS_CONFIG } from '../orders.types';

interface StatusBadgeProps {
  status: Order['status'];
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status];
  const isSm = size === 'sm';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1,
        py: 0.4,
        borderRadius: 1,
        bgcolor: config.bg,
        border: config.border,
      }}
    >
      <Box
        sx={{
          width: isSm ? 5 : 6,
          height: isSm ? 5 : 6,
          borderRadius: '50%',
          bgcolor: config.dot,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: isSm ? '0.68rem' : '0.75rem',
          fontWeight: 600,
          textTransform: 'capitalize',
          color: config.color,
          lineHeight: 1,
        }}
      >
        {status}
      </Typography>
    </Box>
  );
};

export default StatusBadge;

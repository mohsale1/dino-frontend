import React from 'react';
import { Box, Typography } from '@mui/material';

interface RestaurantInfoBadgeProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
}

const RestaurantInfoBadge: React.FC<RestaurantInfoBadgeProps> = ({ icon, label, sublabel }) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        height: { xs: 32, sm: 36 },
      }}
    >
      {icon}
      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
        {label}
      </Typography>
      {sublabel && (
        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
          {sublabel}
        </Typography>
      )}
    </Box>
  );
};

export default RestaurantInfoBadge;

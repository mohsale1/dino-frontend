import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';

export const CatalogItemSkeleton: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Image Skeleton */}
      <Skeleton
        variant="rectangular"
        height={200}
        animation="wave"
      />
      
      {/* Content Skeleton */}
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>
    </Paper>
  );
};

export default CatalogItemSkeleton;
/**
 * LocationStats Component - Clean Professional Design
 * 
 * Display location statistics
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import {
  LocationOn,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

interface LocationStatsProps {
  stats: {
    totalLocations: number;
    available: number;
    occupied: number;
  };
}

const LocationStats: React.FC<LocationStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Locations',
      value: stats.totalLocations,
      icon: <LocationOn sx={{ fontSize: 24 }} />,
      color: '#6b7280',
    },
    {
      title: 'Available',
      value: stats.available,
      icon: <CheckCircle sx={{ fontSize: 24 }} />,
      color: '#166534',
      bgColor: '#dcfce7',
      borderColor: '#bbf7d0',
    },
    {
      title: 'Occupied',
      value: stats.occupied,
      icon: <Cancel sx={{ fontSize: 24 }} />,
      color: '#991b1b',
      bgColor: '#fee2e2',
      borderColor: '#fecaca',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  backgroundColor: stat.bgColor || '#f3f4f6',
                  border: stat.borderColor ? `1px solid ${stat.borderColor}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {stat.title}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default LocationStats;
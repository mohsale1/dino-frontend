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
      iconBgColor: 'rgba(25,118,210,0.08)',
      iconColor: '#1976d2',
    },
    {
      title: 'Available',
      value: stats.available,
      icon: <CheckCircle sx={{ fontSize: 24 }} />,
      iconBgColor: 'rgba(16,185,129,0.08)',
      iconColor: '#059669',
    },
    {
      title: 'Occupied',
      value: stats.occupied,
      icon: <Cancel sx={{ fontSize: 24 }} />,
      iconBgColor: 'rgba(239,68,68,0.08)',
      iconColor: '#dc2626',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={4} md={4} key={index}>
          <Paper
            elevation={0}
            sx={{
              px: 2.5,
              py: 2,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
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
                  bgcolor: stat.iconBgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.iconColor,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
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
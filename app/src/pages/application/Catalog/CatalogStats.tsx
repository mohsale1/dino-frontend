/**
 * CatalogStats Component - Clean Professional Design
 * 
 * Display catalog statistics
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import {
  Inventory,
  CheckCircle,
  Cancel,
  Category,
} from '@mui/icons-material';

interface CatalogStatsProps {
  stats: {
    totalItems: number;
    available: number;
    unavailable: number;
    categories: number;
  };
}

const CatalogStats: React.FC<CatalogStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: <Inventory sx={{ fontSize: 24 }} />,
      iconBg: 'rgba(25,118,210,0.08)',
      iconColor: '#1976d2',
    },
    {
      title: 'Available',
      value: stats.available,
      icon: <CheckCircle sx={{ fontSize: 24 }} />,
      iconBg: 'rgba(16,185,129,0.08)',
      iconColor: '#059669',
    },
    {
      title: 'Unavailable',
      value: stats.unavailable,
      icon: <Cancel sx={{ fontSize: 24 }} />,
      iconBg: 'rgba(239,68,68,0.08)',
      iconColor: '#dc2626',
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: <Category sx={{ fontSize: 24 }} />,
      iconBg: 'rgba(99,102,241,0.08)',
      iconColor: '#6366f1',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map((stat, index) => (
        <Grid item xs={6} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              px: 2.5,
              py: 2,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: stat.iconBg,
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

export default CatalogStats;
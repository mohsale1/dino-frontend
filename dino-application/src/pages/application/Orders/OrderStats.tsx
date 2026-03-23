/**
 * OrderStats Component - Clean Professional Design
 * 
 * Display order statistics
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import {
  ShoppingCart,
  Schedule,
  Restaurant,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

interface OrderStatsProps {
  stats: {
    totalOrders: number;
    pending: number;
    preparing: number;
    completed: number;
    cancelled: number;
  };
}

const OrderStats: React.FC<OrderStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart sx={{ fontSize: 24 }} />,
      color: '#6b7280',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Schedule sx={{ fontSize: 24 }} />,
      color: '#92400e',
      bgColor: '#fef3c7',
      borderColor: '#fde68a',
    },
    {
      title: 'Preparing',
      value: stats.preparing,
      icon: <Restaurant sx={{ fontSize: 24 }} />,
      color: '#1e40af',
      bgColor: '#dbeafe',
      borderColor: '#bfdbfe',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <CheckCircle sx={{ fontSize: 24 }} />,
      color: '#166534',
      bgColor: '#dcfce7',
      borderColor: '#bbf7d0',
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: <Cancel sx={{ fontSize: 24 }} />,
      color: '#991b1b',
      bgColor: '#fee2e2',
      borderColor: '#fecaca',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
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

export default OrderStats;
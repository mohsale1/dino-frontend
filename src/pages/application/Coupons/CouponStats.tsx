/**
 * CouponStats Component - Clean Professional Design
 * 
 * Display coupon statistics
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import {
  LocalOffer as CouponIcon,
  Percent,
  CardGiftcard,
  AttachMoney,
} from '@mui/icons-material';

interface CouponStatsProps {
  stats: {
    totalCoupons: number;
    activeCoupons: number;
    totalRedemptions: number;
    totalSavings: number;
  };
}

const CouponStats: React.FC<CouponStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Coupons',
      value: stats.totalCoupons,
      icon: <CouponIcon sx={{ fontSize: 24 }} />,
      color: '#6b7280',
    },
    {
      title: 'Active Coupons',
      value: stats.activeCoupons,
      icon: <Percent sx={{ fontSize: 24 }} />,
      color: '#166534',
      bgColor: '#dcfce7',
      borderColor: '#bbf7d0',
    },
    {
      title: 'Total Redemptions',
      value: stats.totalRedemptions,
      icon: <CardGiftcard sx={{ fontSize: 24 }} />,
      color: '#1e40af',
      bgColor: '#dbeafe',
      borderColor: '#bfdbfe',
    },
    {
      title: 'Total Savings',
      value: `$${stats.totalSavings.toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 24 }} />,
      color: '#92400e',
      bgColor: '#fef3c7',
      borderColor: '#fde68a',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
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

export default CouponStats;
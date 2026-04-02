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
      iconBgColor: 'rgba(25,118,210,0.08)',
      iconColor: '#1976d2',
    },
    {
      title: 'Active Coupons',
      value: stats.activeCoupons,
      icon: <Percent sx={{ fontSize: 24 }} />,
      iconBgColor: 'rgba(16,185,129,0.08)',
      iconColor: '#059669',
    },
    {
      title: 'Total Redemptions',
      value: stats.totalRedemptions,
      icon: <CardGiftcard sx={{ fontSize: 24 }} />,
      iconBgColor: 'rgba(99,102,241,0.08)',
      iconColor: '#6366f1',
    },
    {
      title: 'Total Savings',
      value: `$${stats.totalSavings.toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 24 }} />,
      iconBgColor: 'rgba(245,158,11,0.08)',
      iconColor: '#d97706',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              px: 2.5,
              py: 2,
              backgroundColor: '#ffffff',
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
                  backgroundColor: stat.iconBgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.iconColor,
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

export default CouponStats;

import React from 'react';
import { Box, Grid, Typography, LinearProgress } from '@mui/material';
import RevenueChart from '../../charts/RevenueChart';

interface SalesTabProps {
  dashboardData: {
    stats: {
      totalRevenue?: number;
      todaysRevenue?: number;
      avgOrderValue?: number;
    };
    analytics: {
      revenueTrend: Array<{ date: string; period?: string; revenue: number; orders: number }>;
      paymentMethods: Array<{ method: string; count: number; revenue: number; percentage: number }>;
      categoryPerformance: Array<{ category: string; orders: number; revenue: number; percentage: number }>;
    };
    summary: {
      totalRevenue?: number;
      todaysRevenue?: number;
      avgOrderValue?: number;
      totalOrders?: number;
    };
  };
}

const CATEGORY_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

const cardStyle = {
  bgcolor: '#fff',
  borderRadius: 2,
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  p: 2.5,
} as const;

const cardTitleStyle = {
  fontWeight: 700,
  fontSize: '0.875rem',
  color: '#0f172a',
  mb: 2,
} as const;

const formatINR = (value?: number): string =>
  `\u20B9${(value ?? 0).toLocaleString('en-IN')}`;

const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const SalesTab: React.FC<SalesTabProps> = ({ dashboardData }) => {
  const summary = dashboardData?.summary ?? {};
  const analytics = dashboardData?.analytics ?? {
    revenueTrend: [],
    paymentMethods: [],
    categoryPerformance: [],
  };

  const paymentMethods = analytics.paymentMethods ?? [];
  const categoryPerformance = analytics.categoryPerformance ?? [];

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, bgcolor: '#f8fafc' }}>

      {/* Row 1 — Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              ...cardStyle,
              borderLeft: '4px solid #1976d2',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Revenue
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#0f172a', mt: 0.5 }}>
              {formatINR(summary.totalRevenue)}
            </Typography>
          </Box>
        </Grid>

        {/* Today's Revenue */}
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              ...cardStyle,
              borderLeft: '4px solid #0288d1',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Revenue
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#0f172a', mt: 0.5 }}>
              {formatINR(summary.todaysRevenue)}
            </Typography>
          </Box>
        </Grid>

        {/* Avg Order Value */}
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              ...cardStyle,
              borderLeft: '4px solid #388e3c',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Avg Order Value
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#0f172a', mt: 0.5 }}>
              {formatINR(summary.avgOrderValue)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Row 2 — Revenue Trend */}
      <Box sx={{ ...cardStyle, mb: 2.5 }}>
        <Typography sx={cardTitleStyle}>Revenue Trend</Typography>
        <RevenueChart data={analytics.revenueTrend ?? []} height={300} />
      </Box>

      {/* Row 3 — Payment Methods + Category Performance */}
      <Grid container spacing={2.5}>

        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Box sx={cardStyle}>
            <Typography sx={cardTitleStyle}>Payment Methods</Typography>

            {paymentMethods.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
                No payment data
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {paymentMethods.map((pm) => (
                  <Box key={pm.method}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a', textTransform: 'capitalize' }}>
                          {capitalize(pm.method)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {pm.count} transactions
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                          {formatINR(pm.revenue)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#1976d2', fontWeight: 600 }}>
                          {pm.percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pm.percentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: '#1976d2',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Category Performance */}
        <Grid item xs={12} md={6}>
          <Box sx={cardStyle}>
            <Typography sx={cardTitleStyle}>Category Performance</Typography>

            {categoryPerformance.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
                No category data
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {categoryPerformance.map((cat, idx) => {
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <Box key={cat.category}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>
                            {cat.category}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {cat.orders} orders
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                            {formatINR(cat.revenue)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color }}>
                            {cat.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={cat.percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: color,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
};

export default SalesTab;
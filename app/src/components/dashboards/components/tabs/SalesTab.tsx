import React from 'react';
import { Box, Grid, Typography, LinearProgress, Chip } from '@mui/material';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  '#1976D2',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#0ea5e9',
];

const PAYMENT_COLORS = [
  '#1976D2',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#0ea5e9',
  '#f43f5e',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatINR = (value?: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// ─── Shared Styles ────────────────────────────────────────────────────────────

const CARD_SX = {
  bgcolor: '#1e293b',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  p: 2.5,
} as const;

// ─── SectionTitle ─────────────────────────────────────────────────────────────

interface SectionTitleProps {
  label: string;
  accentColor: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ label, accentColor }) => (
  <Box sx={{ borderLeft: `3px solid ${accentColor}`, pl: 1.5, mb: 2 }}>
    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
      {label}
    </Typography>
  </Box>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  accentColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, accentColor }) => (
  <Box
    sx={{
      ...CARD_SX,
      borderTop: `3px solid ${accentColor}`,
      height: '100%',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mb: 0.75,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '1.75rem',
        fontWeight: 800,
        color: '#f1f5f9',
        lineHeight: 1.1,
        mb: 0.5,
      }}
    >
      {value}
    </Typography>
    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
      {subtext}
    </Typography>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

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
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, bgcolor: '#0f172a' }}>

      {/* Row 1 — Stat Cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Total Revenue"
            value={formatINR(summary.totalRevenue ?? 0)}
            subtext="All time"
            accentColor="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Today's Revenue"
            value={formatINR(summary.todaysRevenue ?? 0)}
            subtext="Since midnight"
            accentColor="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Avg Order Value"
            value={formatINR(summary.avgOrderValue ?? 0)}
            subtext="Per transaction"
            accentColor="#f59e0b"
          />
        </Grid>
      </Grid>

      {/* Row 2 — Revenue Trend */}
      <Box sx={{ ...CARD_SX, mt: 2.5 }}>
        <SectionTitle label="Revenue Trend" accentColor="#1976D2" />
        <RevenueChart data={analytics.revenueTrend ?? []} height={280} />
      </Box>

      {/* Row 3 — Payment Methods + Category Performance */}
      <Grid container spacing={2.5} sx={{ mt: 0 }}>

        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Box sx={CARD_SX}>
            <SectionTitle label="Payment Methods" accentColor="#0ea5e9" />

            {paymentMethods.length === 0 ? (
              <Typography
                sx={{ fontSize: '0.8125rem', color: '#94a3b8', textAlign: 'center', py: 4 }}
              >
                No payment data
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {paymentMethods.map((pm, idx) => {
                  const barColor = PAYMENT_COLORS[idx % PAYMENT_COLORS.length];
                  return (
                    <Box key={pm.method}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.75,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: barColor,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}
                          >
                            {capitalize(pm.method)}
                          </Typography>
                          <Chip
                            label={`${pm.count} orders`}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 500,
                              bgcolor: 'rgba(255,255,255,0.06)',
                              color: '#94a3b8',
                              borderRadius: '4px',
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}
                        >
                          {formatINR(pm.revenue)}
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'relative' }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(pm.percentage, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#334155',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: barColor,
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          textAlign: 'right',
                          mt: 0.5,
                        }}
                      >
                        {pm.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Category Performance */}
        <Grid item xs={12} md={6}>
          <Box sx={CARD_SX}>
            <SectionTitle label="Category Performance" accentColor="#10b981" />

            {categoryPerformance.length === 0 ? (
              <Typography
                sx={{ fontSize: '0.8125rem', color: '#94a3b8', textAlign: 'center', py: 4 }}
              >
                No category data
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {categoryPerformance.map((cat, idx) => {
                  const barColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <Box key={cat.category}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.75,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: barColor,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}
                          >
                            {cat.category}
                          </Typography>
                          <Chip
                            label={`${cat.orders} orders`}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 500,
                              bgcolor: 'rgba(255,255,255,0.06)',
                              color: '#94a3b8',
                              borderRadius: '4px',
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}
                        >
                          {formatINR(cat.revenue)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(cat.percentage, 100)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#334155',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: barColor,
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          textAlign: 'right',
                          mt: 0.5,
                        }}
                      >
                        {cat.percentage.toFixed(1)}%
                      </Typography>
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

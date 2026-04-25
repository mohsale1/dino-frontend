import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import TopItemsChart from '../../charts/TopItemsChart';

interface ItemsTabProps {
  dashboardData: {
    stats: { totalCategories?: number; activeItems?: number };
    analytics: {
      popularItems: Array<{
        id: string;
        name: string;
        category: string;
        orders: number;
        revenue: number;
        quantity?: number;
        rating?: number;
      }>;
      categoryPerformance: Array<{
        category: string;
        orders: number;
        revenue: number;
        percentage: number;
      }>;
    };
    summary: {
      totalMenuItems?: number;
      activeMenuItems?: number;
      totalRevenue?: number;
      totalCategories?: number;
    };
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

// ─── Rank badge config ────────────────────────────────────────────────────────

const RANK_BADGE: Record<number, { bg: string; color: string }> = {
  1: { bg: 'rgba(245,158,11,0.18)', color: '#f59e0b' },
  2: { bg: 'rgba(148,163,184,0.12)', color: '#666666' },
  3: { bg: 'rgba(245,158,11,0.10)', color: '#d97706' },
};

// ─── Shared Styles ────────────────────────────────────────────────────────────

const CARD_SX = {
  bgcolor: '#ffffff',
  border: '1px solid #e0e0e0',
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
    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1C1E' }}>
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
        color: '#666666',
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
        color: '#1C1C1E',
        lineHeight: 1.1,
        mb: 0.5,
      }}
    >
      {value}
    </Typography>
    <Typography sx={{ fontSize: '0.75rem', color: '#666666' }}>
      {subtext}
    </Typography>
  </Box>
);

// ─── Table header columns ─────────────────────────────────────────────────────

const HEADER_COLS = ['Rank', 'Item', 'Category', 'Orders', 'Revenue'];

// ─── Main Component ───────────────────────────────────────────────────────────

const ItemsTab: React.FC<ItemsTabProps> = ({ dashboardData }) => {
  const stats = dashboardData?.stats ?? {};
  const analytics = dashboardData?.analytics ?? { popularItems: [], categoryPerformance: [] };
  const summary = dashboardData?.summary ?? {};

  const popularItems = analytics.popularItems ?? [];
  const top10 = [...popularItems]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, bgcolor: '#f8fafc' }}>

      {/* Row 1 — Stat Cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Total Categories"
            value={String(summary.totalCategories ?? stats.totalCategories ?? 0)}
            subtext="Active categories"
            accentColor="#8b5cf6"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Active Items"
            value={String(summary.activeMenuItems ?? stats.activeItems ?? 0)}
            subtext="On the menu"
            accentColor="#0ea5e9"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Menu Revenue"
            value={formatINR(summary.totalRevenue ?? 0)}
            subtext="From menu sales"
            accentColor="#10b981"
          />
        </Grid>
      </Grid>

      {/* Row 2 — Top Items Chart */}
      <Box sx={{ ...CARD_SX, mt: 2.5 }}>
        <SectionTitle label="Top Items by Revenue" accentColor="#1976D2" />
        <TopItemsChart data={popularItems} height={300} />
      </Box>

      {/* Row 3 — Popular Items Ranking */}
      <Box sx={{ ...CARD_SX, mt: 2.5 }}>
        <SectionTitle label="Popular Items Ranking" accentColor="#f59e0b" />

        {top10.length === 0 ? (
          <Typography
            sx={{
              color: '#666666',
              fontSize: '0.875rem',
              textAlign: 'center',
              py: 4,
            }}
          >
            No items data
          </Typography>
        ) : (
          <Box>
            {/* Table header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 1fr 80px 110px',
                bgcolor: '#f7f9fa',
                borderRadius: '8px',
                px: 1.5,
                py: 1,
                mb: 0.5,
              }}
            >
              {HEADER_COLS.map((col) => (
                <Typography
                  key={col}
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#999999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {col}
                </Typography>
              ))}
            </Box>

            {/* Item rows */}
            {top10.map((item, idx) => {
              const rank = idx + 1;
              const badge = RANK_BADGE[rank] ?? null;

              return (
                <Box
                  key={item.id ?? idx}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr 1fr 80px 110px',
                    alignItems: 'center',
                    py: 1.25,
                    px: 1.5,
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': {
                      bgcolor: '#f7f9fa',
                      borderRadius: '8px',
                    },
                    transition: 'background-color 0.15s',
                  }}
                >
                  {/* Rank */}
                  <Box>
                    {badge ? (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: badge.bg,
                          color: badge.color,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {rank}
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          color: '#666666',
                          width: 24,
                          textAlign: 'center',
                          fontWeight: 500,
                        }}
                      >
                        {rank}
                      </Typography>
                    )}
                  </Box>

                  {/* Item name */}
                  <Typography
                    noWrap
                    sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1C1C1E' }}
                  >
                    {item.name}
                  </Typography>

                  {/* Category */}
                  <Typography
                    noWrap
                    sx={{ fontSize: '0.75rem', color: '#666666' }}
                  >
                    {item.category}
                  </Typography>

                  {/* Orders */}
                  <Box>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(25,118,210,0.15)',
                        color: '#42A5F5',
                        fontSize: '0.7rem',
                        height: 20,
                        fontWeight: 600,
                        borderRadius: '4px',
                        px: 1,
                      }}
                    >
                      {item.orders.toLocaleString('en-IN')}
                    </Box>
                  </Box>

                  {/* Revenue */}
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1C1C1E' }}
                  >
                    {formatINR(item.revenue)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ItemsTab;

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
    summary: { totalMenuItems?: number; activeMenuItems?: number; totalRevenue?: number };
  };
}

const formatINR = (value: number): string =>
  `\u20B9${value.toLocaleString('en-IN')}`;

const RANK_BADGE: Record<number, { bg: string; color: string }> = {
  1: { bg: '#f59e0b', color: '#fff' },
  2: { bg: '#94a3b8', color: '#fff' },
  3: { bg: '#cd7f32', color: '#fff' },
};

const getRankBadge = (rank: number) =>
  RANK_BADGE[rank] ?? { bg: '#e2e8f0', color: '#0f172a' };

const cardSx = {
  bgcolor: '#fff',
  borderRadius: 2,
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  p: 2.5,
};

const cardTitleSx = {
  fontWeight: 700,
  fontSize: '0.875rem',
  color: '#0f172a',
  mb: 2,
};

interface StatCardProps {
  title: string;
  value: string | number;
  borderColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, borderColor }) => (
  <Box
    sx={{
      ...cardSx,
      borderLeft: `4px solid ${borderColor}`,
      height: '100%',
    }}
  >
    <Typography
      sx={{
        fontWeight: 600,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#64748b',
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography sx={{ fontWeight: 700, fontSize: '1.6rem', color: '#0f172a', lineHeight: 1.2 }}>
      {value}
    </Typography>
  </Box>
);

const ItemsTab: React.FC<ItemsTabProps> = ({ dashboardData }) => {
  const stats = dashboardData?.stats ?? {};
  const analytics = dashboardData?.analytics ?? { popularItems: [], categoryPerformance: [] };
  const summary = dashboardData?.summary ?? {};

  const totalCategories = stats.totalCategories ?? 0;
  const activeItems = summary.activeMenuItems ?? stats.activeItems ?? 0;
  const totalRevenue = summary.totalRevenue ?? 0;

  const popularItems = analytics.popularItems ?? [];
  const top10 = [...popularItems]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, bgcolor: '#f8fafc' }}>
      {/* Row 1 — Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Categories" value={totalCategories} borderColor="#8b5cf6" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Active Items" value={activeItems} borderColor="#10b981" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Menu Revenue" value={formatINR(totalRevenue)} borderColor="#f59e0b" />
        </Grid>
      </Grid>

      {/* Row 2 — Top Menu Items Chart */}
      <Box sx={{ ...cardSx, mb: 3 }}>
        <Typography sx={cardTitleSx}>Top Menu Items</Typography>
        <TopItemsChart data={popularItems} height={340} />
      </Box>

      {/* Row 3 — Popular Items Ranking */}
      <Box sx={cardSx}>
        <Typography sx={cardTitleSx}>Popular Items Ranking</Typography>

        {top10.length === 0 ? (
          <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', py: 4 }}>
            No items data
          </Typography>
        ) : (
          <Box>
            {/* Header row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '40px 1fr 70px', sm: '40px 1fr 100px 100px 110px' },
                gap: 1,
                px: 1,
                pb: 1,
                borderBottom: '1px solid #e2e8f0',
                mb: 0.5,
              }}
            >
              {[
                { label: 'Rank', align: 'center' as const, hide: false },
                { label: 'Item', align: 'left' as const, hide: false },
                { label: 'Orders', align: 'center' as const, hide: false },
                { label: 'Category', align: 'left' as const, hide: true },
                { label: 'Revenue', align: 'right' as const, hide: true },
              ].map(({ label, align, hide }) => (
                <Typography
                  key={label}
                  sx={{
                    display: hide ? { xs: 'none', sm: 'block' } : 'block',
                    fontWeight: 600,
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#94a3b8',
                    textAlign: align,
                  }}
                >
                  {label}
                </Typography>
              ))}
            </Box>

            {/* Item rows */}
            {top10.map((item, idx) => {
              const rank = idx + 1;
              const badge = getRankBadge(rank);
              const isEven = idx % 2 === 1;

              return (
                <Box
                  key={item.id ?? idx}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '40px 1fr 70px', sm: '40px 1fr 100px 100px 110px' },
                    gap: 1,
                    alignItems: 'center',
                    px: 1,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: isEven ? '#f8fafc' : 'transparent',
                  }}
                >
                  {/* Rank badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: 1,
                        bgcolor: badge.bg,
                        color: badge.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      {rank}
                    </Box>
                  </Box>

                  {/* Item name + category (xs only) */}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.3 }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{
                        display: { xs: 'block', sm: 'none' },
                        fontSize: '0.72rem',
                        color: '#64748b',
                      }}
                    >
                      {item.category}
                    </Typography>
                  </Box>

                  {/* Orders */}
                  <Typography
                    sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}
                  >
                    {item.orders.toLocaleString('en-IN')}
                  </Typography>

                  {/* Category — hidden on xs */}
                  <Typography
                    noWrap
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      fontSize: '0.8rem',
                      color: '#64748b',
                    }}
                  >
                    {item.category}
                  </Typography>

                  {/* Revenue — hidden on xs */}
                  <Typography
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#0f172a',
                    }}
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
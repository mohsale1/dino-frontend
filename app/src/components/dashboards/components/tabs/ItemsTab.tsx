import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Restaurant,
  Category,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import { MenuPerformanceChart } from '../../charts';

interface ItemsTabProps {
  dashboardData: any;
}

const formatCurrency = (value: number): string =>
  `\u20B9${value.toLocaleString('en-IN')}`;

const RANK_COLORS = ['#f9a825', '#78909c', '#8d6e63', '#0288d1', '#2e7d32'];

const getRankColor = (rank: number): string =>
  rank <= RANK_COLORS.length ? RANK_COLORS[rank - 1] : '#546e7a';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      borderRadius: 2,
      bgcolor: '#ffffff',
      transition: 'box-shadow 0.2s',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderRadius: '2px 0 0 2px',
        bgcolor: color,
      },
    }}
  >
    <CardContent sx={{ p: 2.5, pl: 3.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'text.secondary',
          }}
        >
          {title}
        </Typography>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: alpha(color, 0.12),
            color,
          }}
        >
          {icon}
        </Avatar>
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          fontSize: '1.65rem',
          lineHeight: 1.2,
          color: 'text.primary',
          mb: subtitle ? 0.5 : 0,
        }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Column header labels for the responsive ranking grid
const HEADER_COLS = [
  { label: '#',      sx: { display: { xs: 'block', sm: 'block' } } },
  { label: 'Item',   sx: { display: { xs: 'block', sm: 'block' } } },
  { label: 'Orders', sx: { display: { xs: 'block', sm: 'block' } } },
  { label: 'Rating', sx: { display: { xs: 'none',  sm: 'block' } } },
  { label: 'Revenue',sx: { display: { xs: 'none',  sm: 'block' } } },
];

const ItemsTab: React.FC<ItemsTabProps> = ({ dashboardData }) => {
  const stats = dashboardData?.stats || {};
  const analytics = dashboardData?.analytics || {};

  const totalCategories: number = stats.total_categories || 0;
  const activeItems: number = stats.active_items || 0;

  const popularItems: any[] = analytics.popular_items || [];

  const totalMenuRevenue: number = popularItems.reduce(
    (sum: number, item: any) => sum + (item.revenue || 0),
    0
  );

  const menuChartData = popularItems.map((item: any) => ({
    id: String(item.id),
    name: item.name || '',
    orders: item.orders || 0,
    revenue: item.revenue || 0,
    category: item.category || '',
    rating: item.rating,
  }));

  const top10Items = [...popularItems]
    .sort((a: any, b: any) => (b.orders || 0) - (a.orders || 0))
    .slice(0, 10);

  const maxOrders =
    top10Items.length > 0
      ? Math.max(...top10Items.map((i: any) => i.orders || 0))
      : 1;

  // Shared responsive grid template
  const gridCols = {
    xs: '32px 1fr 70px',
    sm: '40px 1fr 100px 80px 110px',
  };

  return (
    <Box>
      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Categories"
            value={totalCategories}
            icon={<Category sx={{ fontSize: 20 }} />}
            color="#7b1fa2"
            subtitle="Menu categories"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Active Items"
            value={activeItems}
            icon={<Restaurant sx={{ fontSize: 20 }} />}
            color="#2e7d32"
            subtitle="Available on menu"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Menu Revenue"
            value={formatCurrency(totalMenuRevenue)}
            icon={<TrendingUp sx={{ fontSize: 20 }} />}
            color="#0288d1"
            subtitle="From popular items"
          />
        </Grid>
      </Grid>

      {/* Menu Performance Chart */}
      <Box sx={{ mb: 3 }}>
        <MenuPerformanceChart
          data={menuChartData}
          title="Top Menu Items Performance"
          height={400}
          maxItems={10}
          sortBy="revenue"
        />
      </Box>

      {/* Popular Items Ranking — responsive grid list */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          bgcolor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' },
        }}
      >
        {/* Section header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
            Popular Items Ranking
          </Typography>
          <Chip
            label={`Top ${top10Items.length}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          {top10Items.length === 0 ? (
            <Box
              sx={{
                py: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                color: 'text.disabled',
              }}
            >
              <Restaurant sx={{ fontSize: 48 }} />
              <Typography variant="body1" color="text.secondary">
                No item data available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Popular items will appear once orders are placed
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Header row */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: gridCols,
                  gap: 1,
                  px: 1,
                  pb: 1,
                  mb: 0.5,
                }}
              >
                {HEADER_COLS.map(({ label, sx }) => (
                  <Typography
                    key={label}
                    variant="caption"
                    fontWeight={600}
                    sx={{
                      ...sx,
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                      letterSpacing: '0.5px',
                      color: 'text.secondary',
                      textAlign: label === 'Revenue' ? 'right' : label === 'Orders' || label === 'Rating' ? 'center' : 'left',
                    }}
                  >
                    {label}
                  </Typography>
                ))}
              </Box>

              <Divider sx={{ mb: 1 }} />

              {top10Items.map((item: any, idx: number) => {
                const rank = idx + 1;
                const rankColor = getRankColor(rank);
                const orderBarWidth =
                  maxOrders > 0 ? ((item.orders || 0) / maxOrders) * 100 : 0;

                return (
                  <React.Fragment key={item.id || idx}>
                    {idx > 0 && <Divider sx={{ my: 0.5, opacity: 0.5 }} />}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: gridCols,
                        gap: 1,
                        alignItems: 'center',
                        px: 1,
                        py: 1,
                        borderRadius: 2,
                        transition: 'background 0.15s',
                        '&:hover': {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      {/* Rank */}
                      <Avatar
                        sx={{
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 },
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          bgcolor: alpha(rankColor, 0.15),
                          color: rankColor,
                          borderRadius: 1.5,
                        }}
                      >
                        {rank}
                      </Avatar>

                      {/* Name + Category + Bar */}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{ lineHeight: 1.3 }}
                        >
                          {item.name || 'Unknown'}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ fontSize: '0.68rem' }}
                        >
                          {item.category || '-'}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={orderBarWidth}
                          sx={{
                            mt: 0.5,
                            height: 3,
                            borderRadius: 2,
                            bgcolor: alpha(rankColor, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2,
                              bgcolor: rankColor,
                            },
                          }}
                        />
                      </Box>

                      {/* Orders — always visible */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={700}>
                          {(item.orders || 0).toLocaleString('en-IN')}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.65rem' }}
                        >
                          orders
                        </Typography>
                      </Box>

                      {/* Rating — hidden on xs */}
                      <Box
                        sx={{
                          display: { xs: 'none', sm: 'flex' },
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.25,
                        }}
                      >
                        {item.rating ? (
                          <>
                            <Star sx={{ fontSize: 13, color: '#f9a825' }} />
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ fontSize: '0.8rem' }}
                            >
                              {Number(item.rating).toFixed(1)}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            -
                          </Typography>
                        )}
                      </Box>

                      {/* Revenue — hidden on xs */}
                      <Box
                        sx={{
                          display: { xs: 'none', sm: 'block' },
                          textAlign: 'right',
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ color: '#2e7d32', fontSize: '0.85rem' }}
                        >
                          {formatCurrency(item.revenue || 0)}
                        </Typography>
                        {item.quantity != null && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.65rem' }}
                          >
                            qty: {item.quantity}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ItemsTab;
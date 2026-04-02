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
  AttachMoney,
  TrendingUp,
  ShoppingCart,
  Category,
} from '@mui/icons-material';
import RevenueChart from '../../charts/RevenueChart';

interface SalesTabProps {
  dashboardData: any;
}

const PAYMENT_COLORS: Record<string, string> = {
  cash: '#2e7d32',
  card: '#0288d1',
  upi: '#7b1fa2',
  online: '#f57c00',
  credit: '#0288d1',
  debit: '#0277bd',
  wallet: '#c62828',
};

const CATEGORY_COLORS = [
  '#0288d1',
  '#2e7d32',
  '#f57c00',
  '#7b1fa2',
  '#c62828',
  '#00838f',
  '#558b2f',
  '#6d4c41',
];

const formatCurrency = (value: number): string =>
  `\u20B9${value.toLocaleString('en-IN')}`;

const getPaymentColor = (method: string): string => {
  const key = method.toLowerCase();
  for (const k of Object.keys(PAYMENT_COLORS)) {
    if (key.includes(k)) return PAYMENT_COLORS[k];
  }
  return '#546e7a';
};

interface StatCardProps {
  title: string;
  value: string;
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


const SalesTab: React.FC<SalesTabProps> = ({ dashboardData }) => {
  const stats = dashboardData?.stats || {};
  const analytics = dashboardData?.analytics || {};

  const totalRevenue: number = stats.total_revenue || 0;
  const todaysRevenue: number = stats.todays_revenue || 0;
  const avgOrderValue: number = stats.avg_order_value || 0;

  const revenueTrend: any[] = analytics.revenue_trend || [];
  const paymentMethods: any[] = analytics.payment_methods || [];
  const categoryPerformance: any[] = analytics.category_performance || [];

  const maxPaymentPct = paymentMethods.length > 0
    ? Math.max(...paymentMethods.map((p: any) => p.percentage || 0))
    : 100;

  const maxCategoryPct = categoryPerformance.length > 0
    ? Math.max(...categoryPerformance.map((c: any) => c.percentage || 0))
    : 100;

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<AttachMoney sx={{ fontSize: 20 }} />}
            color="#0288d1"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(todaysRevenue)}
            icon={<TrendingUp sx={{ fontSize: 20 }} />}
            color="#2e7d32"
            subtitle="Current day"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(avgOrderValue)}
            icon={<ShoppingCart sx={{ fontSize: 20 }} />}
            color="#f57c00"
            subtitle="Per order"
          />
        </Grid>
      </Grid>

      {/* Revenue Trend Chart */}
      <Box sx={{ mb: 3 }}>
        <RevenueChart
          data={revenueTrend}
          title="Revenue Trend"
          height={340}
          showOrders={true}
        />
      </Box>

      {/* Payment Methods + Category Performance */}
      <Grid container spacing={2.5}>
        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              bgcolor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} fontSize="1rem">
                  Payment Methods
                </Typography>
                <Chip
                  label={`${paymentMethods.length} methods`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>

              {paymentMethods.length === 0 ? (
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
                  <AttachMoney sx={{ fontSize: 40 }} />
                  <Typography variant="body2" color="text.secondary">
                    No payment data available
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {paymentMethods.map((pm: any, idx: number) => {
                    const color = getPaymentColor(pm.method || '');
                    const pct = pm.percentage || 0;
                    const barWidth = maxPaymentPct > 0 ? (pct / maxPaymentPct) * 100 : 0;
                    return (
                      <React.Fragment key={pm.method || idx}>
                        {idx > 0 && <Divider sx={{ my: 1.5 }} />}
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 0.75,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: color,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ textTransform: 'capitalize' }}
                              >
                                {pm.method || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({pm.count || 0} txns)
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Typography variant="body2" fontWeight={700} color="text.primary">
                                {formatCurrency(pm.revenue || 0)}
                              </Typography>
                              <Chip
                                label={`${pct.toFixed(1)}%`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: alpha(color, 0.1),
                                  color,
                                  border: 'none',
                                }}
                              />
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={barWidth}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(color, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: color,
                              },
                            }}
                          />
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Performance */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              bgcolor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} fontSize="1rem">
                  Category Performance
                </Typography>
                <Chip
                  label={`${categoryPerformance.length} categories`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>

              {categoryPerformance.length === 0 ? (
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
                  <Category sx={{ fontSize: 40 }} />
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {categoryPerformance.map((cat: any, idx: number) => {
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    const pct = cat.percentage || 0;
                    const barWidth = maxCategoryPct > 0 ? (pct / maxCategoryPct) * 100 : 0;
                    return (
                      <React.Fragment key={cat.category || idx}>
                        {idx > 0 && <Divider sx={{ my: 1.5 }} />}
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 0.75,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: color,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography variant="body2" fontWeight={600}>
                                {cat.category || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({cat.orders || 0} orders)
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Typography variant="body2" fontWeight={700} color="text.primary">
                                {formatCurrency(cat.revenue || 0)}
                              </Typography>
                              <Chip
                                label={`${pct.toFixed(1)}%`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: alpha(color, 0.1),
                                  color,
                                  border: 'none',
                                }}
                              />
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={barWidth}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(color, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: color,
                              },
                            }}
                          />
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesTab;
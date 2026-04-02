import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  Divider,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AttachMoney,
  ShoppingCart,
  ReceiptLong,
  TableRestaurant,
  AccessTime,
  FiberManualRecord,
} from '@mui/icons-material';
import RevenueChart from '../../charts/RevenueChart';
import OrderStatusChart from '../../charts/OrderStatusChart';
import PeakHoursChart from '../../charts/PeakHoursChart';

interface OverviewTabProps {
  dashboardData: any;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  preparing: '#3B82F6',
  ready: '#10B981',
  completed: '#6B7280',
  cancelled: '#EF4444',
  served: '#8B5CF6',
  confirmed: '#06B6D4',
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  accentColor,
  sub,
}) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      border: '1px solid #e2e8f0',
      borderRadius: 2,
      bgcolor: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
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
        bgcolor: accentColor,
      },
    }}
  >
    <CardContent sx={{ p: 2.5, pl: 3, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'text.secondary',
              display: 'block',
              mb: 0.75,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.6rem',
              lineHeight: 1.15,
              color: 'text.primary',
              letterSpacing: '-0.5px',
            }}
          >
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              {sub}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: iconBg,
            color: iconColor,
            flexShrink: 0,
            ml: 1,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── Recent Activity Card ────────────────────────────────────────────────────

interface RecentActivityCardProps {
  recentActivity: any[];
  theme: any;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ recentActivity, theme }) => {
  const items = recentActivity.slice(0, 8);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        bgcolor: '#ffffff',
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
              Recent Activity
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <FiberManualRecord sx={{ fontSize: 8, color: 'success.main' }} />
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
              Live
            </Typography>
          </Stack>
        </Box>

        {/* List */}
        {items.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              px: 3,
              gap: 1,
            }}
          >
            <ShoppingCart sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No recent activity yet. Orders will appear here once placed.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {items.map((activity: any, index: number) => {
              const total =
                activity.total_amount ??
                (activity.subtotal ?? 0) +
                  (activity.tax_amount ?? 0) -
                  (activity.discount_amount ?? 0);

              const statusColor = STATUS_COLORS[activity.status] ?? '#9E9E9E';

              return (
                <React.Fragment key={activity.id ?? index}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'background 0.15s',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.03) },
                    }}
                  >
                    {/* Status dot */}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: statusColor,
                        flexShrink: 0,
                      }}
                    />

                    {/* Order info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          #{activity.order_number}
                        </Typography>
                        {activity.table_number && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              backgroundColor: alpha(theme.palette.text.secondary, 0.08),
                              px: 0.75,
                              py: 0.1,
                              borderRadius: 0.75,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Table {activity.table_number}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 11, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary">
                          {timeAgo(activity.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right side: amount + dot+text status badge */}
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: 'text.primary', mb: 0.25 }}
                      >
                        ₹{Number(total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: alpha(statusColor, 0.1),
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: statusColor,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: statusColor,
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            textTransform: 'capitalize',
                            lineHeight: 1,
                          }}
                        >
                          {activity.status}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {index < items.length - 1 && (
                    <Divider sx={{ mx: 2.5, borderColor: alpha(theme.palette.divider, 0.6) }} />
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const OverviewTab: React.FC<OverviewTabProps> = ({ dashboardData }) => {
  const theme = useTheme();

  const stats = dashboardData?.stats ?? {};
  const analytics = dashboardData?.analytics ?? {};
  const recentActivity: any[] = dashboardData?.recent_activity ?? [];

  const revenueTrend = useMemo(
    () => (analytics.revenue_trend ?? []) as Array<{ date: string; period: string; revenue: number; orders: number }>,
    [analytics.revenue_trend]
  );

  const orderStatusBreakdown = useMemo(
    () => analytics.order_status_breakdown ?? {},
    [analytics.order_status_breakdown]
  );

  const peakHoursData = useMemo(() => {
    const raw: Array<{ hour: string; orders: number; revenue: number }> =
      analytics.peak_hours ?? [];
    return raw.map((item) => ({
      hour: parseInt(item.hour.split(':')[0], 10),
      orders: item.orders,
      revenue: item.revenue,
    }));
  }, [analytics.peak_hours]);

  const todayRevenue = stats.todays_revenue ?? 0;
  const todayOrders = stats.todays_orders ?? 0;
  const avgOrderValue = stats.avg_order_value ?? 0;
  const occupancyRate = stats.table_occupancy_rate ?? 0;

  const statCards: StatCardProps[] = [
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      icon: <AttachMoney sx={{ fontSize: 22 }} />,
      iconBg: alpha('#10B981', 0.12),
      iconColor: '#10B981',
      accentColor: '#10B981',
      sub: 'Total revenue today',
    },
    {
      label: "Today's Orders",
      value: String(todayOrders),
      icon: <ShoppingCart sx={{ fontSize: 22 }} />,
      iconBg: alpha('#3B82F6', 0.12),
      iconColor: '#3B82F6',
      accentColor: '#3B82F6',
      sub: 'Orders placed today',
    },
    {
      label: 'Avg Order Value',
      value: `₹${Number(avgOrderValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: <ReceiptLong sx={{ fontSize: 22 }} />,
      iconBg: alpha('#F59E0B', 0.12),
      iconColor: '#F59E0B',
      accentColor: '#F59E0B',
      sub: 'Per order average',
    },
    {
      label: 'Table Occupancy',
      value: `${Number(occupancyRate).toFixed(0)}%`,
      icon: <TableRestaurant sx={{ fontSize: 22 }} />,
      iconBg: alpha('#8B5CF6', 0.12),
      iconColor: '#8B5CF6',
      accentColor: '#8B5CF6',
      sub: 'Current occupancy rate',
    },
  ];

  return (
    <Box>
      {/* ── Row 1: Stat Cards ─────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* ── Row 2: Revenue Chart + Order Status ───────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <RevenueChart
            data={revenueTrend}
            title="Revenue & Orders Trend"
            height={320}
            showOrders
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <OrderStatusChart
            data={orderStatusBreakdown}
            title="Order Status"
            height={260}
          />
        </Grid>
      </Grid>

      {/* ── Row 3: Peak Hours + Recent Activity ───────────────────────────── */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <PeakHoursChart
            data={peakHoursData.length > 0 ? peakHoursData : undefined}
            title="Peak Hours"
            height={280}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecentActivityCard recentActivity={recentActivity} theme={theme} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewTab;
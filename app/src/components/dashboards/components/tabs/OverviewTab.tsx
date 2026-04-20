import React from 'react';
import { Box, Grid, Typography, Chip } from '@mui/material';
import RevenueChart from '../../charts/RevenueChart';
import OrderStatusChart from '../../charts/OrderStatusChart';
import PeakHoursChart from '../../charts/PeakHoursChart';

interface OverviewTabProps {
  dashboardData: {
    analytics: {
      revenueTrend: Array<{ date: string; period?: string; revenue: number; orders: number }>;
      orderStatusBreakdown: {
        pending?: number;
        confirmed?: number;
        preparing?: number;
        ready?: number;
        served?: number;
        completed?: number;
        cancelled?: number;
      };
      peakHours: Array<{ hour: number; orders: number; revenue: number }>;
    };
    recentActivity: Array<{
      id: string;
      orderNumber: string;
      status: string;
      subtotal?: number;
      totalAmount?: number;
      tableNumber?: string;
      createdAt: string;
    }>;
    summary: {
      todaysRevenue?: number;
      todaysOrders?: number;
      avgOrderValue?: number;
      tableOccupancyRate?: number;
      activeOrders?: number;
      pendingOrders?: number;
    };
  };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  return `${diffDay}d ago`;
}

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  preparing: '#8b5cf6',
  ready: '#10b981',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] ?? '#64748b';
}

const cardSx = {
  bgcolor: '#fff',
  borderRadius: 2,
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  p: 2.5,
  height: '100%',
};

const cardTitleSx = {
  fontWeight: 700,
  fontSize: '0.875rem',
  color: '#0f172a',
  mb: 2,
};

const OverviewTab: React.FC<OverviewTabProps> = ({ dashboardData }) => {
  const { analytics, recentActivity } = dashboardData;

  return (
    <Box px={{ xs: 2, sm: 3, md: 4 }} py={3} bgcolor="#f8fafc">
      {/* Row 1 */}
      <Grid container spacing={2.5} mb={2.5}>
        <Grid item xs={12} md={8}>
          <Box sx={cardSx}>
            <Typography sx={cardTitleSx}>Revenue Trend</Typography>
            <RevenueChart data={analytics.revenueTrend ?? []} height={280} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={cardSx}>
            <Typography sx={cardTitleSx}>Order Status</Typography>
            <OrderStatusChart data={analytics.orderStatusBreakdown ?? {}} height={280} />
          </Box>
        </Grid>
      </Grid>

      {/* Row 2 */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Box sx={cardSx}>
            <Typography sx={cardTitleSx}>Peak Hours</Typography>
            <PeakHoursChart data={analytics.peakHours ?? []} height={220} />
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={cardSx}>
            <Typography sx={cardTitleSx}>Recent Activity</Typography>

            {recentActivity.length === 0 ? (
              <Typography fontSize="0.8125rem" color="#64748b">
                No recent activity
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                {recentActivity.map((order, index) => {
                  const amount = order.totalAmount ?? order.subtotal ?? 0;
                  const statusColor = getStatusColor(order.status);

                  return (
                    <Box
                      key={order.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom:
                          index < recentActivity.length - 1
                            ? '1px solid #f1f5f9'
                            : 'none',
                        gap: 1,
                      }}
                    >
                      {/* Left: order number + table */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            color: '#0f172a',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {order.orderNumber}
                        </Typography>
                        {order.tableNumber && (
                          <Typography
                            variant="caption"
                            sx={{ color: '#64748b', lineHeight: 1.3 }}
                          >
                            Table {order.tableNumber}
                          </Typography>
                        )}
                      </Box>

                      {/* Center: status chip */}
                      <Chip
                        label={order.status}
                        size="small"
                        sx={{
                          bgcolor: `${statusColor}18`,
                          color: statusColor,
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                          height: 22,
                          textTransform: 'capitalize',
                          flexShrink: 0,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />

                      {/* Right: time + amount */}
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            lineHeight: 1.3,
                          }}
                        >
                          {formatINR(amount)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#64748b', lineHeight: 1.3 }}
                        >
                          {timeAgo(order.createdAt)}
                        </Typography>
                      </Box>
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

export default OverviewTab;
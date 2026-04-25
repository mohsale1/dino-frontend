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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

// Dark-themed status colors: vivid text color + 10% opacity background
const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)'  },
  confirmed: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)'  },
  preparing: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
  ready:     { color: '#10b981', bg: 'rgba(16,185,129,0.10)'  },
  served:    { color: '#1976D2', bg: 'rgba(25,118,210,0.10)'  },
  completed: { color: '#16a34a', bg: 'rgba(22,163,74,0.10)'  },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
};

function getStatusColor(status: string): string {
  return STATUS_CONFIG[status.toLowerCase()]?.color ?? '#94a3b8';
}

function getStatusBg(status: string): string {
  return STATUS_CONFIG[status.toLowerCase()]?.bg ?? 'rgba(148,163,184,0.10)';
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const CARD_SX = {
  bgcolor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  p: 2.5,
  height: '100%',
} as const;

// ─── SectionTitle ─────────────────────────────────────────────────────────────

interface SectionTitleProps {
  label: string;
  accentColor: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ label, accentColor }) => (
  <Box
    sx={{
      borderLeft: `3px solid ${accentColor}`,
      pl: 1.5,
      mb: 2,
    }}
  >
    <Typography
      sx={{
        fontSize: '0.875rem',
        fontWeight: 700,
        color: '#1C1C1E',
        lineHeight: 1.3,
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const OverviewTab: React.FC<OverviewTabProps> = ({ dashboardData }) => {
  if (!dashboardData) return null;
  const { analytics, recentActivity } = dashboardData;

  return (
    <Box px={{ xs: 2, sm: 3, md: 4 }} py={3} bgcolor="#f8fafc">

      {/* Row 1 — Revenue + Order Status */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Box sx={CARD_SX}>
            <SectionTitle label="Revenue Trend" accentColor="#1976D2" />
            <RevenueChart data={analytics.revenueTrend ?? []} height={260} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={CARD_SX}>
            <SectionTitle label="Order Status" accentColor="#42A5F5" />
            <OrderStatusChart data={analytics.orderStatusBreakdown ?? {}} height={260} />
          </Box>
        </Grid>
      </Grid>

      {/* Row 2 — Peak Hours + Recent Orders */}
      <Grid container spacing={2.5} mt={0.5}>
        <Grid item xs={12} md={7}>
          <Box sx={CARD_SX}>
            <SectionTitle label="Peak Hours" accentColor="#FBBF24" />
            <PeakHoursChart data={analytics.peakHours ?? []} height={200} />
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={CARD_SX}>
            <SectionTitle label="Recent Orders" accentColor="#34D399" />

            {recentActivity.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 200,
                }}
              >
                <Typography sx={{ fontSize: '0.8125rem', color: '#666666' }}>
                  No recent orders
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  maxHeight: 280,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(0,0,0,0.12)',
                    borderRadius: 2,
                  },
                }}
              >
                {recentActivity.map((order, index) => {
                  const amount = order.totalAmount ?? order.subtotal ?? 0;
                  const statusKey = order.status.toLowerCase();
                  const statusColor = getStatusColor(statusKey);
                  const statusBg = getStatusBg(statusKey);
                  const isLast = index === recentActivity.length - 1;

                  return (
                    <Box
                      key={order.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.25,
                        borderBottom: isLast ? 'none' : '1px solid #e0e0e0',
                        gap: 1,
                      }}
                    >
                      {/* Left */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            flexWrap: 'wrap',
                            mb: 0.25,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#1C1C1E',
                              lineHeight: 1.3,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {order.orderNumber}
                          </Typography>
                          {order.tableNumber && (
                            <Typography
                              sx={{
                                fontSize: '0.7rem',
                                color: '#666666',
                                lineHeight: 1.3,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Table {order.tableNumber}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            bgcolor: statusBg,
                            color: statusColor,
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 18,
                            borderRadius: '4px',
                            textTransform: 'capitalize',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      </Box>

                      {/* Right */}
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#1C1C1E',
                            lineHeight: 1.3,
                          }}
                        >
                          {formatINR(amount)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            color: '#999999',
                            lineHeight: 1.3,
                            mt: 0.25,
                          }}
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

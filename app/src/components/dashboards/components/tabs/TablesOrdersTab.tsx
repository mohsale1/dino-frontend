import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';

// ─── Types ───────────────────────────────────────────────────────────────────

type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

interface TableItem {
  id: string;
  tableNumber: string;
  status: TableStatus;
  capacity?: number;
  areaId?: string;
  currentOrderId?: string;
  occupancyTime?: number;
}

interface TablesOrdersTabProps {
  dashboardData: {
    tableStatuses: Array<TableItem>;
    analytics: {
      orderStatusBreakdown: {
        pending?: number;
        confirmed?: number;
        preparing?: number;
        ready?: number;
        served?: number;
        completed?: number;
        cancelled?: number;
      };
    };
    summary: {
      totalTables?: number;
      occupiedTables?: number;
      tableOccupancyRate?: number;
      pendingOrders?: number;
      preparingOrders?: number;
      readyOrders?: number;
      activeOrders?: number;
    };
    recentActivity: Array<{
      id: string;
      orderNumber: string;
      status: string;
      totalAmount?: number;
      tableNumber?: string;
      createdAt: string;
    }>;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TableStatus, string> = {
  available:   'Available',
  occupied:    'Occupied',
  reserved:    'Reserved',
  maintenance: 'Maint.',
};

const ORDER_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  confirmed: { bg: 'rgba(14,165,233,0.15)',  color: '#0ea5e9' },
  preparing: { bg: 'rgba(139,92,246,0.15)',  color: '#8b5cf6' },
  ready:     { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  served:    { bg: 'rgba(14,165,233,0.15)',  color: '#0ea5e9' },
  completed: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  cancelled: { bg: 'rgba(244,63,94,0.15)',   color: '#f43f5e' },
};

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'preparing', 'ready']);

// ─── Table cell palette by status ────────────────────────────────────────────

const TABLE_CELL_STYLE: Record<TableStatus, { bg: string; border: string; text: string; dot: string }> = {
  available:   { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.30)',  text: '#10b981', dot: '#10b981' },
  occupied:    { bg: 'rgba(244,63,94,0.10)',   border: 'rgba(244,63,94,0.30)',   text: '#f43f5e', dot: '#f43f5e' },
  reserved:    { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.30)',  text: '#f59e0b', dot: '#f59e0b' },
  maintenance: { bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.25)', text: '#666666', dot: '#999999' },
};

// ─── Shared card sx ──────────────────────────────────────────────────────────

const CARD_SX = {
  bgcolor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  p: 2.5,
} as const;

// ─── SectionTitle ─────────────────────────────────────────────────────────────

function SectionTitle({ label, accentColor }: { label: string; accentColor: string }) {
  return (
    <Box sx={{ borderLeft: `3px solid ${accentColor}`, pl: 1.5, mb: 2 }}>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1C1E', lineHeight: 1.3 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  accentColor: string;
}

function StatCard({ label, value, subtext, accentColor }: StatCardProps) {
  return (
    <Box
      sx={{
        ...CARD_SX,
        borderTop: `3px solid ${accentColor}`,
        display: 'flex',
        flexDirection: 'column',
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
      {subtext && (
        <Typography sx={{ fontSize: '0.75rem', color: '#666666' }}>
          {subtext}
        </Typography>
      )}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TablesOrdersTab({ dashboardData }: TablesOrdersTabProps) {
  // All hooks must be called unconditionally — safe fallbacks used when data is absent
  const tableStatuses  = dashboardData?.tableStatuses  ?? [];
  const summary        = dashboardData?.summary        ?? {};
  const recentActivity = dashboardData?.recentActivity ?? [];

  // Stat counts computed from tableStatuses
  const counts = useMemo(() => {
    const result: Record<TableStatus, number> = {
      available:   0,
      occupied:    0,
      reserved:    0,
      maintenance: 0,
    };
    for (const t of tableStatuses) {
      if (t.status in result) result[t.status]++;
    }
    return result;
  }, [tableStatuses]);

  // Group tables by areaId
  const tablesByArea = useMemo(() => {
    const map = new Map<string, TableItem[]>();
    for (const t of tableStatuses) {
      const key = t.areaId ?? 'Unassigned';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tableStatuses]);

  // Active orders
  const activeOrders = useMemo(
    () => recentActivity.filter((a) => ACTIVE_STATUSES.has(a.status.toLowerCase())),
    [recentActivity],
  );

  // Null guard after all hooks
  if (!dashboardData) return null;

  const totalTables     = summary.totalTables    ?? tableStatuses.length;
  const occupiedTables  = summary.occupiedTables ?? counts.occupied;
  const availableTables = totalTables - occupiedTables;
  const occupancyRate   = summary.tableOccupancyRate ?? 0;

  const progressColor =
    occupancyRate > 70 ? '#f43f5e' : occupancyRate > 40 ? '#f59e0b' : '#10b981';

  const progressBg =
    occupancyRate > 70
      ? 'rgba(244,63,94,0.12)'
      : occupancyRate > 40
      ? 'rgba(245,158,11,0.12)'
      : 'rgba(16,185,129,0.12)';

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, bgcolor: '#f8fafc' }}>

      {/* Row 1 — Stat Cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Available"
            value={availableTables}
            subtext="Tables free"
            accentColor="#10b981"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Occupied"
            value={occupiedTables}
            subtext="In use"
            accentColor="#f43f5e"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Reserved"
            value={counts.reserved}
            subtext="Booked ahead"
            accentColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Total Tables"
            value={totalTables}
            subtext="Configured"
            accentColor="#1976D2"
          />
        </Grid>
      </Grid>

      {/* Row 2 — Occupancy Rate Banner */}
      <Box
        sx={{
          ...CARD_SX,
          mt: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 0.5,
            }}
          >
            Occupancy Rate
          </Typography>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#1C1C1E', lineHeight: 1 }}>
            {occupiedTables} / {totalTables}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(occupancyRate, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': { bgcolor: progressColor, borderRadius: 4 },
            }}
          />
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: progressBg,
            borderRadius: '8px',
            px: 1.5,
            py: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 800,
              color: progressColor,
              lineHeight: 1,
            }}
          >
            {occupancyRate.toFixed(1)}%
          </Typography>
        </Box>
      </Box>

      {/* Row 3 — Table Grid + Active Orders */}
      <Grid container spacing={2.5} sx={{ mt: 0 }}>

        {/* Left: Table Grid */}
        <Grid item xs={12} md={7}>
          <Box sx={{ ...CARD_SX, height: '100%' }}>
            <SectionTitle label="Table Status" accentColor="#1976D2" />

            {tableStatuses.length === 0 ? (
              <Typography sx={{ fontSize: '0.8125rem', color: '#999999' }}>
                No tables configured
              </Typography>
            ) : (
              Array.from(tablesByArea.entries()).map(([areaId, tables]) => (
                <Box key={areaId} sx={{ mb: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#666666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      mb: 1.25,
                    }}
                  >
                    {areaId}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tables.map((table) => {
                      const style = TABLE_CELL_STYLE[table.status] ?? TABLE_CELL_STYLE.maintenance;
                      return (
                        <Box
                          key={table.id}
                          sx={{
                            width: 72,
                            height: 60,
                            borderRadius: '10px',
                            border: `1.5px solid ${style.border}`,
                            bgcolor: style.bg,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            cursor: 'default',
                            transition: 'transform 0.15s',
                            '&:hover': { transform: 'scale(1.04)' },
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: style.dot,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 800,
                              color: style.text,
                              lineHeight: 1,
                            }}
                          >
                            {table.tableNumber}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.58rem',
                              textTransform: 'uppercase',
                              color: style.text,
                              lineHeight: 1,
                              letterSpacing: '0.04em',
                              opacity: 0.8,
                            }}
                          >
                            {STATUS_LABEL[table.status]}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Grid>

        {/* Right: Active Orders */}
        <Grid item xs={12} md={5}>
          <Box sx={{ ...CARD_SX, height: '100%' }}>
            <SectionTitle label="Active Orders" accentColor="#f59e0b" />

            {activeOrders.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 6,
                }}
              >
                <Typography sx={{ fontSize: '0.8125rem', color: '#999999' }}>
                  No active orders
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                {activeOrders.map((order, idx) => {
                  const statusKey = order.status.toLowerCase();
                  const chipStyle = ORDER_STATUS_COLOR[statusKey] ?? {
                    bg: '#f4f4f4',
                    color: '#666666',
                  };
                  return (
                    <Box
                      key={order.id}
                      sx={{
                        py: 1.25,
                        borderBottom:
                          idx < activeOrders.length - 1
                            ? '1px solid #e0e0e0'
                            : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      {/* Left */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                          <Typography
                            sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1C1C1E' }}
                          >
                            {order.orderNumber}
                          </Typography>
                          {order.tableNumber && (
                            <Chip
                              label={`T${order.tableNumber}`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                bgcolor: 'rgba(25,118,210,0.18)',
                                color: '#42A5F5',
                                fontWeight: 600,
                                borderRadius: '4px',
                                '& .MuiChip-label': { px: 0.75 },
                              }}
                            />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: '0.7rem', color: '#666666' }}>
                          {timeAgo(order.createdAt)}
                        </Typography>
                      </Box>

                      {/* Right */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        <Chip
                          label={
                            order.status.charAt(0).toUpperCase() +
                            order.status.slice(1).toLowerCase()
                          }
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            borderRadius: '4px',
                            bgcolor: chipStyle.bg,
                            color: chipStyle.color,
                            fontWeight: 700,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                        {order.totalAmount != null && (
                          <Typography
                            sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1C1C1E' }}
                          >
                            {formatINR(order.totalAmount)}
                          </Typography>
                        )}
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
}

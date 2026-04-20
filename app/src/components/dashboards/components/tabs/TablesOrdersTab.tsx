import { useMemo } from 'react';
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
    maximumFractionDigits: 2,
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

const STATUS_COLOR: Record<TableStatus, string> = {
  available: '#10b981',
  occupied: '#f59e0b',
  reserved: '#3b82f6',
  maintenance: '#94a3b8',
};

const STATUS_LABEL: Record<TableStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
};

const ORDER_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e' },
  confirmed:  { bg: '#dbeafe', color: '#1e40af' },
  preparing:  { bg: '#ede9fe', color: '#5b21b6' },
  ready:      { bg: '#d1fae5', color: '#065f46' },
};

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'preparing', 'ready']);

const CARD_SX = {
  bgcolor: '#fff',
  borderRadius: 2,
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  p: 2.5,
};

const CARD_TITLE_SX = {
  fontWeight: 700,
  fontSize: '0.875rem',
  color: '#0f172a',
  mb: 2,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  count: number;
  borderColor: string;
}

function StatCard({ label, count, borderColor }: StatCardProps) {
  return (
    <Box
      sx={{
        ...CARD_SX,
        borderTop: `3px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#0f172a', lineHeight: 1 }}>
        {count}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TablesOrdersTab({ dashboardData }: TablesOrdersTabProps) {
  const { tableStatuses, summary, recentActivity } = dashboardData;

  // Stat counts
  const counts = useMemo(() => {
    const result: Record<TableStatus, number> = {
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0,
    };
    for (const t of tableStatuses) {
      if (t.status in result) result[t.status]++;
    }
    return result;
  }, [tableStatuses]);

  // Occupancy banner
  const occupancyRate = summary.tableOccupancyRate ?? 0;
  const totalTables = summary.totalTables ?? tableStatuses.length;
  const occupiedTables = summary.occupiedTables ?? counts.occupied;

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
    [recentActivity]
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, bgcolor: '#f8fafc' }}>

      {/* ── Row 1: Stat Cards ── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {(
          [
            { label: 'Available Tables', status: 'available' as TableStatus, border: '#10b981' },
            { label: 'Occupied',         status: 'occupied'   as TableStatus, border: '#f59e0b' },
            { label: 'Reserved',         status: 'reserved'   as TableStatus, border: '#3b82f6' },
            { label: 'Maintenance',      status: 'maintenance' as TableStatus, border: '#94a3b8' },
          ] as const
        ).map(({ label, status, border }) => (
          <Grid item xs={6} sm={3} key={status}>
            <StatCard label={label} count={counts[status]} borderColor={border} />
          </Grid>
        ))}
      </Grid>

      {/* ── Row 2: Occupancy Rate Banner ── */}
      <Box sx={{ ...CARD_SX, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '2.5rem', color: '#0f172a', lineHeight: 1 }}>
            {occupancyRate.toFixed(1)}%
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#64748b' }}>
            Occupancy Rate
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(occupancyRate, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 1,
            bgcolor: '#e2e8f0',
            '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 4 },
          }}
        />
        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
          {occupiedTables} of {totalTables} tables occupied
        </Typography>
      </Box>

      {/* ── Row 3: Table Grid + Active Orders ── */}
      <Grid container spacing={2}>

        {/* Left: Table Grid */}
        <Grid item xs={12} md={7}>
          <Box sx={{ ...CARD_SX, height: '100%' }}>
            <Typography sx={CARD_TITLE_SX}>Table Grid</Typography>

            {tableStatuses.length === 0 ? (
              <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>No table data</Typography>
            ) : (
              Array.from(tablesByArea.entries()).map(([areaId, tables]) => (
                <Box key={areaId} sx={{ mb: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      mb: 1,
                    }}
                  >
                    {areaId}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tables.map((table) => {
                      const color = STATUS_COLOR[table.status] ?? '#94a3b8';
                      return (
                        <Box
                          key={table.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 1.5,
                            px: 1.25,
                            py: 0.6,
                            minWidth: 80,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: color,
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a', lineHeight: 1.2 }}>
                              {table.tableNumber}
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.2 }}>
                              {STATUS_LABEL[table.status]}
                            </Typography>
                          </Box>
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
            <Typography sx={CARD_TITLE_SX}>Active Orders</Typography>

            {activeOrders.length === 0 ? (
              <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>No active orders</Typography>
            ) : (
              <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
                {activeOrders.map((order, idx) => {
                  const statusKey = order.status.toLowerCase();
                  const chipStyle = ORDER_STATUS_COLOR[statusKey] ?? { bg: '#f1f5f9', color: '#475569' };
                  return (
                    <Box
                      key={order.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.25,
                        borderBottom: idx < activeOrders.length - 1 ? '1px solid #f1f5f9' : 'none',
                        gap: 1,
                      }}
                    >
                      {/* Left: order info */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                            {order.orderNumber}
                          </Typography>
                          {order.tableNumber && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Table {order.tableNumber}
                            </Typography>
                          )}
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {timeAgo(order.createdAt)}
                        </Typography>
                      </Box>

                      {/* Right: status chip + amount */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                        <Chip
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                          size="small"
                          sx={{
                            bgcolor: chipStyle.bg,
                            color: chipStyle.color,
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            height: 20,
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                        {order.totalAmount != null && (
                          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>
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
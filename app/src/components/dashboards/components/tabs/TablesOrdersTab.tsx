import React, { useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
  Stack,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  TableRestaurant,
  People,
  CheckCircle,
  Schedule,
  Build,
  AccessTime,
  ReceiptLong,
} from '@mui/icons-material';
import { TableOccupancyChart } from '../../charts';

interface TableStatus {
  id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  capacity?: number;
  area_id?: string;
  current_order_id?: string;
  occupancy_time?: number;
}

interface RecentActivity {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  table_number: string;
  createdAt: string;
}

interface TablesOrdersTabProps {
  dashboardData: any;
}

const STATUS_COLORS: Record<string, string> = {
  available: '#10b981',
  occupied: '#f59e0b',
  reserved: '#3b82f6',
  maintenance: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  preparing: '#3b82f6',
  ready: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

const StatCard: React.FC<{
  label: string;
  count: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}> = ({ label, count, total, color, icon }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        bgcolor: '#ffffff',
        height: '100%',
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
          bgcolor: color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: alpha(color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1}>
            {count}
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.25 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {pct}% of total
        </Typography>
        <Box
          sx={{
            mt: 1.5,
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(color, 0.12),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${pct}%`,
              bgcolor: color,
              borderRadius: 2,
              transition: 'width 0.6s ease',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const TablesOrdersTab: React.FC<TablesOrdersTabProps> = ({ dashboardData }) => {
  const theme = useTheme();

  const tableStatuses: TableStatus[] = dashboardData?.table_statuses ?? [];
  const recentActivity: RecentActivity[] = dashboardData?.recent_activity ?? [];

  const { available, occupied, reserved, maintenance, occupancyRate } = useMemo(() => {
    const av = tableStatuses.filter((t) => t.status === 'available').length;
    const oc = tableStatuses.filter((t) => t.status === 'occupied').length;
    const re = tableStatuses.filter((t) => t.status === 'reserved').length;
    const ma = tableStatuses.filter((t) => t.status === 'maintenance').length;
    const total = tableStatuses.length;
    return {
      available: av,
      occupied: oc,
      reserved: re,
      maintenance: ma,
      occupancyRate: total > 0 ? Math.round((oc / total) * 100) : 0,
    };
  }, [tableStatuses]);

  const activeOrders = useMemo(
    () => recentActivity.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)),
    [recentActivity]
  );

  const tablesByArea = useMemo(() => {
    const groups: Record<string, TableStatus[]> = {};
    tableStatuses.forEach((t) => {
      const area = t.area_id || 'General';
      if (!groups[area]) groups[area] = [];
      groups[area].push(t);
    });
    return groups;
  }, [tableStatuses]);

  const total = tableStatuses.length;

  return (
    <Grid container spacing={2.5}>
      {/* Stat Cards */}
      <Grid item xs={6} sm={3}>
        <StatCard
          label="Available"
          count={available}
          total={total}
          color={STATUS_COLORS.available}
          icon={<CheckCircle sx={{ fontSize: 20, color: STATUS_COLORS.available }} />}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          label="Occupied"
          count={occupied}
          total={total}
          color={STATUS_COLORS.occupied}
          icon={<People sx={{ fontSize: 20, color: STATUS_COLORS.occupied }} />}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          label="Reserved"
          count={reserved}
          total={total}
          color={STATUS_COLORS.reserved}
          icon={<Schedule sx={{ fontSize: 20, color: STATUS_COLORS.reserved }} />}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          label="Maintenance"
          count={maintenance}
          total={total}
          color={STATUS_COLORS.maintenance}
          icon={<Build sx={{ fontSize: 20, color: STATUS_COLORS.maintenance }} />}
        />
      </Grid>

      {/* Occupancy Rate Banner */}
      <Grid item xs={12}>
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            bgcolor: alpha(STATUS_COLORS.occupied, 0.06),
            border: `1px solid ${alpha(STATUS_COLORS.occupied, 0.18)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Current Occupancy Rate
          </Typography>
          <Typography variant="h6" fontWeight={800} color={STATUS_COLORS.occupied}>
            {occupancyRate}%
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(STATUS_COLORS.occupied, 0.12),
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${occupancyRate}%`,
                bgcolor: STATUS_COLORS.occupied,
                borderRadius: 3,
                transition: 'width 0.6s ease',
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {occupied} / {total} tables
          </Typography>
        </Box>
      </Grid>

      {/* Chart (7/12) + Active Orders (5/12) */}
      <Grid item xs={12} md={7}>
        <TableOccupancyChart
          tables={tableStatuses}
          title="Table Status Overview"
          height={300}
        />
      </Grid>

      <Grid item xs={12} md={5}>
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            bgcolor: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLong sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={700}>
                  Active Orders
                </Typography>
              </Box>
              <Chip
                label={activeOrders.length}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              />
            </Box>

            {activeOrders.length === 0 ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 4,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  borderRadius: 1.5,
                  border: `2px dashed ${alpha(theme.palette.grey[500], 0.15)}`,
                }}
              >
                <ReceiptLong sx={{ fontSize: 40, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">
                  No active orders right now
                </Typography>
              </Box>
            ) : (
              <Stack
                spacing={1}
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: 340,
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: alpha(theme.palette.grey[500], 0.3),
                    borderRadius: 2,
                  },
                }}
              >
                {activeOrders.map((order) => {
                  const statusColor = ORDER_STATUS_COLORS[order.status] ?? '#6b7280';
                  return (
                    <Box
                      key={order.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(statusColor, 0.2)}`,
                        bgcolor: alpha(statusColor, 0.04),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            #{order.order_number}
                          </Typography>
                          {order.table_number && (
                            <Typography variant="caption" color="text.secondary">
                              Table {order.table_number}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: alpha(statusColor, 0.12),
                            color: statusColor,
                            border: `1px solid ${alpha(statusColor, 0.25)}`,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ whiteSpace: 'nowrap' }}>
                        {Number(order.total_amount).toFixed(0)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Table Grid grouped by area */}
      <Grid item xs={12}>
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            bgcolor: '#ffffff',
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <TableRestaurant sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={700}>
                Table Grid
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                ({total} tables)
              </Typography>
            </Box>

            {tableStatuses.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  borderRadius: 2,
                  border: `2px dashed ${alpha(theme.palette.grey[500], 0.15)}`,
                }}
              >
                <TableRestaurant sx={{ fontSize: 52, color: 'text.disabled' }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  No table data available
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {Object.entries(tablesByArea).map(([area, tables], areaIdx) => (
                  <Box key={area}>
                    {areaIdx > 0 && <Divider sx={{ mb: 2.5 }} />}
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 1.5 }}
                    >
                      Area: {area}
                    </Typography>
                    <Grid container spacing={1.5}>
                      {tables.map((table) => {
                        const color = STATUS_COLORS[table.status] ?? '#6b7280';
                        return (
                          <Grid item xs={6} sm={4} md={3} lg={2} key={table.id}>
                            <Box
                              sx={{
                                p: 1.75,
                                borderRadius: 2,
                                border: `1px solid #e2e8f0`,
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
                                  bgcolor: color,
                                },
                              }}
                            >
                              {/* Table number + status dot */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <TableRestaurant sx={{ fontSize: 14, color }} />
                                  <Typography variant="body2" fontWeight={800} color="text.primary">
                                    {table.table_number}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: color,
                                    boxShadow: `0 0 0 2px ${alpha(color, 0.25)}`,
                                  }}
                                />
                              </Box>

                              {/* Status chip */}
                              <Chip
                                label={STATUS_LABELS[table.status] ?? table.status}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  bgcolor: alpha(color, 0.12),
                                  color,
                                  border: `1px solid ${alpha(color, 0.25)}`,
                                  mb: 1,
                                }}
                              />

                              {/* Capacity */}
                              {table.capacity != null && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <People sx={{ fontSize: 11, color: 'text.disabled' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {table.capacity} seats
                                  </Typography>
                                </Box>
                              )}

                              {/* Occupancy time */}
                              {table.status === 'occupied' && table.occupancy_time != null && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                  <AccessTime sx={{ fontSize: 11, color: STATUS_COLORS.occupied }} />
                                  <Typography variant="caption" sx={{ color: STATUS_COLORS.occupied, fontWeight: 600 }}>
                                    {table.occupancy_time} min
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TablesOrdersTab;

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Box, Card, CardContent, Typography, useTheme, alpha, Grid, Paper } from '@mui/material';
import {
  EventSeat,
  CheckCircle,
  Block,
  Build,
} from '@mui/icons-material';

interface TableStatus {
  id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  capacity?: number;
  current_order_id?: string;
  occupancy_time?: number;
  area_id?: string;
}

interface TableOccupancyChartProps {
  tables: TableStatus[];
  title?: string;
  height?: number;
}

const statusColors = {
  available: '#4CAF50',
  occupied: '#FF9800',
  reserved: '#2196F3',
  maintenance: '#9E9E9E',
};

const statusLabels = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
};

const statusIcons = {
  available: CheckCircle,
  occupied: EventSeat,
  reserved: Block,
  maintenance: Build,
};

const TableOccupancyChart: React.FC<TableOccupancyChartProps> = ({
  tables = [],
  title = 'Table Status Overview',
  height = 350,
}) => {
  const theme = useTheme();

  const { chartData, statusCounts, occupancyRate, areaBreakdown } = useMemo(() => {
    // Count tables by status
    const counts = tables.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate occupancy rate
    const occupied = counts.occupied || 0;
    const total = tables.length;
    const rate = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0';

    // Group by area
    const byArea = tables.reduce((acc, table) => {
      const area = table.area_id || 'Unknown';
      if (!acc[area]) {
        acc[area] = {
          area: area,
          available: 0,
          occupied: 0,
          reserved: 0,
          maintenance: 0,
        };
      }
      acc[area][table.status]++;
      return acc;
    }, {} as Record<string, any>);

    const areaData = Object.values(byArea);

    return {
      chartData: areaData,
      statusCounts: counts,
      occupancyRate: rate,
      areaBreakdown: areaData,
    };
  }, [tables]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <Paper
          sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: entry.color,
                }}
              />
              <Typography variant="caption">
                {entry.name}: {entry.value} ({((entry.value / total) * 100).toFixed(0)}%)
              </Typography>
            </Box>
          ))}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Total: {total} tables
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        {/* Status Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(statusCounts).map(([status, count]) => {
            const IconComponent = statusIcons[status as keyof typeof statusIcons];
            return (
              <Grid item xs={6} sm={3} key={status}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: alpha(statusColors[status as keyof typeof statusColors], 0.1),
                    border: `2px solid ${alpha(statusColors[status as keyof typeof statusColors], 0.3)}`,
                  }}
                >
                  <IconComponent
                    sx={{
                      fontSize: 32,
                      color: statusColors[status as keyof typeof statusColors],
                      mb: 1,
                    }}
                  />
                  <Typography variant="h5" fontWeight={700}>
                    {count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statusLabels[status as keyof typeof statusLabels]}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Occupancy Rate */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" fontWeight={700} color="primary">
            {occupancyRate}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Occupancy Rate
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {statusCounts.occupied || 0} of {tables.length} tables occupied
          </Typography>
        </Box>

        {/* Stacked Bar Chart by Area */}
        {chartData.length > 0 && (
          <Box sx={{ height, mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status by Area
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                <XAxis
                  dataKey="area"
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                />
                <Bar
                  dataKey="available"
                  stackId="a"
                  fill={statusColors.available}
                  name="Available"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="occupied"
                  stackId="a"
                  fill={statusColors.occupied}
                  name="Occupied"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="reserved"
                  stackId="a"
                  fill={statusColors.reserved}
                  name="Reserved"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="maintenance"
                  stackId="a"
                  fill={statusColors.maintenance}
                  name="Maintenance"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {tables.length === 0 && (
          <Box
            sx={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">No table data available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TableOccupancyChart;

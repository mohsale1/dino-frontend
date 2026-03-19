import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Box, Card, CardContent, Typography, useTheme, alpha, Chip, Stack, Grid } from '@mui/material';
import { AccessTime, TrendingUp, LocalFireDepartment } from '@mui/icons-material';

interface HourlyData {
  hour: number;
  orders: number;
  revenue: number;
}

interface PeakHoursChartProps {
  data?: HourlyData[];
  title?: string;
  height?: number;
}

const PeakHoursChart: React.FC<PeakHoursChartProps> = ({
  data,
  title = 'Peak Hours Analysis',
  height = 350,
}) => {
  const theme = useTheme();

  const { chartData, peakHour, averageOrders, totalOrders } = useMemo(() => {
    // Generate sample data if not provided
    const hourlyData = data || Array.from({ length: 24 }, (_, i) => {
      // Simulate realistic restaurant traffic
      let orders = 0;
      if (i >= 7 && i <= 10) {
        // Breakfast peak
        orders = Math.floor(15 + Math.random() * 25);
      } else if (i >= 11 && i <= 14) {
        // Lunch peak
        orders = Math.floor(30 + Math.random() * 40);
      } else if (i >= 17 && i <= 21) {
        // Dinner peak
        orders = Math.floor(40 + Math.random() * 50);
      } else if (i >= 22 || i <= 6) {
        // Late night/early morning
        orders = Math.floor(Math.random() * 5);
      } else {
        // Off-peak
        orders = Math.floor(5 + Math.random() * 15);
      }
      
      return {
        hour: i,
        orders,
        revenue: orders * (15 + Math.random() * 35), // Random revenue per order
      };
    });

    const formattedData = hourlyData.map(item => ({
      ...item,
      hourLabel: `${item.hour.toString().padStart(2, '0')}:00`,
      displayHour: item.hour === 0 ? '12 AM' : 
                   item.hour < 12 ? `${item.hour} AM` : 
                   item.hour === 12 ? '12 PM' : 
                   `${item.hour - 12} PM`,
    }));

    const peak = formattedData.reduce((max, item) => 
      item.orders > max.orders ? item : max, formattedData[0]
    );

    const total = formattedData.reduce((sum, item) => sum + item.orders, 0);
    const avg = total / formattedData.length;

    return {
      chartData: formattedData,
      peakHour: peak,
      averageOrders: avg.toFixed(1),
      totalOrders: total,
    };
  }, [data]);

  // Color gradient based on order volume
  const getBarColor = (orders: number) => {
    const maxOrders = Math.max(...chartData.map(d => d.orders));
    const intensity = orders / maxOrders;
    
    if (intensity > 0.7) return theme.palette.error.main;
    if (intensity > 0.4) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {data.displayHour}
          </Typography>
          <Typography variant="body2" color="primary">
            Orders: {data.orders}
          </Typography>
          <Typography variant="body2" color="success.main">
            Revenue: ${data.revenue.toFixed(2)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<LocalFireDepartment />}
              label={`Peak: ${peakHour.displayHour}`}
              size="small"
              color="error"
              variant="outlined"
            />
            <Chip
              icon={<TrendingUp />}
              label={`Avg: ${averageOrders} orders/hr`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Peak Hour Highlight */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.error.main, 0.08),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocalFireDepartment sx={{ color: 'error.main' }} />
            <Typography variant="subtitle2" fontWeight={600}>
              Peak Hour: {peakHour.displayHour}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {peakHour.orders} orders • ${peakHour.revenue.toFixed(2)} revenue
          </Typography>
        </Box>

        {/* Chart */}
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
              <XAxis
                dataKey="hourLabel"
                tick={{ fontSize: 10 }}
                stroke={theme.palette.text.secondary}
                interval={1}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke={theme.palette.text.secondary}
                label={{
                  value: 'Orders',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: theme.palette.text.secondary },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={parseFloat(averageOrders)}
                stroke={theme.palette.primary.main}
                strokeDasharray="5 5"
                label={{
                  value: 'Average',
                  position: 'right',
                  fill: theme.palette.primary.main,
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="orders"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.orders)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Time Period Summary */}
        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Time Period Breakdown
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {[
              { label: 'Breakfast (7-10 AM)', hours: [7, 8, 9, 10], color: 'info' },
              { label: 'Lunch (11 AM-2 PM)', hours: [11, 12, 13, 14], color: 'warning' },
              { label: 'Dinner (5-9 PM)', hours: [17, 18, 19, 20, 21], color: 'error' },
            ].map((period) => {
              const periodOrders = chartData
                .filter(d => period.hours.includes(d.hour))
                .reduce((sum, d) => sum + d.orders, 0);
              const percentage = ((periodOrders / totalOrders) * 100).toFixed(1);
              
              return (
                <Grid item xs={12} sm={4} key={period.label}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette[period.color as 'info' | 'warning' | 'error'].main, 0.08),
                      border: `1px solid ${alpha(theme.palette[period.color as 'info' | 'warning' | 'error'].main, 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {period.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {periodOrders}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {percentage}% of total
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PeakHoursChart;
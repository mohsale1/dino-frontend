import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography, useTheme, alpha, Grid } from '@mui/material';
import {
  HourglassEmpty,
  Restaurant,
  CheckCircle,
  LocalShipping,
  Cancel,
  PendingActions,
} from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface OrderStatusData {
  pending?: number;
  confirmed?: number;
  preparing?: number;
  ready?: number;
  served?: number;
  completed?: number;
  cancelled?: number;
}

interface OrderStatusChartProps {
  data: OrderStatusData;
  title?: string;
  height?: number;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: '#FFA726',
    icon: HourglassEmpty,
  },
  confirmed: {
    label: 'Confirmed',
    color: '#42A5F5',
    icon: CheckCircle,
  },
  preparing: {
    label: 'Preparing',
    color: '#AB47BC',
    icon: Restaurant,
  },
  ready: {
    label: 'Ready',
    color: '#66BB6A',
    icon: LocalShipping,
  },
  served: {
    label: 'Served',
    color: '#26A69A',
    icon: CheckCircle,
  },
  completed: {
    label: 'Completed',
    color: '#4CAF50',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF5350',
    icon: Cancel,
  },
};

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
  data = {},
  title = 'Order Status Distribution',
  height = 300,
}) => {
  const theme = useTheme();

  const { chartData, total, statusBreakdown } = useMemo(() => {
    const statuses = Object.keys(data).filter(key => (data as any)[key] > 0);
    const values = statuses.map(key => (data as any)[key]);
    const colors = statuses.map(key => (statusConfig as any)[key]?.color || '#9E9E9E');
    
    const totalOrders = values.reduce((sum, val) => sum + val, 0);
    
    const breakdown = statuses.map(key => ({
      status: key,
      label: (statusConfig as any)[key]?.label || key,
      value: (data as any)[key],
      percentage: totalOrders > 0 ? (((data as any)[key] / totalOrders) * 100).toFixed(1) : '0',
      color: (statusConfig as any)[key]?.color || '#9E9E9E',
      icon: (statusConfig as any)[key]?.icon || PendingActions,
    }));

    return {
      chartData: {
        labels: statuses.map(key => (statusConfig as any)[key]?.label || key),
        datasets: [
          {
            data: values,
            backgroundColor: colors.map(color => alpha(color, 0.8)),
            borderColor: colors,
            borderWidth: 2,
            hoverOffset: 10,
          },
        ],
      },
      total: totalOrders,
      statusBreakdown: breakdown,
    };
  }, [data]);

  const options: ChartOptions<'doughnut'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  }), [theme, total]);

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        
        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height, position: 'relative' }}>
              {total > 0 ? (
                <>
                  <Doughnut data={chartData} options={options} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">No orders data</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Legend */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
              {statusBreakdown.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Box
                    key={item.status}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: alpha(item.color, 0.08),
                      border: `1px solid ${alpha(item.color, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComponent sx={{ color: item.color, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OrderStatusChart;
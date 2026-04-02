import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography, useTheme, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueTrendData {
  date: string;
  period: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueTrendData[];
  title?: string;
  height?: number;
  showOrders?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data = [],
  title = 'Revenue Trend',
  height = 350,
  showOrders = true,
}) => {
  const theme = useTheme();

  // Calculate trend
  const trend = useMemo(() => {
    if (data.length < 2) return { direction: 'neutral', percentage: 0 };
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / secondHalf.length;
    
    const percentage = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return {
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage),
    };
  }, [data]);

  const chartData = useMemo(() => {
    const labels = data.map(d => d.period);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: data.map(d => d.revenue),
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: theme.palette.primary.main,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        ...(showOrders ? [{
          label: 'Orders',
          data: data.map(d => d.orders),
          borderColor: theme.palette.secondary.main,
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: theme.palette.secondary.main,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          yAxisID: 'y1',
        }] : []),
      ],
    };
  }, [data, theme, showOrders]);

  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: theme.typography.fontFamily,
          },
        },
      },
      tooltip: {
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y + ' orders';
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: alpha(theme.palette.divider, 0.1),
        },
        ticks: {
          callback: function(value) {
            return '₹' + Number(value).toLocaleString('en-IN');
          },
          font: {
            size: 11,
          },
        },
      },
      ...(showOrders ? {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            callback: function(value) {
              return value.toLocaleString();
            },
            font: {
              size: 11,
            },
          },
        },
      } : {}),
    },
  }), [theme, showOrders]);

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          {trend.direction !== 'neutral' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend.direction === 'up' ? (
                <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
              ) : (
                <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: trend.direction === 'up' ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {trend.percentage.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ height }}>
          {data.length > 0 ? (
            <Line data={chartData} options={options} />
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
              <Typography variant="body2">No data available</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
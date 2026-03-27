import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography, useTheme, alpha, Chip, Stack } from '@mui/material';
import { Restaurant, AttachMoney, Star } from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MenuItemData {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  category: string;
  rating?: number;
}

interface MenuPerformanceChartProps {
  data: MenuItemData[];
  title?: string;
  height?: number;
  maxItems?: number;
  sortBy?: 'orders' | 'revenue';
}

const MenuPerformanceChart: React.FC<MenuPerformanceChartProps> = ({
  data = [],
  title = 'Top Menu Items',
  height = 400,
  maxItems = 10,
  sortBy = 'revenue',
}) => {
  const theme = useTheme();

  const { chartData, topItems } = useMemo(() => {
    // Sort and limit items
    const sorted = [...data]
      .sort((a, b) => b[sortBy] - a[sortBy])
      .slice(0, maxItems);

    const labels = sorted.map(item => {
      // Truncate long names
      return item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
    });

    return {
      chartData: {
        labels,
        datasets: [
          {
            label: 'Orders',
            data: sorted.map(item => item.orders),
            backgroundColor: alpha(theme.palette.primary.main, 0.8),
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'y',
          },
          {
            label: 'Revenue',
            data: sorted.map(item => item.revenue),
            backgroundColor: alpha(theme.palette.success.main, 0.8),
            borderColor: theme.palette.success.main,
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'y1',
          },
        ],
      },
      topItems: sorted,
    };
  }, [data, maxItems, sortBy, theme]);

  const options: ChartOptions<'bar'> = useMemo(() => ({
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
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 1) {
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
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
            size: 10,
          },
          maxRotation: 45,
          minRotation: 45,
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
            return value.toLocaleString();
          },
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Orders',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Revenue',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
  }), [theme]);

  // Calculate totals
  const totals = useMemo(() => {
    return topItems.reduce(
      (acc, item) => ({
        orders: acc.orders + item.orders,
        revenue: acc.revenue + item.revenue,
      }),
      { orders: 0, revenue: 0 }
    );
  }, [topItems]);

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<Restaurant />}
              label={`${totals.orders} orders`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<AttachMoney />}
              label={`$${totals.revenue.toLocaleString()}`}
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Box sx={{ height }}>
          {topItems.length > 0 ? (
            <Bar data={chartData} options={options} />
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
              <Typography variant="body2">No menu performance data</Typography>
            </Box>
          )}
        </Box>

        {/* Top 3 Items Summary */}
        {topItems.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Top Performers
            </Typography>
            <Stack spacing={1}>
              {topItems.slice(0, 3).map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: index === 0 ? 'warning.main' : index === 1 ? 'info.main' : 'success.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.category}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      ${item.revenue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.orders} orders
                      {item.rating && (
                        <>
                          {' â€¢ '}
                          <Star sx={{ fontSize: 12, verticalAlign: 'middle', color: 'warning.main' }} />
                          {item.rating}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuPerformanceChart;
import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesTabProps {
  stats: any;
  dashboardData: any;
  analyticsData: any;
}

interface SalesMetrics {
  todayRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
}

interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
}

interface HourlySales {
  hour: string;
  revenue: number;
}

interface WeeklySales {
  day: string;
  thisWeek: number;
  lastWeek: number;
}

const SalesTab: React.FC<SalesTabProps> = ({ stats, dashboardData, analyticsData }) => {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    todayRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
  });

  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);
  const [weeklySales, setWeeklySales] = useState<WeeklySales[]>([]);

  useEffect(() => {
    // Use real data from backend, or set empty defaults
    loadRealData();
  }, [analyticsData, stats, dashboardData]);

  const loadRealData = () => {
    // Debug: Log the data we're receiving
    console.log('SalesTab - Analytics Data:', analyticsData);
    console.log('SalesTab - Stats:', stats);
    console.log('SalesTab - Dashboard Data:', dashboardData);
    
    // Set metrics from stats (always show these even if 0)
    const todayRevenue = stats?.todays_revenue || 0;
    const todayOrders = stats?.todays_orders || 0;
    const avgOrderValue = stats?.avg_order_value || 0;
    
    setMetrics({
      todayRevenue: todayRevenue,
      totalOrders: todayOrders,
      averageOrderValue: avgOrderValue,
      revenueGrowth: 0,
    });
    
    // Load revenue trend from analytics
    const revenueTrend = analyticsData?.revenue_trend || [];
    if (revenueTrend.length > 0) {
      const daily: DailySales[] = revenueTrend.map((item: any) => ({
        date: item.period || new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: item.revenue || 0,
        orders: item.orders || 0,
      }));
      setDailySales(daily);

      // Calculate growth from trend data
      let growth = 0;
      if (daily.length >= 2) {
        const todayData = daily[daily.length - 1];
        const yesterdayData = daily[daily.length - 2];
        if (yesterdayData.revenue > 0) {
          growth = ((todayData.revenue - yesterdayData.revenue) / yesterdayData.revenue) * 100;
        }
      }

      setMetrics(prev => ({
        ...prev,
        revenueGrowth: Math.round(growth * 10) / 10,
      }));
    } else {
      // Set empty revenue trend
      setDailySales([]);
    }

    // Load payment methods from analytics
    const paymentMethodsData = analyticsData?.payment_methods || [];
    if (paymentMethodsData.length > 0) {
      const methods: PaymentMethod[] = paymentMethodsData.map((pm: any) => ({
        method: pm.method || 'Unknown',
        amount: pm.revenue || 0,
        percentage: pm.percentage || 0,
      }));
      setPaymentMethods(methods);
    } else {
      // If no payment data, show empty state
      setPaymentMethods([]);
    }

    // Load peak hours from analytics
    const peakHoursData = analyticsData?.peak_hours || [];
    if (peakHoursData.length > 0) {
      const hourly: HourlySales[] = peakHoursData.map((ph: any) => ({
        hour: ph.hour || '',
        revenue: ph.revenue || 0,
      }));
      setHourlySales(hourly);
    } else {
      setHourlySales([]);
    }

    // Calculate weekly comparison from revenue trend
    if (revenueTrend.length >= 14) {
      const weekly: WeeklySales[] = [];
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      // Get last 14 days of data (2 weeks)
      const last14Days = revenueTrend.slice(-14);
      
      for (let i = 0; i < 7; i++) {
        const thisWeekData = last14Days[i + 7] || { revenue: 0 };
        const lastWeekData = last14Days[i] || { revenue: 0 };
        
        weekly.push({
          day: days[i],
          thisWeek: thisWeekData.revenue || 0,
          lastWeek: lastWeekData.revenue || 0,
        });
      }
      
      setWeeklySales(weekly);
    } else {
      setWeeklySales([]);
    }
  };

  // Chart configurations
  const revenueChartData = {
    labels: dailySales.map(d => d.date),
    datasets: [
      {
        label: 'Revenue ($)',
        data: dailySales.map(d => d.revenue),
        fill: true,
        backgroundColor: 'rgba(2, 136, 209, 0.1)',
        borderColor: '#0288d1',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0288d1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#0288d1',
        borderWidth: 1,
        callbacks: {
          label: (context) => `Revenue: $${context.parsed?.y?.toLocaleString() ?? '0'}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const paymentChartData = {
    labels: paymentMethods.map(p => p.method),
    datasets: [
      {
        data: paymentMethods.map(p => p.amount),
        backgroundColor: [
          '#2e7d32', // Cash - green
          '#f57c00', // Credit Card - orange
          '#0288d1', // Debit Card - blue
          '#9c27b0', // Online - purple
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const paymentChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#0288d1',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const method = paymentMethods[context.dataIndex];
            return `${method.method}: $${method.amount.toLocaleString()} (${method.percentage}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  const hourlyChartData = {
    labels: hourlySales.map(h => h.hour),
    datasets: [
      {
        label: 'Hourly Revenue',
        data: hourlySales.map(h => h.revenue),
        backgroundColor: '#0288d1',
        borderColor: '#0288d1',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: '#0277bd',
      },
    ],
  };

  const hourlyChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#0288d1',
        borderWidth: 1,
        callbacks: {
          label: (context) => `Revenue: $${context.parsed?.y?.toLocaleString() ?? '0'}`,
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
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  const weeklyChartData = {
    labels: weeklySales.map(w => w.day),
    datasets: [
      {
        label: 'This Week',
        data: weeklySales.map(w => w.thisWeek),
        borderColor: '#0288d1',
        backgroundColor: '#0288d1',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0288d1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Last Week',
        data: weeklySales.map(w => w.lastWeek),
        borderColor: '#9e9e9e',
        backgroundColor: '#9e9e9e',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#9e9e9e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderDash: [5, 5],
      },
    ],
  };

  const weeklyChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#0288d1',
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.dataset.label}: $${context.parsed?.y?.toLocaleString() ?? '0'}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, trend, icon, color }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
        border: `1px solid ${color}20`,
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 12px 24px ${color}15`,
          borderColor: `${color}40`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'text.secondary',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            mb: 0.5, 
            color: '#1a1a1a',
            fontSize: '1.75rem',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: trend >= 0 ? '#e8f5e9' : '#ffebee',
              }}
            >
              {trend >= 0 ? (
                <TrendingUpIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend >= 0 ? '#2e7d32' : '#d32f2f',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              >
                {Math.abs(trend)}%
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
              }}
            >
              vs yesterday
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Today's Revenue"
            value={`$${metrics.todayRevenue.toLocaleString()}`}
            trend={metrics.revenueGrowth}
            icon={<AttachMoneyIcon />}
            color="#0288d1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            icon={<ShoppingCartIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average Order Value"
            value={`$${metrics.averageOrderValue}`}
            icon={<ReceiptIcon />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Revenue Growth"
            value={`${metrics.revenueGrowth >= 0 ? '+' : ''}${metrics.revenueGrowth}%`}
            icon={metrics.revenueGrowth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            color={metrics.revenueGrowth >= 0 ? '#2e7d32' : '#d32f2f'}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              height: '400px',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#0f172a' }}>
              Revenue Trend (Last 30 Days)
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dailySales.length > 0 ? (
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Line data={revenueChartData} options={revenueChartOptions} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No Revenue Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenue trend will appear once orders are placed
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              height: '400px',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#0f172a' }}>
              Payment Methods
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {paymentMethods.length > 0 ? (
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Doughnut data={paymentChartData} options={paymentChartOptions} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AttachMoneyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No Payment Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment method data will appear once orders are placed
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Hourly Sales Pattern */}
        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              height: '400px',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#0f172a' }}>
              Hourly Sales Pattern
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hourlySales.length > 0 ? (
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Bar data={hourlyChartData} options={hourlyChartOptions} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No Hourly Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hourly sales pattern will appear once orders are placed
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Week Comparison */}
        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              height: '400px',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#0f172a' }}>
              Week Comparison
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {weeklySales.length > 0 ? (
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Line data={weeklyChartData} options={weeklyChartOptions} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No Weekly Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Weekly comparison will appear once sufficient data is available
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesTab;

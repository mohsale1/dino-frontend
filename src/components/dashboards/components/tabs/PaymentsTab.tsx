import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  MonetizationOn,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Error,
  Schedule,
  Assessment,
} from '@mui/icons-material';

interface VenueDashboardStats {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
  total_tables: number;
  total_menu_items: number;
  todays_revenue: number;
  todays_orders: number;
  avg_order_value: number;
  table_occupancy_rate: number;
  popular_items_count: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  occupied_tables: number;
  active_menu_items: number;
}

interface PaymentsTabProps {
  stats: VenueDashboardStats | null;
  analyticsData?: any;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ stats, analyticsData }) => {
  const theme = useTheme();
  
  // Get payment methods from analytics
  const paymentMethodsData = analyticsData?.payment_methods || [];
  const peakHoursData = analyticsData?.peak_hours || [];

  // Show empty state if no stats available
  if (!stats || stats.todays_revenue === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        px: 3
      }}>
        <Payment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Payment Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Payment analytics will appear here once transactions are processed
        </Typography>
      </Box>
    );
  }

  // Calculate payment method distribution from analytics data
  const paymentMethods = paymentMethodsData.length > 0 
    ? paymentMethodsData.map((pm: any) => {
        const methodIcons: any = {
          'cash': <MonetizationOn />,
          'card': <CreditCard />,
          'upi': <Payment />,
          'online': <AccountBalance />,
        };
        
        const methodColors: any = {
          'cash': '#4CAF50',
          'card': '#2196F3',
          'upi': '#FF9800',
          'online': '#9C27B0',
        };
        
        const methodKey = pm.method.toLowerCase();
        
        return {
          method: pm.method,
          percentage: pm.percentage || 0,
          amount: pm.revenue || 0,
          count: pm.count || 0,
          color: methodColors[methodKey] || '#2196F3',
          icon: methodIcons[methodKey] || <Payment />
        };
      })
    : [
        { 
          method: 'Total Revenue', 
          percentage: 100, 
          amount: stats?.todays_revenue || 0, 
          count: stats?.todays_orders || 0,
          color: '#2196F3', 
          icon: <MonetizationOn /> 
        },
      ];

  const paymentStats = [
    {
      title: 'Total Payments Today',
      value: `₹${(stats?.todays_revenue || 0).toLocaleString()}`,
      icon: <MonetizationOn />,
      color: 'success.main',
      bgColor: 'success.50',
      change: null, // Remove fake percentage
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: stats?.todays_orders || 0,
      icon: <CheckCircle />,
      color: 'success.main',
      bgColor: 'success.50',
      change: null, // Remove fake percentage
      changeType: 'positive'
    },
    {
      title: 'Average Order Value',
      value: `₹${stats?.avg_order_value || 0}`,
      icon: <TrendingUp />,
      color: 'primary.main',
      bgColor: 'primary.50',
      change: null, // Remove fake percentage
      changeType: 'positive'
    }
  ];

  // Use peak hours data for transaction trends
  const transactionTrends = peakHoursData.length > 0 
    ? peakHoursData
        .filter((ph: any) => ph.orders > 0)
        .slice(0, 6)
        .map((ph: any) => ({
          time: ph.hour,
          amount: ph.revenue || (ph.orders * (stats?.avg_order_value || 0)),
          transactions: ph.orders
        }))
    : [];

  const maxAmount = transactionTrends.length > 0 
    ? Math.max(...transactionTrends.map((t: any) => t.amount))
    : 1;

  return (
    <Grid container spacing={3}>
      {/* Payment Overview */}
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Assessment sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Payment Analytics Overview
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {paymentStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ 
                    p: 2.5, 
                    backgroundColor: stat.bgColor,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: stat.color,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Avatar sx={{ 
                        backgroundColor: stat.color,
                        width: 40,
                        height: 40
                      }}>
                        {React.cloneElement(stat.icon, { fontSize: 'medium' })}
                      </Avatar>
                       {stat.change && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {stat.changeType === 'positive' ? (
                            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: stat.changeType === 'positive' ? 'success.main' : 'error.main',
                              fontWeight: 600
                            }}
                          >
                            {stat.change}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Methods Distribution */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Payment Methods Distribution
            </Typography>
            
            <Stack spacing={2.5}>
              {paymentMethods.map((method: any, index: number) => (
                <Box key={method.method} sx={{ 
                  p: 2.5, 
                  backgroundColor: `${method.color}15`,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: `${method.color}40`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ 
                        backgroundColor: method.color,
                        width: 36,
                        height: 36
                      }}>
                        {React.cloneElement(method.icon, { fontSize: 'small' })}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {method.method}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: method.color }}>
                        {method.percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ₹{method.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={method.percentage} 
                    sx={{ 
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: method.color
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Transaction Trends */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Hourly Transaction Trends
            </Typography>
            
            {transactionTrends.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Schedule sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Hourly trends will appear here once more data is available
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {transactionTrends.map((trend: any, index: number) => (
                <Box key={trend.time} sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {trend.time}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ₹{trend.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {trend.transactions} transactions
                      </Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(trend.amount / maxAmount) * 100} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: index === transactionTrends.length - 1 ? 'success.main' : 'primary.main'
                      }
                    }}
                  />
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

export default PaymentsTab;
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import {
  ShoppingCart,
  TrendingUp,
  AccessTime,
  Restaurant,
  TableRestaurant,
  MonetizationOn,
} from '@mui/icons-material';
import { 
  EnhancedRevenueChart, 
  EnhancedOrderStatusChart, 
  EnhancedSalesMetrics 
} from '../../../charts/ChartComponents';
import { useDashboardFlags } from '../../../../flags/FlagContext';
import { FlagGate } from '../../../../flags/FlagComponent';

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

interface OverviewTabProps {
  dashboardData: any;
  stats: VenueDashboardStats | null;
  analyticsData?: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ dashboardData, stats, analyticsData }) => {
  const theme = useTheme();
  const dashboardFlags = useDashboardFlags();
  
  // Get popular items from analytics or dashboard data
  const popularItems = analyticsData?.popular_items || dashboardData?.analytics?.popular_items || [];

  return (
    <Grid container spacing={1}>
      {/* Enhanced Revenue Chart - Full Width */}
      <FlagGate flag="dashboard.showRevenueChart">
        <Grid item xs={12}>
          <EnhancedRevenueChart data={dashboardData} stats={stats} />
        </Grid>
      </FlagGate>

      {/* Order Status Chart and Sales Metrics */}
      <FlagGate flag="dashboard.showOrderStatusChart">
        <Grid item xs={12} lg={6}>
          <EnhancedOrderStatusChart data={dashboardData} stats={stats} />
        </Grid>
      </FlagGate>

      {/* Sales Metrics */}
      <FlagGate flag="dashboard.showSalesMetrics">
        <Grid item xs={12} lg={6}>
          <EnhancedSalesMetrics data={dashboardData} stats={stats} />
        </Grid>
      </FlagGate>

      {/* Popular Items */}
      <FlagGate flag="dashboard.showRecentActivity">
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            border: '1px solid',
            borderColor: 'divider',
            height: '100%'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                Top Menu Items
              </Typography>
              
              {popularItems && popularItems.length > 0 ? (
                <List>
                  {popularItems.slice(0, 5).map((item: any, index: number) => (
                    <ListItem key={item.id || index} divider={index < 4}>
                      <ListItemIcon>
                        <Avatar sx={{ backgroundColor: 'primary.main' }}>
                          <Restaurant />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.category} • ${item.orders} orders`}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ₹{typeof item.revenue === 'number' ? item.revenue.toLocaleString() : item.revenue}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexDirection: 'column', 
                  py: 6,
                  backgroundColor: 'grey.50',
                  borderRadius: 1,
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}>
                  <Restaurant sx={{ fontSize: 12, color: 'grey.400', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">No Menu Data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </FlagGate>

      {/* Recent Activity */}
      <FlagGate flag="dashboard.showRecentActivity">
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            border: '1px solid',
            borderColor: 'divider',
            height: '100%'
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Recent Activity
                </Typography>
                <Chip 
                  label="Live" 
                  color="success" 
                  size="small"
                  sx={{ animation: 'pulse 2s infinite' }}
                />
              </Box>
              
              {(() => {
                // Check for both snake_case and camelCase versions
                const recentActivity = dashboardData?.recent_activity || dashboardData?.recentActivity || [];                return recentActivity && recentActivity.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {recentActivity.slice(0, 6).map((activity: any, index: number) => (
                    <ListItem 
                      key={activity.id || index} 
                      divider={index < recentActivity.length - 1}
                      sx={{ 
                        px: 0,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ 
                          backgroundColor: 'primary.main', 
                          width: 22, 
                          height: 22 
                        }}>
                          <ShoppingCart sx={{ fontSize: 12 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography component="span" variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Order #{activity.order_number}
                            </Typography>
                            <Chip 
                              label={activity.status} 
                              size="small"
                              color={
                                activity.status === 'completed' ? 'success' :
                                activity.status === 'pending' ? 'warning' :
                                activity.status === 'preparing' ? 'info' : 'default'
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box component="span" sx={{ mt: 0.5, display: 'block' }}>
                            <Typography component="span" variant="caption" display="block" color="text.secondary">
                              {activity.venue_name} {activity.table_number ? `• Table ${activity.table_number}` : ''}
                            </Typography>
                            <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                              <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                ₹{((activity.subtotal || 0) + (activity.tax_amount || 0) - (activity.discount_amount || 0)).toFixed(2)}
                              </Typography>
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {new Date(activity.createdAt).toLocaleTimeString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexDirection: 'column', 
                  py: 6,
                  backgroundColor: 'grey.50',
                  borderRadius: 1,
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}>
                  <ShoppingCart sx={{ fontSize: 12, color: 'grey.400', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Recent Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Recent system activity will appear here once orders start coming in
                  </Typography>
                </Box>
              );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </FlagGate>
    </Grid>
  );
};

export default OverviewTab;
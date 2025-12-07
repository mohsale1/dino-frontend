import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  BarChart,
  Restaurant,
  Star,
  LocalOffer,
} from '@mui/icons-material';
import { EnhancedPerformanceChart, SimpleBarChart } from '../../../charts/ChartComponents';
import { usePermissions } from '../../../auth';
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

interface SalesAnalyticsTabProps {
  dashboardData: any;
  stats: VenueDashboardStats | null;
  analyticsData?: any;
}

const SalesAnalyticsTab: React.FC<SalesAnalyticsTabProps> = ({ dashboardData, stats, analyticsData }) => {
  const theme = useTheme();
  const { isSuperAdmin } = usePermissions();
  const dashboardFlags = useDashboardFlags();
  
  // Get top menu items and category performance from analytics
  const topMenuItems = analyticsData?.popular_items || dashboardData?.top_menu_items || [];
  const categoryPerformance = analyticsData?.category_performance || [];

  return (
    <Grid container spacing={3}>
      {/* Enhanced Performance Chart */}
      <FlagGate flag="dashboard.showAnalyticsCharts">
        <Grid item xs={12} lg={8}>
          <EnhancedPerformanceChart data={dashboardData} stats={stats} />
        </Grid>
      </FlagGate>

      {/* Category Performance Chart */}
      {categoryPerformance.length > 0 && (
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            border: '1px solid',
            borderColor: 'divider',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Category Performance
              </Typography>
              
              <Stack spacing={2}>
                {categoryPerformance.slice(0, 5).map((category: any, index: number) => (
                  <Box key={category.category} sx={{ 
                    p: 2, 
                    backgroundColor: `hsl(${index * 60}, 70%, 95%)`,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: `hsl(${index * 60}, 70%, 80%)`
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {category.category}
                      </Typography>
                      <Chip 
                        label={`${category.percentage}%`} 
                        size="small"
                        sx={{ backgroundColor: `hsl(${index * 60}, 70%, 85%)` }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Revenue</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ₹{category.revenue.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Orders</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {category.orders}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Top Menu Items */}
      <Grid item xs={12} lg={categoryPerformance.length > 0 ? 12 : 4}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Restaurant sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Top Selling Items
                </Typography>
              </Box>
              <Chip 
                label="Best sellers" 
                color="primary" 
                variant="outlined"
                size="small"
              />
            </Box>
            
            {topMenuItems && topMenuItems.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {topMenuItems.slice(0, 5).map((item: any, index: number) => (
                  <ListItem 
                    key={item.id} 
                    divider={index < 4}
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
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`, 
                        width: 40, 
                        height: 40,
                        fontWeight: 700
                      }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.name}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <Chip 
                              label={item.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            {item.rating && (
                              <Chip
                                icon={<Star sx={{ fontSize: 14 }} />}
                                label={item.rating}
                                size="small"
                                color={item.rating >= 4.5 ? 'success' : item.rating >= 4.0 ? 'warning' : 'error'}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                      }
                      secondary={
                        <Box>
                          {item.venue_name && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {item.venue_name}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.orders} orders
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              ₹{item.revenue.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Restaurant sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">No Menu Data</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top selling items will appear here
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SalesAnalyticsTab;
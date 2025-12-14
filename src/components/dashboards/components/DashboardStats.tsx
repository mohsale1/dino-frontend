import React from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Today,
  ShoppingCart,
  TableRestaurant,
  MonetizationOn,
  TrendingUp,
  Restaurant,
  Pending,
  Kitchen,
  CheckCircle,
  People,
} from '@mui/icons-material';
import { usePermissions } from '../../auth';
import PermissionService from '../../../services/auth';
import { useDashboardFlags } from '../../../flags/FlagContext';
import { ROLE_NAMES, isSuperAdmin as isSuperAdminRole, isAdmin as isAdminRole, isOperator as isOperatorRole } from '../../../constants/roles';

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

interface DashboardStatsProps {
  stats: VenueDashboardStats | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const { isSuperAdmin, isAdmin, isOperator, user } = usePermissions();
  const dashboardFlags = useDashboardFlags();

  // Don't render if flag is disabled
  if (!dashboardFlags.showDashboardStats) {
    return null;
  }

  // SuperAdmin Stats
  const superAdminStats = [
    { 
      label: 'Today\'s Revenue', 
      value: `₹${(stats?.todays_revenue || 0).toLocaleString()}`, 
      color: '#2196F3', 
      icon: <Today />,
      description: `${stats?.todays_orders || 0} orders today`
    },
    { 
      label: 'Active Orders', 
      value: stats?.active_orders || 0, 
      color: '#4CAF50', 
      icon: <ShoppingCart />,
      description: 'Currently processing'
    },
    { 
      label: 'Table Occupancy', 
      value: `${stats?.table_occupancy_rate || 0}%`, 
      color: '#FF9800', 
      icon: <TableRestaurant />,
      description: `${stats?.total_tables || 0} total tables`
    },
    { 
      label: 'Avg Order Value', 
      value: `₹${stats?.avg_order_value || 0}`, 
      color: '#9C27B0', 
      icon: <MonetizationOn />,
      description: `${stats?.total_orders || 0} total orders`
    },
  ];

  // Admin Stats
  const adminStats = [
    { 
      label: 'Today\'s Orders', 
      value: stats?.todays_orders || 0, 
      color: '#2196F3', 
      icon: <Today />,
      description: 'Total orders received today'
    },
    { 
      label: 'Today\'s Revenue', 
      value: `₹${(stats?.todays_revenue || 0).toLocaleString()}`, 
      color: '#4CAF50', 
      icon: <TrendingUp />,
      description: 'Revenue generated today'
    },
    { 
      label: 'Tables Occupied', 
      value: `${stats?.occupied_tables || 0}/${stats?.total_tables || 0}`, 
      color: '#FF9800', 
      icon: <TableRestaurant />,
      description: 'Current table occupancy',
      progress: stats?.table_occupancy_rate || 0
    },
    { 
      label: 'Menu Items Active', 
      value: `${stats?.active_menu_items || 0}/${stats?.total_menu_items || 0}`, 
      color: '#9C27B0', 
      icon: <Restaurant />,
      description: 'Available menu items',
      progress: Math.round((stats?.active_menu_items || 0) / Math.max(stats?.total_menu_items || 1, 1) * 100)
    },
  ];

  // Operator Stats
  const operatorStats = [
    { 
      label: 'Pending Orders', 
      value: stats?.pending_orders || 0, 
      color: '#FF9800', 
      icon: <Pending />,
      description: 'Awaiting confirmation'
    },
    { 
      label: 'Preparing', 
      value: stats?.preparing_orders || 0, 
      color: '#2196F3', 
      icon: <Kitchen />,
      description: 'Currently in kitchen'
    },
    { 
      label: 'Ready to Serve', 
      value: stats?.ready_orders || 0, 
      color: '#4CAF50', 
      icon: <CheckCircle />,
      description: 'Ready for pickup'
    },
    { 
      label: 'Tables Occupied', 
      value: `${stats?.occupied_tables || 0}/${stats?.total_tables || 0}`, 
      color: '#9C27B0', 
      icon: <TableRestaurant />,
      description: 'Current occupancy'
    },
  ];

  const getStatsToRender = () => {
    // Use permission hooks first (most reliable)
    if (isSuperAdmin) return superAdminStats;
    if (isAdmin) return adminStats;
    if (isOperator) return operatorStats;
    
    // Fallback to role detection using constants
    const backendRole = PermissionService.getBackendRole();
    const detectedRole = backendRole?.name || user?.role;
    
    if (isSuperAdminRole(detectedRole)) return superAdminStats;
    if (isAdminRole(detectedRole)) return adminStats;
    if (isOperatorRole(detectedRole)) return operatorStats;
    
    // Default fallback
    return adminStats;
  };

  const statsToRender = getStatsToRender();

  return (
    <Box sx={{ mb: 1 }}>
      <Grid container spacing={1}>
        {statsToRender.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: `${stat.color}08`,
                border: `1px solid ${stat.color}33`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${stat.color}33`,
                  backgroundColor: `${stat.color}12`,
                },
              }}
              data-tour="stats-cards"
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {/* Icon with Badge for Operator */}
                {isOperator ? (
                  <Badge badgeContent={stat.value} color={index === 0 ? 'warning' : index === 1 ? 'primary' : 'success'}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: 1,
                        backgroundColor: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {React.cloneElement(stat.icon, { 
                        fontSize: 'small' 
                      })}
                    </Box>
                  </Badge>
                ) : (
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: 1,
                      backgroundColor: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(stat.icon, { 
                      fontSize: 'small' 
                    })}
                  </Box>
                )}
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="700" 
                    color="text.primary"
                    sx={{ 
                      fontSize: { xs: '0.95rem', sm: '1.15rem' },
                      lineHeight: 1.2,
                      mb: 0.2
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    fontWeight="600"
                    sx={{ 
                      fontSize: '0.7rem',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {stat.label}
                  </Typography>
                  
                  {/* Progress bar for Admin stats */}
                  {(stat as any).progress !== undefined && (
                    <LinearProgress 
                      variant="determinate" 
                      value={(stat as any).progress} 
                      sx={{ 
                        height: 3,
                        borderRadius: 1,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        mt: 0.5,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 1,
                          backgroundColor: stat.color
                        }
                      }}
                    />
                  )}
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.65rem',
                      lineHeight: 1.3,
                      mt: 0.2,
                      display: 'block'
                    }}
                  >
                    {stat.description}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardStats;
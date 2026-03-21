import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
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
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/common/Auth';

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
  isLive?: boolean;
  lastUpdated?: string;
}

interface StatCard {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactElement;
  description: string;
  progress?: number;
}

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({ 
  value, 
  duration = 1000,
  prefix = '',
  suffix = ''
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLive = false, lastUpdated }) => {
  const { hasBackendPermission } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Owner Stats
  const ownerStats: StatCard[] = [
    { 
      label: 'Today\'s Revenue', 
      value: `₹${(stats?.todays_revenue || 0).toLocaleString()}`, 
      color: '#3b82f6', 
      icon: <Today />,
      description: `${stats?.todays_orders || 0} orders today`
    },
    { 
      label: 'Active Orders', 
      value: stats?.active_orders || 0, 
      color: '#10b981', 
      icon: <ShoppingCart />,
      description: 'Currently processing'
    },
    { 
      label: 'Table Occupancy', 
      value: `${stats?.table_occupancy_rate || 0}%`, 
      color: '#f59e0b', 
      icon: <TableRestaurant />,
      description: `${stats?.total_tables || 0} total tables`
    },
    { 
      label: 'Avg Order Value', 
      value: `₹${stats?.avg_order_value || 0}`, 
      color: '#8b5cf6', 
      icon: <MonetizationOn />,
      description: `${stats?.total_orders || 0} total orders`
    },
  ];

  // Manager Stats
  const managerStats: StatCard[] = [
    { 
      label: 'Today\'s Orders', 
      value: stats?.todays_orders || 0, 
      color: '#3b82f6', 
      icon: <Today />,
      description: 'Total orders received today'
    },
    { 
      label: 'Today\'s Revenue', 
      value: `₹${(stats?.todays_revenue || 0).toLocaleString()}`, 
      color: '#10b981', 
      icon: <TrendingUp />,
      description: 'Revenue generated today'
    },
    { 
      label: 'Tables Occupied', 
      value: `${stats?.occupied_tables || 0}/${stats?.total_tables || 0}`, 
      color: '#f59e0b', 
      icon: <TableRestaurant />,
      description: 'Current table occupancy',
      progress: stats?.table_occupancy_rate || 0
    },
    { 
      label: 'Menu Items Active', 
      value: `${stats?.active_menu_items || 0}/${stats?.total_menu_items || 0}`, 
      color: '#8b5cf6', 
      icon: <Restaurant />,
      description: 'Available menu items',
      progress: Math.round((stats?.active_menu_items || 0) / Math.max(stats?.total_menu_items || 1, 1) * 100)
    },
  ];

  // User Stats
  const userStats: StatCard[] = [
    { 
      label: 'Pending Orders', 
      value: stats?.pending_orders || 0, 
      color: '#f59e0b', 
      icon: <Pending />,
      description: 'Awaiting confirmation'
    },
    { 
      label: 'Preparing', 
      value: stats?.preparing_orders || 0, 
      color: '#3b82f6', 
      icon: <Kitchen />,
      description: 'Currently in kitchen'
    },
    { 
      label: 'Ready to Serve', 
      value: stats?.ready_orders || 0, 
      color: '#10b981', 
      icon: <CheckCircle />,
      description: 'Ready for pickup'
    },
    { 
      label: 'Tables Occupied', 
      value: `${stats?.occupied_tables || 0}/${stats?.total_tables || 0}`, 
      color: '#8b5cf6', 
      icon: <TableRestaurant />,
      description: 'Current occupancy'
    },
  ];

  const getStatsToRender = (): StatCard[] => {
    if (hasBackendPermission('application.workspace.manage')) return ownerStats;
    if (hasBackendPermission('application.users.read')) return managerStats;
    return userStats;
  };

  const statsToRender = getStatsToRender();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Live Indicator */}
      {isLive && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Chip
            label="Live Data"
            size="small"
            sx={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-icon': {
                color: '#ffffff',
              },
            }}
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
            }
          />
          {lastUpdated && (
            <Typography variant="caption" color="#64748b" sx={{ ml: 1.5, alignSelf: 'center', fontSize: '0.75rem' }}>
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {statsToRender.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Tooltip title={stat.description} arrow placement="top">
              <Card
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                    borderColor: stat.color,
                  },
                }}
                data-tour="stats-cards"
              >
                <Stack spacing={2}>
                  {/* Icon and Value Row */}
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0,
                      }}
                    >
                      {React.cloneElement(stat.icon, { 
                        sx: { fontSize: 28 }
                      })}
                    </Box>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Big Number */}
                      <Typography 
                        variant="h3" 
                        fontWeight="700" 
                        color="#0f172a"
                        sx={{ 
                          fontSize: { xs: '1.75rem', sm: '2rem' },
                          lineHeight: 1,
                          mb: 0.5,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {typeof stat.value === 'string' && stat.value.includes('₹') ? (
                          stat.value
                        ) : typeof stat.value === 'number' ? (
                          <AnimatedCounter value={stat.value} />
                        ) : (
                          stat.value
                        )}
                      </Typography>
                      
                      {/* Label */}
                      <Typography 
                        variant="subtitle2" 
                        color="#64748b"
                        fontWeight="600"
                        sx={{ 
                          fontSize: '0.75rem',
                          lineHeight: 1.3,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Description */}
                  <Typography 
                    variant="caption" 
                    color="#64748b"
                    sx={{ 
                      fontSize: '0.75rem',
                      lineHeight: 1.4,
                      display: 'block',
                    }}
                  >
                    {stat.description}
                  </Typography>

                  {/* Progress Bar (if applicable) */}
                  {stat.progress !== undefined && (
                    <Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={stat.progress} 
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#f8fafc',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: stat.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography variant="caption" color="#64748b" sx={{ mt: 0.5, display: 'block', textAlign: 'right', fontSize: '0.75rem' }}>
                        {stat.progress}%
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardStats;
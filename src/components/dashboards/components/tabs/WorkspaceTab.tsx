import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  TableRestaurant,
  People,
  CheckCircle,
  Schedule,
  TrendingUp,
  AccessTime,
  EventSeat,
  Restaurant,
} from '@mui/icons-material';
import { TableOccupancyChart } from '../../charts';

interface WorkspaceTabProps {
  stats: any;
  tableStatuses: any[];
  dashboardData: any;
}

const WorkspaceTab: React.FC<WorkspaceTabProps> = ({ stats, tableStatuses, dashboardData }) => {
  const theme = useTheme();

  // Workspace metrics
  const workspaceMetrics = [
    {
      title: 'Table Occupancy',
      value: `${stats?.table_occupancy_rate || 0}%`,
      subtitle: `${stats?.occupied_tables || 0}/${stats?.total_tables || 0} tables`,
      icon: TableRestaurant,
      color: theme.palette.warning.main,
      trend: '+5%',
    },
    {
      title: 'Active Staff',
      value: '12',
      subtitle: '3 on break',
      icon: People,
      color: theme.palette.info.main,
      trend: 'Normal',
    },
    {
      title: 'Avg Service Time',
      value: '18m',
      subtitle: '2m faster than avg',
      icon: AccessTime,
      color: theme.palette.success.main,
      trend: '-10%',
    },
    {
      title: 'Guest Satisfaction',
      value: '4.8',
      subtitle: 'Based on 45 reviews',
      icon: CheckCircle,
      color: theme.palette.primary.main,
      trend: '+0.2',
    },
  ];

  // Table turnover data
  const tableTurnover = [
    { area: 'Main Dining', tables: 10, avgTime: 45, turnover: 3.2, efficiency: 85 },
    { area: 'Patio', tables: 5, avgTime: 52, turnover: 2.8, efficiency: 78 },
    { area: 'Bar Area', tables: 3, avgTime: 38, turnover: 3.8, efficiency: 92 },
    { area: 'Private Room', tables: 2, avgTime: 90, turnover: 1.6, efficiency: 65 },
  ];

  // Staff performance
  const staffPerformance = [
    { name: 'John D.', role: 'Server', tables: 5, orders: 23, rating: 4.9, avatar: 'J' },
    { name: 'Sarah M.', role: 'Server', tables: 4, orders: 19, rating: 4.8, avatar: 'S' },
    { name: 'Mike R.', role: 'Server', tables: 6, orders: 28, rating: 4.7, avatar: 'M' },
    { name: 'Lisa K.', role: 'Server', tables: 3, orders: 15, rating: 4.9, avatar: 'L' },
  ];

  // Operational status
  const operationalStatus = [
    { metric: 'Kitchen Capacity', current: 75, max: 100, status: 'good', color: theme.palette.success.main },
    { metric: 'Wait Time', current: 12, max: 20, status: 'excellent', color: theme.palette.success.main },
    { metric: 'Order Queue', current: 8, max: 15, status: 'good', color: theme.palette.warning.main },
    { metric: 'Delivery Queue', current: 5, max: 10, status: 'excellent', color: theme.palette.success.main },
  ];

  return (
    <Box>
      {/* Workspace Metrics */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {workspaceMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${metric.color}08 0%, ${metric.color}03 100%)`,
                  border: `1px solid ${metric.color}20`,
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 24px ${metric.color}15`,
                    borderColor: `${metric.color}40`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.color}80 100%)`,
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
                      {metric.title}
                    </Typography>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${metric.color}15`,
                        color: metric.color,
                      }}
                    >
                      <IconComponent sx={{ fontSize: 20 }} />
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
                    {metric.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {metric.subtitle}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      backgroundColor: `${metric.color}15`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: metric.color,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    >
                      {metric.trend}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Table Occupancy Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <TableOccupancyChart tables={tableStatuses} title="Table Status Overview" height={400} />
        </Grid>
      </Grid>

    </Box>
  );
};

export default WorkspaceTab;

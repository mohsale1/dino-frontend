import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Restaurant,
  TrendingUp,
  Star,
  Category,
} from '@mui/icons-material';
import { MenuPerformanceChart } from '../../charts';

interface ItemsTabProps {
  stats: any;
  menuPerformance: any[];
  analyticsData: any;
}

const ItemsTab: React.FC<ItemsTabProps> = ({ stats, menuPerformance, analyticsData }) => {
  const theme = useTheme();

  // Get category performance from analytics data
  const categoryPerformance = analyticsData?.category_performance || [];

  return (
    <Box>
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}03 100%)`,
              border: `1px solid ${theme.palette.primary.main}20`,
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${theme.palette.primary.main}15`,
                borderColor: `${theme.palette.primary.main}40`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main}80 100%)`,
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
                  Total Menu Items
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                  }}
                >
                  <Restaurant sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  fontSize: '1.75rem',
                  lineHeight: 1.2,
                }}
              >
                {stats?.total_menu_items || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.main}03 100%)`,
              border: `1px solid ${theme.palette.success.main}20`,
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${theme.palette.success.main}15`,
                borderColor: `${theme.palette.success.main}40`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.main}80 100%)`,
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
                  Active Items
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${theme.palette.success.main}15`,
                    color: theme.palette.success.main,
                  }}
                >
                  <TrendingUp sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  fontSize: '1.75rem',
                  lineHeight: 1.2,
                }}
              >
                {stats?.active_menu_items || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.warning.main}08 0%, ${theme.palette.warning.main}03 100%)`,
              border: `1px solid ${theme.palette.warning.main}20`,
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${theme.palette.warning.main}15`,
                borderColor: `${theme.palette.warning.main}40`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.main}80 100%)`,
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
                  Avg Rating
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${theme.palette.warning.main}15`,
                    color: theme.palette.warning.main,
                  }}
                >
                  <Star sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  fontSize: '1.75rem',
                  lineHeight: 1.2,
                }}
              >
                4.7
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.info.main}08 0%, ${theme.palette.info.main}03 100%)`,
              border: `1px solid ${theme.palette.info.main}20`,
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${theme.palette.info.main}15`,
                borderColor: `${theme.palette.info.main}40`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.info.main}80 100%)`,
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
                  Categories
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${theme.palette.info.main}15`,
                    color: theme.palette.info.main,
                  }}
                >
                  <Category sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  fontSize: '1.75rem',
                  lineHeight: 1.2,
                }}
              >
                {categoryPerformance.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Menu Performance Chart */}
        <Grid item xs={12}>
          <MenuPerformanceChart
            data={menuPerformance}
            title="Top Menu Items Performance"
            height={400}
            maxItems={10}
            sortBy="revenue"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ItemsTab;
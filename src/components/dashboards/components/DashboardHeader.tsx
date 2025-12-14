import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Container,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserFirstName } from '../../../utils/userUtils';
import AnimatedBackground from '../../ui/AnimatedBackground';
import { usePermissions } from '../../auth';
import { ROLES } from '../../../types/auth';

interface DashboardHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  loading,
  refreshing,
  onRefresh,
}) => {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin, isOperator } = usePermissions();

  // Get dashboard title based on role
  const getDashboardTitle = (): string => {
    if (isSuperAdmin) return 'SuperAdmin Dashboard';
    if (isAdmin) return 'Admin Dashboard';
    if (isOperator) return 'Operator Dashboard';
    return 'Dashboard';
  };

  // Get dashboard description based on role
  const getDashboardDescription = (): string => {
    if (isSuperAdmin) return 'Here\'s your system-wide performance overview and analytics.';
    if (isAdmin) return 'Here\'s your comprehensive venue overview and analytics.';
    if (isOperator) return 'Here\'s your order management and operations overview.';
    return 'Here\'s your dashboard overview.';
  };

  const getSubtitle = (): string => {
    if (isSuperAdmin) return 'System-wide Analytics & Management';
    if (isAdmin) return 'Real-time Analytics & Management';
    if (isOperator) return 'Order Management & Operations';
    return 'Dashboard Overview';
  };

  return (
    <Box
      sx={{
        backgroundColor: 'grey.100',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        color: 'text.primary',
        padding: 0,
        margin: 0,
        width: '100%',
      }}
    >
      <AnimatedBackground />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: { xs: 1.5, md: 2 },
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 2.5 },
          }}
        >
          {/* Header Content */}
          <Box sx={{ flex: 1 }} data-tour="dashboard-header">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
              <DashboardIcon sx={{ fontSize: 28, mr: 1.25, color: 'text.primary', opacity: 0.9 }} />
              <Typography
                variant="h5"
                component="h1"
                fontWeight="600"
                sx={{
                  fontSize: { xs: '1.375rem', sm: '1.5rem' },
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  color: 'text.primary',
                }}
              >
                {getDashboardTitle()}
              </Typography>
            </Box>
            
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 400,
                mb: 0.75,
                maxWidth: '500px',
                color: 'text.secondary',
              }}
            >
              Welcome back, {getUserFirstName(user)}! {getDashboardDescription()}
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Business sx={{ fontSize: 16, mr: 0.75, color: 'primary.main', opacity: 0.9 }} />
              <Typography variant="caption" fontWeight="500" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                {getSubtitle()}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexDirection: { xs: 'row', sm: 'row' },
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <IconButton
              onClick={onRefresh}
              disabled={loading || refreshing}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: 'text.secondary',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  color: 'primary.main',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              title={loading || refreshing ? 'Refreshing...' : 'Refresh dashboard'}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardHeader;
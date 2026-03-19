import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { useAuth } from '../../../contexts/common/Auth';
import { getUserFirstName } from '../../../utils/data/userUtils';
import { usePermissions } from '../../auth';

interface DashboardHeaderProps {
  // No props needed - simplified header
}

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
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
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: '#ffffff',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ px: 4, py: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            mb: 0.5,
          }}
        >
          {getDashboardTitle()}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
          Welcome back, {getUserFirstName(user)}! {getDashboardDescription()}
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
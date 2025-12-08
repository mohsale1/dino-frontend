/**
 * DynamicRoute Component
 * Route protection based on stored permissions (no hardcoded permissions)
 * Uses PermissionRegistry to determine route access
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Container } from '@mui/material';
import { Lock, Warning } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

interface DynamicRouteProps {
  children: ReactNode;
  path: string; // The route path to check access for
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

/**
 * DynamicRoute - Protects routes based on stored permissions
 * Automatically checks if user has permission to access the route
 * 
 * Example:
 * <DynamicRoute path="/admin/menu">
 *   <MenuManagement />
 * </DynamicRoute>
 */
export const DynamicRoute: React.FC<DynamicRouteProps> = ({
  children,
  path,
  fallbackPath = '/admin',
  showAccessDenied = true,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { canAccessRoute, isSuperAdmin, isOperator } = usePermissions();
  const location = useLocation();

  // Show loading while authentication is being determined
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superadmin bypass - grant access to everything
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user can access this route
  const hasAccess = canAccessRoute(path);

  if (!hasAccess) {
    // Special handling for operators trying to access admin dashboard
    if (isOperator && path === '/admin') {
      return <Navigate to="/admin/orders" replace />;
    }

    if (showAccessDenied) {
      return <AccessDeniedPage />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

const AccessDeniedPage: React.FC = () => {
  const { user } = useAuth();
  const { userRole, isOperator } = usePermissions();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          backgroundColor: 'error.50',
          border: '1px solid',
          borderColor: 'error.200'
        }}
      >
        <Lock sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
        
        <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">
          Access Denied
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          You don't have permission to access this page
        </Typography>
        
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'warning.50', 
          borderRadius: 2, 
          border: '1px solid',
          borderColor: 'warning.200',
          mb: 3 
        }}>
          <Warning sx={{ color: 'warning.main', mr: 1, verticalAlign: 'middle' }} />
          <Typography variant="body1" component="span" color="warning.dark">
            {`Current Role: ${userRole || user?.role || 'Unknown'}`}
          </Typography>
        </Box>

        {isOperator && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              As an operator, you only have access to the Orders page.
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          If you believe this is an error, please contact your administrator.
        </Typography>
      </Paper>
    </Container>
  );
};

export default DynamicRoute;

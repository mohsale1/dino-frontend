import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { /* ROLE_NAMES, */ isAdminLevel } from '../../constants/roles';
import { GenericErrorPage } from '../errors';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  cafeOwnerOnly?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  cafeOwnerOnly = false,
  requiredRole,
  redirectTo
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo || "/login"} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check specific role requirements
  let hasAccess = true;
  let accessMessage = '';

  if (adminOnly && !isAdminLevel(user.role)) {
    hasAccess = false;
    accessMessage = 'Admin access required.';
  } else if (cafeOwnerOnly && !isAdminLevel(user.role) && (user.role as string) !== 'cafe_owner') {
    hasAccess = false;
    accessMessage = 'Cafe owner access required.';
  } else if (requiredRole && user.role !== requiredRole && !isAdminLevel(user.role)) {
    hasAccess = false;
    accessMessage = `${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} access required.`;
  }

  // Show access denied if user doesn't have required permissions
  if (!hasAccess) {
    return (
      <GenericErrorPage
        type="access-denied"
        message={accessMessage}
        showRetry={false}
        showGoBack={true}
        showGoHome={true}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
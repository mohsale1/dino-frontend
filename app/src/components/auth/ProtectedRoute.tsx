import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  /** When set, the user must have this backend permission to render children.
   *  If missing, a permission-denied screen is shown instead of redirecting. */
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo, requiredPermission }) => {
  const { user, loading, isAuthenticated, hasBackendPermission } = useAuth();
  const location = useLocation();

  // Check if login bypass is enabled
  const bypassLogin = process.env.REACT_APP_BYPASS_LOGIN === 'true';

  // If bypass is enabled, skip all authentication checks
  if (bypassLogin) {
    return <>{children}</>;
  }

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
        <CircularProgress size={60} sx={{ color: '#1976D2' }} />
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
        to={redirectTo || '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  // Permission gate â€” show inline denied screen (do not redirect to login)
  if (requiredPermission && !hasBackendPermission(requiredPermission)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(239,68,68,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <LockOutlined sx={{ fontSize: 32, color: '#ef4444' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
          Access Denied
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 360 }}>
          You do not have permission to view this page. Contact your administrator if you believe this is a mistake.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.history.back()}
          sx={{ mt: 1, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
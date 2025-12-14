/**
 * DynamicRoute Component
 * Route protection based on stored permissions (no hardcoded permissions)
 * Uses PermissionRegistry to determine route access
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Container,
  Button,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  keyframes,
  Avatar,
} from '@mui/material';
import { 
  Lock, 
  Warning,
  Home,
  ArrowBack,
  Security,
  AdminPanelSettings,
  Person,
  Info,
} from '@mui/icons-material';
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

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

// Custom Access Denied Avatar Component
const AccessDeniedAvatar: React.FC<{ size?: number }> = ({ size = 120 }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        mb: 3,
      }}
    >
      {/* Main Lock Avatar */}
      <Avatar
        sx={{
          width: size,
          height: size,
          backgroundColor: 'error.main',
          border: '4px solid',
          borderColor: 'background.paper',
          boxShadow: 4,
          position: 'relative',
          animation: `${shake} 3s ease-in-out infinite`,
        }}
      >
        {/* Lock Icon */}
        <Lock 
          sx={{ 
            fontSize: size * 0.5,
            color: 'white',
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
          }} 
        />
        
        {/* 403 Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            backgroundColor: 'warning.main',
            color: 'white',
            borderRadius: '50%',
            width: size * 0.3,
            height: size * 0.3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.08,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            border: '2px solid white',
            boxShadow: 2,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          403
        </Box>
      </Avatar>

      {/* Floating warning icons */}
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -5,
          width: 24,
          height: 24,
          backgroundColor: 'error.main',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          animation: `${bounce} 2s infinite`,
        }}
      >
        !
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: -10,
          width: 20,
          height: 20,
          backgroundColor: 'warning.main',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: `${bounce} 2s infinite 0.5s`,
        }}
      >
        !
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: -5,
          left: 15,
          width: 18,
          height: 18,
          backgroundColor: 'error.dark',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          animation: `${bounce} 2s infinite 1s`,
        }}
      >
        !
      </Box>
    </Box>
  );
};

const AccessDeniedPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { userRole, isOperator, isSuperAdmin } = usePermissions();

  const handleGoHome = () => {
    if (isAuthenticated) {
      // Redirect operators to orders page
      if (isOperator) {
        navigate('/admin/orders');
      } else {
        navigate('/admin');
      }
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  const handleContactSupport = () => {
    // You can customize this to open a support modal or navigate to contact page
    navigate('/profile'); // Or wherever your support/contact is
  };

  // Get role-specific information
  const getRoleInfo = () => {
    const role = userRole || user?.role || 'Unknown';
    
    switch (role.toLowerCase()) {
      case 'operator':
        return {
          icon: <Person sx={{ fontSize: '1rem' }} />,
          color: 'info',
          label: 'Operator',
          description: 'You have limited access to manage orders only.',
          allowedPages: ['Orders Management'],
        };
      case 'admin':
        return {
          icon: <AdminPanelSettings sx={{ fontSize: '1rem' }} />,
          color: 'primary',
          label: 'Admin',
          description: 'You have access to most administrative features.',
          allowedPages: ['Dashboard', 'Orders', 'Menu', 'Tables', 'Settings'],
        };
      case 'super_admin':
        return {
          icon: <Security sx={{ fontSize: '1rem' }} />,
          color: 'success',
          label: 'Super Admin',
          description: 'You have full access to all features.',
          allowedPages: ['All Pages'],
        };
      default:
        return {
          icon: <Person sx={{ fontSize: '1rem' }} />,
          color: 'default',
          label: role,
          description: 'Your role has specific access permissions.',
          allowedPages: [],
        };
    }
  };

  const roleInfo = getRoleInfo();
  const errorColor = theme.palette.error.main;
  const errorBgColor = alpha(theme.palette.error.main, 0.1);

  // Suggestions based on role
  const getSuggestions = () => {
    if (isOperator) {
      return [
        'Navigate to the Orders page to manage customer orders',
        'Contact your administrator to request additional permissions',
        'Review your role permissions with your manager',
      ];
    }
    return [
      'Try logging in again with the correct credentials',
      'Contact your administrator to verify your access level',
      'Check if you have the required permissions for this page',
      'Return to the dashboard and try a different section',
    ];
  };

  const suggestions = getSuggestions();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${errorBgColor} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 3 },
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: { xs: 80, md: 120 },
          height: { xs: 80, md: 120 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(errorColor, 0.2)} 0%, transparent 70%)`,
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          width: { xs: 60, md: 100 },
          height: { xs: 60, md: 100 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(errorColor, 0.15)} 0%, transparent 70%)`,
          animation: `${float} 8s ease-in-out infinite 1s`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '15%',
          width: { xs: 40, md: 60 },
          height: { xs: 40, md: 60 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(errorColor, 0.1)} 0%, transparent 70%)`,
          animation: `${float} 7s ease-in-out infinite 2s`,
        }}
      />

      {/* Geometric Shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: { xs: 25, md: 35 },
          height: { xs: 25, md: 35 },
          backgroundColor: alpha(theme.palette.error.main, 0.4),
          opacity: 0.4,
          animation: `${shake} 15s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          left: '10%',
          width: 0,
          height: 0,
          borderLeft: { xs: '15px solid transparent', md: '20px solid transparent' },
          borderRight: { xs: '15px solid transparent', md: '20px solid transparent' },
          borderBottom: { xs: '25px solid', md: '35px solid' },
          borderBottomColor: alpha(theme.palette.warning.main, 0.4),
          opacity: 0.4,
          animation: `${float} 9s ease-in-out infinite`,
        }}
      />

      {/* Dotted Pattern */}
      {Array.from({ length: 12 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: { xs: 4, md: 6 },
            height: { xs: 4, md: 6 },
            borderRadius: '50%',
            backgroundColor: 'text.disabled',
            opacity: 0.2,
            top: `${15 + (index * 6)}%`,
            right: `${5 + (index % 3) * 2}%`,
            animation: `${pulse} ${3 + (index % 3)}s ease-in-out infinite`,
          }}
        />
      ))}

      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            animation: `${slideIn} 0.6s ease-out`,
          }}
        >
          {/* Custom Access Denied Avatar */}
          <AccessDeniedAvatar size={isMobile ? 100 : 120} />

          {/* Error Code */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontFamily: 'monospace',
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 'bold',
              color: 'error.main',
              mb: 1,
              lineHeight: 1,
            }}
          >
            403
          </Typography>

          {/* Error Title */}
          <Typography 
            variant="h3"
            fontWeight="700"
            color="text.primary"
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            Access Denied
          </Typography>

          {/* Error Message */}
          <Typography 
            variant="h6"
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.6,
              mb: 3,
              fontWeight: 400,
            }}
          >
            You don't have permission to access this page
          </Typography>

          {/* Current Role Chip */}
          <Box sx={{ mb: 4 }}>
            <Chip
              icon={roleInfo.icon}
              label={`Current Role: ${roleInfo.label}`}
              color={roleInfo.color as any}
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
                py: 2.5,
                px: 1,
                borderRadius: 3,
                boxShadow: 2,
              }}
            />
          </Box>

          {/* Role Description */}
          <Box 
            sx={{ 
              mb: 4,
              p: 2, 
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.3),
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            <Typography 
              variant="body1" 
              color="info.main"
              sx={{ 
                fontWeight: 500,
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                mb: 1,
              }}
            >
              {roleInfo.description}
            </Typography>
            {roleInfo.allowedPages.length > 0 && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  mt: 1,
                }}
              >
                <strong>Allowed Pages:</strong> {roleInfo.allowedPages.join(', ')}
              </Typography>
            )}
          </Box>

          {/* Current URL display */}
          <Box 
            sx={{ 
              mb: 4,
              p: 2, 
              backgroundColor: 'grey.100', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.300',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontFamily: 'monospace', 
                fontSize: { xs: '0.8rem', md: '0.875rem' },
                wordBreak: 'break-all',
              }}
            >
              Requested URL: {location.pathname}
            </Typography>
          </Box>

          {/* Suggestions Card */}
          <Box
            sx={{
              maxWidth: 500,
              mx: 'auto',
              mb: 4,
              p: { xs: 2.5, md: 3 },
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
              textAlign: 'left',
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="700"
              color="text.primary"
              sx={{ 
                mb: 2.5, 
                fontSize: { xs: '1rem', md: '1.125rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box component="span" sx={{ fontSize: '1rem' }}>💡</Box>
              What you can try:
            </Typography>
            <Stack spacing={1.5}>
              {suggestions.map((suggestion, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: errorColor,
                      mt: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.875rem', md: '0.9375rem' },
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {suggestion}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleGoHome}
              size="large"
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 3,
                py: 1.75,
                px: 4,
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${errorColor} 0%, ${alpha(errorColor, 0.8)} 100%)`,
                boxShadow: `0 8px 24px ${alpha(errorColor, 0.4)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 32px ${alpha(errorColor, 0.5)}`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {isOperator ? 'Go to Orders' : 'Dashboard'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              size="large"
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 3,
                py: 1.75,
                px: 4,
                fontSize: '1rem',
                borderWidth: 2,
                borderColor: alpha(theme.palette.text.primary, 0.2),
                color: 'text.primary',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: errorColor,
                  backgroundColor: alpha(errorColor, 0.08),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Go Back
            </Button>

            <Button
              variant="text"
              startIcon={<Info />}
              onClick={handleContactSupport}
              size="large"
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 3,
                py: 1.75,
                px: 4,
                fontSize: '1rem',
                color: 'text.secondary',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: alpha(errorColor, 0.08),
                  color: errorColor,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Contact Support
            </Button>
          </Stack>

          {/* Help text */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mt: 3,
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              opacity: 0.8,
            }}
          >
            If you believe this is an error, please contact your administrator or{' '}
            <Box
              component="span"
              sx={{
                color: errorColor,
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={handleContactSupport}
            >
              reach out to support
            </Box>
            .
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default DynamicRoute;
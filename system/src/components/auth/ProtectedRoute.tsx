import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/common/Auth';
import { PageTransitionLoader } from '../ui/PageTransitionLoader';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  const bypassLogin = process.env.REACT_APP_BYPASS_LOGIN === 'true';

  if (bypassLogin) {
    return <>{children}</>;
  }

  if (loading) {
    return <PageTransitionLoader visible message="Authenticating..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={redirectTo || '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};


export default ProtectedRoute;

import React, { useEffect, memo, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { GlobalErrorBoundary } from './components/errors';
import { ProtectedRoute, PermissionSync } from './components/auth';
import AppLayout from './components/layout/AppLayout';
import { AppInitializer } from './components/common';

import { AuthProvider, useAuth } from './contexts/common/Auth';
import { ToastProvider } from './contexts/common/Toast';
import { SidebarProvider } from './contexts/common/Sidebar';
import { NotificationProvider } from './contexts/common/Notification';
import { WorkspaceProvider } from './contexts/application/Workspace';
import { UserDataProvider } from './contexts/application/UserData';

import { Home, Login, Register, NotFound } from './pages/common';
import {
  Dashboard as AppDashboard,
  POS,
  Catalog,
  Locations,
  Orders,
  Users,
  Coupons,
  Settings,
} from './pages/application';

import { RUNTIME_CONFIG } from './config/runtime';
import { StorageCleanup } from './utils/storage';
import { tokenRefreshScheduler } from './utils/auth';
import { apiService } from './utils/api';
import { initializePerformanceMonitoring } from './utils/performance';
import { PageTransitionLoader, usePageTransition } from './components/ui/PageTransitionLoader';
import { ROLE_COLORS } from './constants/app';

const theme = createTheme({
  palette: {
    mode: (RUNTIME_CONFIG.DEFAULT_THEME as 'light' | 'dark') || 'light',
  },
});

const PublicMenu = React.lazy(() => import('./pages/public/Menu'));

// Inner component — has access to both AuthContext and RouterContext
const AppContent = memo(() => {
  const { loading, userPermissions } = useAuth();
  const { transitioning } = usePageTransition();

  const rawRole = (userPermissions?.role?.name || '').toLowerCase();
  const roleKey: keyof typeof ROLE_COLORS = rawRole.includes('owner') || rawRole.includes('super')
    ? 'Owner'
    : rawRole.includes('manager') || rawRole.includes('admin')
    ? 'Manager'
    : 'User';
  const loaderColor = ROLE_COLORS[roleKey].primary;

  return (
    <>
      <PageTransitionLoader
        visible={loading || transitioning}
        message={loading ? 'Initialising...' : 'Loading...'}
        color={loaderColor}
      />
      <Suspense fallback={null}>
        <Routes>
          {/* Public routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/:organizationId/:tableId/menu" element={<PublicMenu />} />
          </Route>

          {/* Protected application routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AppDashboard />} />
            <Route path="/admin/pos" element={<POS />} />
            <Route path="/admin/catalog" element={<Catalog />} />
            <Route path="/admin/locations" element={<Locations />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/coupons" element={<Coupons />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
});
AppContent.displayName = 'AppContent';

const AppProviders = memo(({ children }: { children: React.ReactNode }) => (
  <GlobalErrorBoundary>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <SidebarProvider>
          <AuthProvider>
            <PermissionSync>
              <UserDataProvider>
                <AppInitializer>
                  <WorkspaceProvider>
                    <NotificationProvider>
                      {children}
                    </NotificationProvider>
                  </WorkspaceProvider>
                </AppInitializer>
              </UserDataProvider>
            </PermissionSync>
          </AuthProvider>
        </SidebarProvider>
      </ToastProvider>
    </MuiThemeProvider>
  </GlobalErrorBoundary>
));
AppProviders.displayName = 'AppProviders';

function App() {
  useEffect(() => {
    StorageCleanup.performCleanup();
    setTimeout(() => apiService.refreshConfiguration(), 200);
    tokenRefreshScheduler.start();
    initializePerformanceMonitoring();
    return () => { tokenRefreshScheduler.stop(); };
  }, []);

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;

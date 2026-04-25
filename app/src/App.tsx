import React, { useEffect, memo, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { GlobalErrorBoundary } from './components/errors';
import { ProtectedRoute, PermissionSync } from './components/auth';
import AppLayout from './components/layout/AppLayout';
import { AppInitializer } from './components/common';

import { AuthProvider } from './contexts/common/Auth';
import { ToastProvider } from './contexts/common/Toast';
import { NotificationProvider } from './contexts/common/Notification';
import { WorkspaceProvider } from './contexts/application/Workspace';
import { UserDataProvider } from './contexts/application/UserData';
import { WorkspaceApprovalProvider } from './contexts/application/WorkspaceApproval';

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
  PersonaSwitch,
} from './pages/application';

import { RUNTIME_CONFIG } from './config/runtime';
import { StorageCleanup } from './utils/storage';
import { tokenRefreshScheduler } from './utils/auth';
import { apiService } from './utils/api';
import { initializePerformanceMonitoring } from './utils/performance';

const theme = createTheme({
  palette: {
    mode: (RUNTIME_CONFIG.DEFAULT_THEME as 'light' | 'dark') || 'light',
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
    },
  },
});

const PublicMenu = React.lazy(() => import('./pages/public/Menu'));

// Inner component — has access to both AuthContext and RouterContext
const AppContent = memo(() => {
  return (
    <>
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
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredPermission="dashboard:view"><AppDashboard /></ProtectedRoute>} />
            <Route path="/admin/pos" element={<ProtectedRoute requiredPermission="pos:view"><POS /></ProtectedRoute>} />
            <Route path="/admin/catalog" element={<ProtectedRoute requiredPermission="catalog:view"><Catalog /></ProtectedRoute>} />
            <Route path="/admin/locations" element={<ProtectedRoute requiredPermission="locations:view"><Locations /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requiredPermission="orders:view"><Orders /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredPermission="users:view"><Users /></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute requiredPermission="coupons:view"><Coupons /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredPermission="settings:view"><Settings /></ProtectedRoute>} />
            <Route path="/admin/personas" element={<PersonaSwitch />} />
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
        <AuthProvider>
          <PermissionSync>
            <UserDataProvider>
              <AppInitializer>
                <WorkspaceApprovalProvider>
                  <WorkspaceProvider>
                    <NotificationProvider>
                      {children}
                    </NotificationProvider>
                  </WorkspaceProvider>
                </WorkspaceApprovalProvider>
              </AppInitializer>
            </UserDataProvider>
          </PermissionSync>
        </AuthProvider>
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
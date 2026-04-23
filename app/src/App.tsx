import React, { useEffect, memo, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { GlobalErrorBoundary } from './components/errors';
import { ProtectedRoute, PermissionSync } from './components/auth';
import AppLayout from './components/layout/AppLayout';
import { AppInitializer } from './components/common';

import { AuthProvider } from './contexts/common/Auth';
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

// Inner component â€” has access to both AuthContext and RouterContext
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
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredPermission="application.dashboard.view"><AppDashboard /></ProtectedRoute>} />
            <Route path="/admin/pos" element={<ProtectedRoute requiredPermission="application.pos.view"><POS /></ProtectedRoute>} />
            <Route path="/admin/catalog" element={<ProtectedRoute requiredPermission="application.catalog.view"><Catalog /></ProtectedRoute>} />
            <Route path="/admin/locations" element={<ProtectedRoute requiredPermission="application.locations.view"><Locations /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requiredPermission="application.orders.view"><Orders /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredPermission="application.users.view"><Users /></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute requiredPermission="application.coupons.view"><Coupons /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredPermission="application.settings.view"><Settings /></ProtectedRoute>} />
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
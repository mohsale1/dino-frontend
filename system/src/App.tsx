import React, { useEffect, memo, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { GlobalErrorBoundary } from './components/errors';
import { ProtectedRoute, PermissionSync } from './components/auth';
import SystemLayout from './components/layout/SystemLayout';
import { AppInitializer } from './components/common';

import { AuthProvider, useAuth } from './contexts/common/Auth';
import { ToastProvider } from './contexts/common/Toast';
import { SidebarProvider } from './contexts/common/Sidebar';

import { Login, NotFound } from './pages/common';
import {
  Dashboard as SystemDashboard,
  RolesPermissions,
  UserManagement,
  Workspaces,
  Billing,
  RegistrationCodes,
  Settings as SystemSettings,
  Appearance,
  Profile,
} from './pages/system';

import { RUNTIME_CONFIG } from './config/runtime';
import { StorageCleanup } from './utils/storage';
import { tokenRefreshScheduler } from './utils/auth';
import { apiService } from './utils/api';
import { initializePerformanceMonitoring } from './utils/performance';
import { PageTransitionLoader, usePageTransition } from './components/ui/PageTransitionLoader';

const theme = createTheme({
  palette: {
    mode: (RUNTIME_CONFIG.DEFAULT_THEME as 'light' | 'dark') || 'light',
  },
});

// Inner component — has access to both auth context and router context
const AppContent = memo(() => {
  const { loading } = useAuth();
  const { transitioning } = usePageTransition();

  return (
    <>
      <PageTransitionLoader
        visible={loading || transitioning}
        message={loading ? 'Initialising...' : 'Loading...'}
      />
      <Suspense fallback={null}>
        <Routes>
          {/* Root redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public: login only */}
          <Route path="/login" element={<Login />} />

          {/* Protected system routes */}
          <Route element={<ProtectedRoute redirectTo="/login"><SystemLayout /></ProtectedRoute>}>
            <Route path="/system" element={<Navigate to="/system/dashboard" replace />} />
            <Route path="/system/dashboard" element={<SystemDashboard />} />
            <Route path="/system/users" element={<UserManagement />} />
            <Route path="/system/roles-permissions" element={<RolesPermissions />} />
            <Route path="/system/workspaces" element={<Workspaces />} />
            <Route path="/system/billing" element={<Billing />} />
            <Route path="/system/registration-codes" element={<RegistrationCodes />} />
            <Route path="/system/settings" element={<SystemSettings />} />
            <Route path="/system/appearance" element={<Appearance />} />
            <Route path="/system/profile" element={<Profile />} />
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
              <AppInitializer>
                {children}
              </AppInitializer>
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
import { useEffect, memo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box, ThemeProvider as MuiThemeProvider, CssBaseline, createTheme } from '@mui/material';

// Context Providers
import { AuthProvider } from './contexts/common/Auth';
import { WorkspaceProvider } from './contexts/application/Workspace';
import { UserDataProvider } from './contexts/application/UserData';
import { NotificationProvider } from './contexts/common/Notification';
import { ToastProvider } from './contexts/common/Toast';
import { SidebarProvider } from './contexts/common/Sidebar';

// Pages
import { Home, Login, Register, NotFound } from './pages/common';
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
import { 
  Dashboard as AppDashboard,
  POS,
  Catalog, 
  Locations, 
  Orders, 
  Users,
  Coupons,
  Settings 
} from './pages/application';
import PublicMenu from './pages/public/Menu';

// Components
import { ProtectedRoute, PermissionSync } from './components/auth';
import { Layout, AppInitializer } from './components/common';
import { SystemLayout } from './components/layout';
import { GlobalErrorBoundary } from './components/errors';

// Utils
import { RUNTIME_CONFIG as config } from './config/runtime';
import { StorageCleanup } from './utils/storage';
import { tokenRefreshScheduler } from './utils/auth/tokenRefreshScheduler';
import { apiService } from './utils/api';
import { initializePerformanceMonitoring } from './utils/performance';

// Use MUI's default theme
const defaultTheme = createTheme();

// Loading fallback component
const LoadingFallback = memo(() => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={40} />
  </Box>
));
LoadingFallback.displayName = 'LoadingFallback';

// Composed Provider to reduce nesting
const AppProviders = memo(({ children }: { children: React.ReactNode }) => (
  <GlobalErrorBoundary>
    <MuiThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <ToastProvider>
        <SidebarProvider defaultCollapsed={true}>
          <AuthProvider>
            <PermissionSync autoRefreshInterval={0} showSyncStatus={false}>
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

// Reusable route wrapper components
const LayoutWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <Layout>{children}</Layout>
));
LayoutWrapper.displayName = 'LayoutWrapper';

// VenueLayoutWrapper removed - no longer needed

const ProtectedLayoutWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <Layout>
    <ProtectedRoute>{children}</ProtectedRoute>
  </Layout>
));
ProtectedLayoutWrapper.displayName = 'ProtectedLayoutWrapper';

function App() {
  // Initialize app on startup
  useEffect(() => {
    let configTimeout: ReturnType<typeof setTimeout> | undefined;
    
    try {
      // Clean up legacy data from localStorage
      StorageCleanup.performCleanup();
      
      // Refresh API configuration from runtime config
      if (typeof window !== 'undefined') {
        // Wait for config.js to load
        configTimeout = setTimeout(() => {
          apiService.refreshConfiguration();
        }, 200);
        
        tokenRefreshScheduler.start();
        
        // Initialize performance monitoring
        initializePerformanceMonitoring();
      }
    } catch (error) {
      console.error('Application initialization failed:', error);
      
      // In production, show a user-friendly error message
      if (config.APP_ENV === 'production') {
        alert('Application initialization failed. Please refresh the page or contact support.');
      }
    }

    // Cleanup function
    return () => {
      if (configTimeout) clearTimeout(configTimeout);
      tokenRefreshScheduler.stop();
    };
  }, []);

  return (
    <AppProviders>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LayoutWrapper><Home /></LayoutWrapper>} />
        <Route path="/home" element={<LayoutWrapper><Home /></LayoutWrapper>} />
        
        {/* Public Menu Route */}
        <Route path="/:organizationId/:tableId/menu" element={<PublicMenu />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* System Admin Routes (for SuperAdmin, BillingManager, etc.) */}
        <Route 
          path="/system/dashboard" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <SystemDashboard />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* System Roles & Permissions */}
        <Route 
          path="/system/roles" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <RolesPermissions />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* System User Management */}
        <Route 
          path="/system/users" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <UserManagement />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* System Workspaces */}
        <Route 
          path="/system/workspaces" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <Workspaces />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* System Billing */}
        <Route 
          path="/system/billing" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <Billing />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* System Registration Codes */}
        <Route 
          path="/system/registration" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <RegistrationCodes />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* System Settings */}
        <Route 
          path="/system/settings" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <SystemSettings />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* System Appearance */}
        <Route 
          path="/system/appearance" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <Appearance />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* System Profile */}
        <Route 
          path="/system/profile" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <Profile />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />

        {/* Legacy system route */}
        <Route 
          path="/admin/system" 
          element={
            <ProtectedRoute>
              <SystemLayout>
                <SystemDashboard />
              </SystemLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <Layout>
              <ProtectedRoute>
                <AppDashboard />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* Legacy /admin route - redirect to dashboard */}
        <Route 
          path="/admin" 
          element={
            <Layout>
              <ProtectedRoute>
                <AppDashboard />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* POS - Point of Sale / Manual Order Entry */}
        <Route 
          path="/admin/pos" 
          element={
            <Layout>
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* Catalog Management (was Menu) */}
        <Route 
          path="/admin/catalog" 
          element={
            <Layout>
              <ProtectedRoute>
                <Catalog />
              </ProtectedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/admin/menu" 
          element={
            <Layout>
              <ProtectedRoute>
                <Catalog />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* Locations Management (was Tables) */}
        <Route 
          path="/admin/locations" 
          element={
            <Layout>
              <ProtectedRoute>
                <Locations />
              </ProtectedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/admin/tables" 
          element={
            <Layout>
              <ProtectedRoute>
                <Locations />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* Orders Management */}
        <Route 
          path="/admin/orders" 
          element={
            <Layout>
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* Users Management */}
        <Route 
          path="/admin/users" 
          element={
            <Layout>
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* Coupons Management */}
        <Route 
          path="/admin/coupons" 
          element={
            <Layout>
              <ProtectedRoute>
                <Coupons />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* Settings */}
        <Route 
          path="/admin/settings" 
          element={
            <Layout>
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </Layout>
          } 
        />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppProviders>
  );
}

export default App;

import { useEffect, Suspense, memo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { VenueThemeProvider } from './contexts/VenueThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { DinoAvatarProvider } from './contexts/DinoAvatarContext';
import { TourProvider } from './contexts/TourContext';
import { FlagProvider } from './flags/FlagContext';

// Public Pages
import { HomePage } from './pages/public';

// Authentication Pages
import { LoginPage } from './pages/auth';

// Menu Pages
import { MenuPage, CheckoutPage, OrderTrackingPage, OrderSuccessPage } from './pages/menu';

// Lazy-loaded components
import { LazyComponents } from './components/lazy';

// Components
import { ProtectedRoute, UserProfile, PermissionSync, DynamicRoute } from './components/auth';
import { Layout, ErrorBoundary, AppInitializer } from './components/common';
import { NotFoundPage } from './pages/public';
import DashboardRouter from './components/dashboards/DashboardRouter';

// Utils
import { RUNTIME_CONFIG as config } from './config/runtime';
import { StorageCleanup } from './utils/storage';
import { tokenRefreshScheduler } from './utils/tokenRefreshScheduler';
import { apiService } from './utils/api';
import { initializePerformanceMonitoring } from './utils/performance';

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
  <ErrorBoundary>
    <FlagProvider>
      <ThemeProvider>
        <ToastProvider>
          <SidebarProvider defaultCollapsed={true}>
            <DinoAvatarProvider>
              <AuthProvider>
                <TourProvider>
                  <PermissionSync autoRefreshInterval={0} showSyncStatus={false}>
                    <UserDataProvider>
                      <AppInitializer>
                        <WorkspaceProvider>
                          <NotificationProvider>
                            <CartProvider>
                              {children}
                            </CartProvider>
                          </NotificationProvider>
                        </WorkspaceProvider>
                      </AppInitializer>
                    </UserDataProvider>
                  </PermissionSync>
                </TourProvider>
              </AuthProvider>
            </DinoAvatarProvider>
          </SidebarProvider>
        </ToastProvider>
      </ThemeProvider>
    </FlagProvider>
  </ErrorBoundary>
));
AppProviders.displayName = 'AppProviders';

// Reusable route wrapper components
const LayoutWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <Layout>{children}</Layout>
));
LayoutWrapper.displayName = 'LayoutWrapper';

const VenueLayoutWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <VenueThemeProvider>
    <Layout>{children}</Layout>
  </VenueThemeProvider>
));
VenueLayoutWrapper.displayName = 'VenueLayoutWrapper';

const ProtectedLayoutWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <Layout>
    <ProtectedRoute>{children}</ProtectedRoute>
  </Layout>
));
ProtectedLayoutWrapper.displayName = 'ProtectedLayoutWrapper';

const AdminRouteWrapper = memo(({ path, children }: { path: string; children: React.ReactNode }) => (
  <Layout>
    <DynamicRoute path={path}>{children}</DynamicRoute>
  </Layout>
));
AdminRouteWrapper.displayName = 'AdminRouteWrapper';

// Lazy component wrapper
const LazyRoute = memo(({ component }: { component: React.LazyExoticComponent<any> }) => {
  const Component = component;
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
});
LazyRoute.displayName = 'LazyRoute';

function App() {
  // Cleanup storage and initialize app on startup
  useEffect(() => {
    let configTimeout: NodeJS.Timeout;
    
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
        <Route path="/" element={<LayoutWrapper><HomePage /></LayoutWrapper>} />
        <Route path="/home" element={<LayoutWrapper><HomePage /></LayoutWrapper>} />
        
        {/* Auth Routes */}
        <Route 
          path="/register" 
          element={<LazyRoute component={LazyComponents.RegistrationPage.component} />} 
        />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Menu Routes */}
        <Route
          path="/menu/:venueId/:tableId"
          element={<VenueLayoutWrapper><MenuPage /></VenueLayoutWrapper>}
        />
        <Route
          path="/checkout/:venueId/:tableId"
          element={<VenueLayoutWrapper><CheckoutPage /></VenueLayoutWrapper>}
        />
        <Route
          path="/order-tracking/:orderId"
          element={<VenueLayoutWrapper><OrderTrackingPage /></VenueLayoutWrapper>}
        />
        <Route
          path="/order/:orderId"
          element={<VenueLayoutWrapper><OrderTrackingPage /></VenueLayoutWrapper>}
        />
        <Route
          path="/order-success/:orderId"
          element={<VenueThemeProvider><OrderSuccessPage /></VenueThemeProvider>}
        />
        
        {/* Protected User Routes */}
        <Route 
          path="/profile" 
          element={<ProtectedLayoutWrapper><UserProfile /></ProtectedLayoutWrapper>} 
        />
        
        {/* Admin Routes - Dynamic permission-based access control */}
        <Route path="/admin" element={
          <AdminRouteWrapper path="/admin">
            <DashboardRouter />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/orders" element={
          <AdminRouteWrapper path="/admin/orders">
            <LazyRoute component={LazyComponents.OrdersManagement.component} />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/menu" element={
          <AdminRouteWrapper path="/admin/menu">
            <LazyRoute component={LazyComponents.MenuManagement.component} />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/tables" element={
          <AdminRouteWrapper path="/admin/tables">
            <LazyRoute component={LazyComponents.TableManagement.component} />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/settings" element={
          <AdminRouteWrapper path="/admin/settings">
            <LazyRoute component={LazyComponents.VenueSettings.component} />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/menu-template" element={
          <AdminRouteWrapper path="/admin/menu-template">
            <LazyRoute component={LazyComponents.MenuTemplateSettings.component} />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/users" element={
          <AdminRouteWrapper path="/admin/users">
            <LazyRoute component={LazyComponents.UserManagement.component} />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/workspace" element={
          <VenueThemeProvider>
            <AdminRouteWrapper path="/admin/workspace">
              <LazyRoute component={LazyComponents.WorkspaceManagement.component} />
            </AdminRouteWrapper>
          </VenueThemeProvider>
        } />
        <Route path="/admin/permissions" element={
          <AdminRouteWrapper path="/admin/permissions">
            <LazyRoute component={LazyComponents.UserPermissionsDashboard.component} />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/coupons" element={
          <AdminRouteWrapper path="/admin/coupons">
            <LazyRoute component={LazyComponents.CouponsManagement.component} />
          </AdminRouteWrapper>
        } />
        <Route path="/admin/code" element={
          <AdminRouteWrapper path="/admin/code">
            <LazyRoute component={LazyComponents.CodeManagement.component} />
          </AdminRouteWrapper>
        } />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppProviders>
  );
}

export default App;
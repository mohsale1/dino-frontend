import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

// Lazy-loaded components for better performance
import { LazyComponents } from './components/lazy';
import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Components
import { ProtectedRoute, RoleProtectedRoute, UserProfile, PermissionSync, DynamicRoute } from './components/auth';
import { Layout, ErrorBoundary, AppInitializer } from './components/common';
import { NotFoundPage } from './pages/public';
import DashboardRouter from './components/dashboards/DashboardRouter';

import { RUNTIME_CONFIG as config } from './config/runtime';
import { StorageCleanup } from './utils/storage';
import { tokenRefreshScheduler } from './utils/tokenRefreshScheduler';
import { apiService } from './utils/api';
import { initializePerformanceMonitoring } from './utils/performance';

// Simple loading fallback for lazy components
const LoadingFallback = () => (
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
);

function App() {
  // Cleanup storage and initialize app on startup
  useEffect(() => {
    try {
      // Clean up legacy data from localStorage
      StorageCleanup.performCleanup();
      
      // Refresh API configuration from runtime config
      if (typeof window !== 'undefined') {
        // Wait a bit for config.js to load
        setTimeout(() => {
          apiService.refreshConfiguration();
        }, 200);
        
        tokenRefreshScheduler.start();
        
        // Initialize performance monitoring
        initializePerformanceMonitoring();
      }
    } catch (error) {      // In production, show a user-friendly error message
      if (config.APP_ENV === 'production') {
        alert('Application initialization failed. Please refresh the page or contact support.');
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <FlagProvider>
        <ThemeProvider>
          <ToastProvider>
            <SidebarProvider defaultCollapsed={false}>
              <DinoAvatarProvider>
                <AuthProvider>
                  <TourProvider>
                    <PermissionSync autoRefreshInterval={0} showSyncStatus={false}>
                      <UserDataProvider>
                        <AppInitializer>
                          <WorkspaceProvider>
                            <NotificationProvider>
                            {/* Temporarily disabled WebSocket to prevent connection loops */}
                            {/* <WebSocketProvider> */}
                            <CartProvider>
              <Routes>
                {/* Routes with Layout */}
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/home" element={<Layout><HomePage /></Layout>} />

                <Route
                  path="/register"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(LazyComponents.RegistrationPage.component)}
                    </Suspense>
                  } />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/menu/:venueId/:tableId"
                  element={<VenueThemeProvider><Layout><MenuPage /></Layout></VenueThemeProvider>} />
                <Route
                  path="/checkout/:venueId/:tableId"
                  element={<VenueThemeProvider><Layout><CheckoutPage /></Layout></VenueThemeProvider>} />
                <Route
                  path="/order-tracking/:orderId"
                  element={<VenueThemeProvider><Layout><OrderTrackingPage /></Layout></VenueThemeProvider>} />
                <Route
                  path="/order/:orderId"
                  element={<VenueThemeProvider><Layout><OrderTrackingPage /></Layout></VenueThemeProvider>} />
                <Route
                  path="/order-success/:orderId"
                  element={<VenueThemeProvider><OrderSuccessPage /></VenueThemeProvider>} />

                
                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <Layout>
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  </Layout>
                } />
                
                {/* Admin Routes - Dynamic permission-based access control */}
                <Route path="/admin" element={
                  <Layout>
                    <DynamicRoute path="/admin">
                      <DashboardRouter />
                    </DynamicRoute>
                  </Layout>
                } />
                <Route path="/admin/orders" element={
                  <Layout>
                    <DynamicRoute path="/admin/orders">
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.OrdersManagement.component)}
                      </Suspense>
                    </DynamicRoute>
                  </Layout>
                } />
                <Route path="/admin/menu" element={
                  <Layout>
                    <DynamicRoute path="/admin/menu">
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.MenuManagement.component)}
                      </Suspense>
                    </DynamicRoute>
                  </Layout>
                } />
                <Route path="/admin/tables" element={
                  <Layout>
                    <DynamicRoute path="/admin/tables">
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.TableManagement.component)}
                      </Suspense>
                    </DynamicRoute>
                  </Layout>
                } />
                <Route path="/admin/settings" element={
                  <Layout>
                    <DynamicRoute path="/admin/settings">
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.VenueSettings.component)}
                      </Suspense>
                    </DynamicRoute>
                  </Layout>
                } />
                <Route path="/admin/menu-template" element={
                  <Layout>
                    <DynamicRoute path="/admin/menu-template">
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.MenuTemplateSettings.component)}
                      </Suspense>
                    </DynamicRoute>
                  </Layout>
                } />
                <Route path="/admin/users" element={
                  <Layout>
                    <DynamicRoute path="/admin/users">
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.UserManagement.component)}
                      </Suspense>
                    </DynamicRoute>
                  </Layout>
                } />
                <Route path="/admin/workspace" element={
                  <VenueThemeProvider>
                    <Layout>
                      <DynamicRoute path="/admin/workspace">
                        <Suspense fallback={<LoadingFallback />}>
                          {React.createElement(LazyComponents.WorkspaceManagement.component)}
                        </Suspense>
                      </DynamicRoute>
                    </Layout>
                  </VenueThemeProvider>
                } />
                <Route path="/admin/permissions" element={
                  <Layout>
                    <DynamicRoute path="/admin/permissions">
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.UserPermissionsDashboard.component)}
                      </Suspense>
                    </DynamicRoute>
                  </Layout>
                } />
                <Route path="/admin/coupons" element={
                  <Layout>
                    <DynamicRoute path="/admin/coupons">
                      <Suspense fallback={<LoadingFallback />}>
                        {React.createElement(LazyComponents.CouponsManagement.component)}
                      </Suspense>
                    </DynamicRoute>
                  </Layout>
                } />
                
                {/* Standalone 404 Page - No Layout */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
                            </CartProvider>
                            {/* </WebSocketProvider> */}
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
  );
}

export default App;
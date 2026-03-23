/**
 * Orders Management Page - Clean Professional Design
 * 
 * Track and manage all customer orders in real-time
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import OrderStats from './Orders/OrderStats';
import OrderFilters from './Orders/OrderFilters';
import OrderTabs from './Orders/OrderTabs';
import type { Order } from '../../features/orders/types';

const OrdersManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Mock data - replace with actual API calls
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      workspaceId: 'ws1',
      customerName: 'John Doe',
      items: [
        {
          id: 'item1',
          catalogItemId: 'cat1',
          name: 'Premium Widget',
          quantity: 2,
          unitPrice: 99.99,
          totalPrice: 199.98,
        },
        {
          id: 'item2',
          catalogItemId: 'cat2',
          name: 'Standard Widget',
          quantity: 1,
          unitPrice: 49.99,
          totalPrice: 49.99,
        },
      ],
      subtotal: 249.97,
      tax: 25.00,
      discount: 0,
      total: 274.97,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      workspaceId: 'ws1',
      customerName: 'Jane Smith',
      items: [
        {
          id: 'item3',
          catalogItemId: 'cat3',
          name: 'Deluxe Widget',
          quantity: 1,
          unitPrice: 149.99,
          totalPrice: 149.99,
        },
      ],
      subtotal: 149.99,
      tax: 15.00,
      discount: 10.00,
      total: 154.99,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      workspaceId: 'ws1',
      customerName: 'Bob Johnson',
      items: [
        {
          id: 'item4',
          catalogItemId: 'cat4',
          name: 'Basic Widget',
          quantity: 3,
          unitPrice: 29.99,
          totalPrice: 89.97,
        },
      ],
      subtotal: 89.97,
      tax: 9.00,
      discount: 0,
      total: 98.97,
      status: 'preparing',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  const stats = {
    totalOrders: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const handleRefresh = () => {
    setSnackbar({
      open: true,
      message: 'Orders refreshed successfully',
      severity: 'success',
    });
  };

  const handleOrderClick = (orderId: string) => {
    console.log('Order clicked:', orderId);
    // TODO: Open order details dialog or navigate to order details page
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.125rem' },
                }}
              >
                Orders Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6b7280',
                  fontSize: '0.9375rem',
                }}
              >
                Track and manage all customer orders in real-time
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                fontWeight: 600,
                borderColor: '#e5e7eb',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb',
                },
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Statistics */}
          <OrderStats stats={stats} />
        </Box>

        {/* Filters */}
        <OrderFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterDate={filterDate}
          onDateChange={setFilterDate}
        />

        {/* Tabs */}
        <OrderTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orders={orders}
          searchQuery={searchQuery}
          filterDate={filterDate}
          onOrderClick={handleOrderClick}
        />
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 1.5,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagementPage;
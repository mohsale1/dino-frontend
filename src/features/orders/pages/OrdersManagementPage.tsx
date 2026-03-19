import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper,
  TextField,
  InputAdornment 
} from '@mui/material';
import { 
  ShoppingCart, 
  CheckCircle, 
  Schedule, 
  Cancel,
  Search 
} from '@mui/icons-material';
import { OrderCard } from '../components';
import type { Order } from '../types';
import { formatCurrency } from '../../../utils/data';

// Simple StatCard component
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, icon, color = 'primary' }) => (
  <Paper sx={{ p: 3 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </Box>
      <Box sx={{ color: `${color}.main` }}>{icon}</Box>
    </Box>
  </Paper>
);

export const OrdersManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const stats = {
    totalOrders: 1234,
    pending: 45,
    completed: 1150,
    cancelled: 39,
  };

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
      ],
      subtotal: 199.98,
      tax: 20.00,
      discount: 0,
      total: 219.98,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Orders Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        View and manage customer orders
      </Typography>

      {/* Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={<Cancel />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Orders Grid */}
      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} sm={6} md={4} key={order.id}>
            <OrderCard
              order={order}
              onClick={() => console.log('Order clicked:', order.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OrdersManagementPage;
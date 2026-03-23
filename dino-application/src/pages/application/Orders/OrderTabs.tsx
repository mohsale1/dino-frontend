/**
 * OrderTabs Component - Clean Professional Design
 * 
 * Tabs for different order statuses
 */

import React from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import OrderCard from './OrderCard';
import type { Order } from '../../../features/orders/types';

interface OrderTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  orders: Order[];
  searchQuery: string;
  filterDate: string;
  onOrderClick: (orderId: string) => void;
}

const OrderTabs: React.FC<OrderTabsProps> = ({
  activeTab,
  onTabChange,
  orders,
  searchQuery,
  filterDate,
  onOrderClick,
}) => {
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      order.status === activeTab;

    // TODO: Implement date filtering based on filterDate
    
    return matchesSearch && matchesTab;
  });

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ borderBottom: '1px solid #e5e7eb' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#1a1a1a',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1a1a1a',
              height: 3,
            },
          }}
        >
          <Tab label="All Orders" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Preparing" value="preparing" />
          <Tab label="Completed" value="completed" />
          <Tab label="Cancelled" value="cancelled" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {filteredOrders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{ color: '#6b7280', fontSize: '0.9375rem' }}>
              No orders found
            </Box>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredOrders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order.id}>
                <OrderCard
                  order={order}
                  onClick={() => onOrderClick(order.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default OrderTabs;
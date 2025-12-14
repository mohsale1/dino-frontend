import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Stack,
  Divider,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  Badge,
  Skeleton,
  useTheme,
  useMediaQuery,
  keyframes,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Restaurant,
  Schedule,
  CheckCircle,
  LocalShipping,
  Assignment,
  Refresh,
  Visibility,
  Search,
  Timer,
  TableRestaurant,
  Kitchen,
  Notifications,
  AccessTime,
  Store,
  CachedOutlined,
  ViewModule,
  ViewKanban,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PERMISSIONS } from '../../types/auth';
import { orderService, Order, OrderStatus, PaymentStatus, PaymentMethod } from '../../services/business';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { useOrderFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';
import DateRangePicker, { DateRange } from '../../components/common/DateRangePicker';
import PaginationControl, { usePagination } from '../../components/common/PaginationControl';
import { KanbanBoard } from '../../components/orders';

// Animation for refresh icon
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Pulse animation for urgent orders
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
`;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const OrdersManagement: React.FC = () => {
  const { hasPermission, isOperator, isAdmin } = useAuth();
  const { 
    userData, 
    loading: userDataLoading, 
    getVenue, 
    getVenueDisplayName,
    refreshUserData 
  } = useUserData();
  const orderFlags = useOrderFlags();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // State
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'tab' | 'kanban'>('tab');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date Range State - Default to today
  const getTodayRange = (): DateRange => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return { startDate: dateStr, endDate: dateStr };
  };

  const [dateRange, setDateRange] = useState<DateRange>(getTodayRange());

  // Pagination
  const { pagination, updateTotalItems, setPage, setPageSize } = usePagination(20);

  // Helper function to check if order is from today
  const isToday = (dateString: string) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  };

  // Load orders from API with date filtering
  const loadOrders = async () => {
    const venue = getVenue();
    
    if (!venue?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call API with date range filter
      const ordersData = await orderService.getVenueOrders(venue.id, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setOrders(ordersData);
      updateTotalItems(ordersData.length);
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Load orders when date range or pagination changes
  useEffect(() => {
    loadOrders();
  }, [userData?.venue?.id, dateRange, pagination.page, pagination.pageSize]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const refreshTimer = setInterval(loadOrders, 30000);
    return () => clearInterval(refreshTimer);
  }, [dateRange, pagination.page, pagination.pageSize]);

  // Filter orders based on search and status (client-side for current page)
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.table_id && order.table_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.items.some(item => 
          item.menu_item_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getActiveOrders = () => {
    return filteredOrders.filter(order => 
      order.status === 'pending' || 
      order.status === 'confirmed' || 
      order.status === 'preparing' || 
      order.status === 'ready'
    );
  };

  const getServedOrders = () => {
    return filteredOrders.filter(order => order.status === 'served' || order.status === 'delivered');
  };

  const getUrgentOrders = () => {
    const now = new Date();
    return getActiveOrders().filter(order => {
      const orderTime = new Date(order.createdAt);
      const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
      return diffInMinutes > 30;
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'preparing': '#f97316',
      'ready': '#10b981',
      'out_for_delivery': '#8b5cf6',
      'delivered': '#059669',
      'served': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Assignment />;
      case 'confirmed': return <CheckCircle />;
      case 'preparing': return <Restaurant />;
      case 'ready': return <CheckCircle />;
      case 'served': return <LocalShipping />;
      case 'delivered': return <LocalShipping />;
      case 'cancelled': return <Visibility />;
      default: return <Schedule />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTableNumber = (order: Order) => {
    if (order.table_number) {
      return order.table_number;
    }
    if (order.table_id) {
      return order.table_id.replace(/^table-/, 'T-').replace(/^dt-/, 'DT-');
    }
    return 'N/A';
  };

  const getTrimmedOrderId = (orderId: string) => {
    return orderId.substring(0, 8);
  };

  const getTimeSinceOrder = (orderTime: string) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    if (hours < 24) return minutes > 0 ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const isOrderUrgent = (orderTime: string) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    return diffInMinutes > 30;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSnackbar({ 
        open: true, 
        message: `Order #${getTrimmedOrderId(orderId)} status updated to ${orderService.formatOrderStatus(newStatus)}`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to update order status. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleRefreshOrders = async () => {
    await loadOrders();
    setSnackbar({ 
      open: true, 
      message: 'Orders refreshed successfully', 
      severity: 'success' 
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOpenOrderDialog(true);
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    setPage(1); // Reset to first page when changing date range
  };

  // Compact order card for active and served orders
  const renderCompactOrderCard = (order: Order) => {
    const isUrgent = isOrderUrgent(order.createdAt);
    const isServed = order.status === 'served' || order.status === 'delivered';
    
    return (
      <Card 
        key={order.id}
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: isUrgent ? 'error.light' : 'divider',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: isUrgent ? `${pulse} 2s infinite` : 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': { 
            borderColor: 'primary.main',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: `linear-gradient(90deg, ${getStatusColor(order.status)}, ${getStatusColor(order.status)}dd)`,
          }
        }}
      >
        <CardContent sx={{ 
          p: 2.5, 
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: 1
        }}>
          {/* Header Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                #{getTrimmedOrderId(order.id)}
              </Typography>
              {isUrgent && !isServed && (
                <Chip 
                  label="URGENT" 
                  size="small" 
                  color="error" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    animation: `${pulse} 2s infinite`
                  }} 
                />
              )}
            </Box>
            <Chip 
              icon={getStatusIcon(order.status)}
              label={orderService.formatOrderStatus(order.status)}
              size="small"
              sx={{ 
                backgroundColor: getStatusColor(order.status),
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
                fontSize: '0.75rem',
                height: 26,
                fontWeight: 600,
                borderRadius: 2,
                px: 1
              }}
            />
          </Stack>

          {/* Table and Time Info */}
          <Box 
            sx={{ 
              mb: 2, 
              p: 1.5, 
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <TableRestaurant fontSize="small" />
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
                    Table Number
                  </Typography>
                  <Typography variant="body1" fontWeight="700" color="primary.main">
                    {getTableNumber(order)}
                  </Typography>
                </Box>
              </Stack>
              
              <Divider />
              
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AccessTime fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    {formatTime(order.createdAt)}
                  </Typography>
                </Stack>
                <Typography 
                  variant="caption" 
                  color={isUrgent ? "error.main" : "text.secondary"}
                  fontWeight={isUrgent ? 700 : 500}
                  fontSize="0.75rem"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: isUrgent ? 'error.lighter' : 'transparent'
                  }}
                >
                  {getTimeSinceOrder(order.createdAt)}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Items Summary */}
          <Box mb={2} flex={1}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight="700" 
              display="block" 
              mb={1}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Order Items ({order.items.length})
            </Typography>
            <Stack spacing={0.75}>
              {order.items.slice(0, 3).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1.5,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Chip
                    label={item.quantity}
                    size="small"
                    sx={{
                      minWidth: 32,
                      height: 24,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    fontWeight="500"
                    fontSize="0.85rem"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}
                  >
                    {item.menu_item_name}
                  </Typography>
                </Box>
              ))}
              {order.items.length > 3 && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleViewOrder(order)}
                  sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    justifyContent: 'flex-start',
                    pl: 1,
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.lighter'
                    }
                  }}
                >
                  +{order.items.length - 3} more items
                </Button>
              )}
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="column" spacing={1.5} sx={{ mt: 'auto' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleViewOrder(order)}
              startIcon={<Visibility />}
              sx={{ 
                fontSize: '0.875rem', 
                py: 1, 
                borderRadius: 2,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                }
              }}
            >
              View Details
            </Button>
            {!isServed && (
              <FormControl fullWidth size="small">
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                  size="small"
                  disabled={!hasPermission(PERMISSIONS.ORDERS_UPDATE)}
                  sx={{
                    fontSize: '0.875rem',
                    borderRadius: 2,
                    fontWeight: 600,
                    '& .MuiSelect-select': {
                      py: 1,
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: 2,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover': {
                      boxShadow: `0 4px 12px ${getStatusColor(order.status)}40`,
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    }
                  }}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="preparing">Preparing</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="served">Served</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        minHeight: 'auto',
        height: 'auto',
        backgroundColor: '#f8f9fa',
        padding: 0,
        margin: 0,
        width: '100%',
        overflow: 'visible',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, md: 3 },
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Kitchen sx={{ fontSize: 26, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  {isOperator() ? 'Kitchen Dashboard' : 'Orders Management'}
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  mb: 1,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                {isOperator() 
                  ? `Order management for ${getVenueDisplayName()}` 
                  : `Order management for ${getVenueDisplayName()}`
                }
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Store sx={{ fontSize: 14, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                <Typography variant="body2" fontWeight="500" color="text.primary">
                  {getVenueDisplayName()}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'row', sm: 'row' },
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    px: { xs: 1.5, sm: 2 },
                    py: 0.75,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  },
                }}
              >
                <ToggleButton value="tab" aria-label="tab view">
                  <ViewModule sx={{ fontSize: { xs: 16, sm: 18 }, mr: { xs: 0.5, sm: 1 } }} />
                  {!isMobile && 'Tab View'}
                </ToggleButton>
                <ToggleButton value="kanban" aria-label="kanban view">
                  <ViewKanban sx={{ fontSize: { xs: 16, sm: 18 }, mr: { xs: 0.5, sm: 1 } }} />
                  {!isMobile && 'Kanban'}
                </ToggleButton>
              </ToggleButtonGroup>

              {getUrgentOrders().length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Notifications />}
                  size="medium"
                  sx={{
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    color: 'error.main',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    display: { xs: 'none', sm: 'flex' },
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.2)',
                      borderColor: 'error.main',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {getUrgentOrders().length} Urgent
                </Button>
              )}

              <IconButton
                onClick={handleRefreshOrders}
                disabled={loading}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title={loading ? 'Refreshing...' : 'Refresh orders'}
              >
                {loading ? (
                  <CachedOutlined sx={{ animation: `${spin} 1s linear infinite` }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ width: '100%', padding: 0, margin: 0 }}>
        {/* Error Alert */}
        {error && (
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 1 }}>
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Date Range Picker */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2 }}>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            showPresets={true}
            label="Filter Orders by Date"
          />
        </Box>

        {/* Kitchen Statistics */}
        <FlagGate flag="orders.showOrderStats">
          <Box sx={{ mb: 4, px: { xs: 2, sm: 3 }, py: 2 }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[
                { 
                  label: 'Total Orders', 
                  value: orders.length, 
                  color: '#2196F3', 
                  icon: <Assignment />,
                  description: 'Selected period'
                },
                { 
                  label: 'Active Orders', 
                  value: getActiveOrders().length, 
                  color: '#FF9800', 
                  icon: <Restaurant />,
                  description: 'Currently processing'
                },
                { 
                  label: 'Ready to Serve', 
                  value: orders.filter(o => o.status === 'ready').length, 
                  color: '#4CAF50', 
                  icon: <CheckCircle />,
                  description: 'Awaiting pickup'
                },
                { 
                  label: 'Urgent Orders', 
                  value: getUrgentOrders().length, 
                  color: '#F44336', 
                  icon: <Timer />,
                  description: 'Over 30 minutes'
                },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Card
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 2,
                      backgroundColor: `${stat.color}08`,
                      border: `1px solid ${stat.color}33`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${stat.color}33`,
                        backgroundColor: `${stat.color}12`,
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          borderRadius: 2,
                          backgroundColor: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {React.cloneElement(stat.icon, { 
                          fontSize: isMobile ? 'medium' : 'large' 
                        })}
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant={isMobile ? "h6" : "h4"} 
                          fontWeight="700" 
                          color="text.primary"
                          sx={{ 
                            fontSize: { xs: '1.25rem', sm: '2rem' },
                            lineHeight: 1.2,
                            mb: 0.5
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          fontWeight="600"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </FlagGate>

        {/* Enhanced Controls - Only show in Tab View */}
        {viewMode === 'tab' && (
          <FlagGate flag="orders.showOrderFilters">
            <Paper 
              sx={{ 
                p: 3, 
                mb: 4, 
                border: '1px solid', 
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                mx: { xs: 3, sm: 4 }
              }}
            >
              <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={isMobile ? "Search orders..." : "Search orders by ID, table, or items..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size={isMobile ? "medium" : "medium"}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Filter by Status"
                      size={isMobile ? "medium" : "medium"}
                    >
                      <MenuItem value="all">All Orders</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="preparing">Preparing</MenuItem>
                      <MenuItem value="ready">Ready</MenuItem>
                      <MenuItem value="served">Served</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </FlagGate>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' ? (
          <Box sx={{ px: { xs: 2, sm: 3 }, mb: 4 }}>
            <KanbanBoard
              orders={filteredOrders}
              onStatusUpdate={handleStatusUpdate}
              onViewOrder={handleViewOrder}
            />
          </Box>
        ) : (
          /* Tab View */
          <Paper sx={{ 
            border: '1px solid', 
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            mx: { xs: 3, sm: 4 }
          }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 48 },
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                fontWeight: 500,
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: 160 },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab 
              icon={
                <Badge badgeContent={getActiveOrders().length} color="warning">
                  <Restaurant fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              } 
              label={isMobile ? "Active" : "Active Orders"}
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab 
              icon={
                <Badge badgeContent={getServedOrders().length} color="success">
                  <CheckCircle fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              } 
              label={isMobile ? "Served" : "Served Orders"}
              iconPosition={isMobile ? "top" : "start"}
            />
          </Tabs>

          {/* Active Orders Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {getActiveOrders().length === 0 ? (
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '2px dashed',
                    borderColor: 'primary.light',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    textAlign: 'center',
                    py: { xs: 4, sm: 6 },
                    px: { xs: 2, sm: 3 },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      border: '2px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Restaurant sx={{ fontSize: 26, color: '#1565c0' }} />
                  </Box>
                  
                  <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
                    No Active Orders
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
                    All orders have been served or there are no new orders in the selected date range.
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 2 }}>
                  {getActiveOrders().map(order => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                      {renderCompactOrderCard(order)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>

          {/* Served Orders Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {getServedOrders().length === 0 ? (
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '2px dashed',
                    borderColor: 'success.light',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    textAlign: 'center',
                    py: { xs: 4, sm: 6 },
                    px: { xs: 2, sm: 3 },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      border: '2px solid',
                      borderColor: 'success.main',
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 26, color: '#2e7d32' }} />
                  </Box>
                  
                  <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
                    No Served Orders
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
                    Completed orders for the selected date range will appear here.
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 2 }}>
                  {getServedOrders().map(order => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                      {renderCompactOrderCard(order)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <PaginationControl
                  pagination={pagination}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  variant={isMobile ? 'compact' : 'default'}
                />
              </Box>
            )}
          </Paper>
        )}

        {/* Bill-Style Order Details Dialog */}
        <Dialog 
          open={openOrderDialog} 
          onClose={() => setOpenOrderDialog(false)} 
          maxWidth="sm" 
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              m: isMobile ? 0 : 2,
              maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)',
              borderRadius: isMobile ? 0 : 2,
            }
          }}
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ 
                pb: 2, 
                borderBottom: '2px dashed',
                borderColor: 'divider',
                backgroundColor: 'grey.50'
              }}>
                <Box>
                  <Typography variant="h5" fontWeight="700" gutterBottom>
                    {getVenueDisplayName()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Order Details
                  </Typography>
                </Box>
              </DialogTitle>
              
              <DialogContent sx={{ p: 3, backgroundColor: 'white' }}>
                {/* Bill Header */}
                <Box sx={{ mb: 3, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                    <Typography variant="body2" fontWeight="600">#{getTrimmedOrderId(selectedOrder.id)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Table Number:</Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main" fontSize="1rem">
                      {getTableNumber(selectedOrder)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Date:</Typography>
                    <Typography variant="body2" fontWeight="600">{formatDate(selectedOrder.createdAt)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Time:</Typography>
                    <Typography variant="body2" fontWeight="600">{formatTime(selectedOrder.createdAt)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Chip 
                      label={orderService.formatOrderStatus(selectedOrder.status)}
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(selectedOrder.status),
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  </Stack>
                </Box>

                {/* Items Table */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="700" mb={2}>
                    Order Items
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Item Name</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow 
                            key={index}
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': { backgroundColor: 'grey.50' }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="600">
                                {item.menu_item_name}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={item.quantity}
                                size="small"
                                color="primary"
                                sx={{ 
                                  fontWeight: 700,
                                  minWidth: 40
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Thank you for your order!
                  </Typography>
                </Box>
              </DialogContent>
              
              <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1} width="100%" justifyContent="space-between" alignItems="center">
                  <Button
                    onClick={() => setOpenOrderDialog(false)}
                    variant="outlined"
                    color="inherit"
                    size="medium"
                  >
                    Close
                  </Button>
                  {selectedOrder.status !== 'served' && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as OrderStatus)}
                        size="small"
                        disabled={!hasPermission(PERMISSIONS.ORDERS_UPDATE)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="preparing">Preparing</MenuItem>
                        <MenuItem value="ready">Ready</MenuItem>
                        <MenuItem value="served">Served</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Stack>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default OrdersManagement;
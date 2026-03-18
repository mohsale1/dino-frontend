import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TableRestaurant,
  AccessTime,
  Visibility,
  Restaurant,
  Timer,
} from '@mui/icons-material';
import { Order } from '../../services/business';

interface KanbanOrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  isDragging?: boolean;
}

const KanbanOrderCard: React.FC<KanbanOrderCardProps> = ({
  order,
  onViewDetails,
  isDragging = false,
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'preparing': '#f97316',
      'ready': '#10b981',
      'served': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSinceOrder = (orderTime: string) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
  };

  const isOrderUrgent = (orderTime: string) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    return diffInMinutes > 30;
  };

  const getTrimmedOrderId = (orderId: string) => {
    return orderId.substring(0, 8);
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

  const isUrgent = isOrderUrgent(order.createdAt);

  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        border: `2px solid ${isUrgent ? theme.palette.error.light : 'transparent'}`,
        borderRadius: 1,
        backgroundColor: 'background.paper',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="700" color="text.primary">
              #{getTrimmedOrderId(order.id)}
            </Typography>
            {isUrgent && (
              <Chip
                label="URGENT"
                size="small"
                color="error"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  mt: 0.5,
                }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => onViewDetails(order)}
            sx={{
              p: 0.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Visibility sx={{ fontSize: 12 }} />
          </IconButton>
        </Box>

        {/* Table Info */}
        <Box
          sx={{
            mb: 1,
            p: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: 1,
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <TableRestaurant sx={{ fontSize: 12 }} />
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, fontSize: '0.7rem' }}>
                Table
              </Typography>
              <Typography variant="body2" fontWeight="700" color="primary.main" sx={{ fontSize: '0.8rem' }}>
                {getTableNumber(order)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Time Info */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {formatTime(order.createdAt)}
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            color={isUrgent ? 'error.main' : 'text.secondary'}
            fontWeight={isUrgent ? 700 : 500}
            sx={{
              fontSize: '0.7rem',
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              backgroundColor: isUrgent ? alpha(theme.palette.error.main, 0.1) : 'transparent',
            }}
          >
            {getTimeSinceOrder(order.createdAt)}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Items Summary */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="700"
            display="block"
            sx={{ mb: 0.5, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Items ({order.items.length})
          </Typography>
          <Stack spacing={0.5}>
            {order.items.slice(0, 2).map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  p: 0.75,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.grey[500], 0.05),
                }}
              >
                <Chip
                  label={item.quantity}
                  size="small"
                  sx={{
                    minWidth: 24,
                    height: 20,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.primary"
                  fontWeight="500"
                  sx={{
                    fontSize: '0.7rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {item.menu_item_name}
                </Typography>
              </Box>
            ))}
            {order.items.length > 2 && (
              <Typography
                variant="caption"
                color="primary.main"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  pl: 0.75,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => onViewDetails(order)}
              >
                +{order.items.length - 2} more items
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Preparation Time Indicator */}
        {order.status === 'preparing' && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <Timer sx={{ fontSize: 12, color: 'warning.main' }} />
            <Typography variant="caption" color="warning.main" fontWeight="600" sx={{ fontSize: '0.7rem' }}>
              In Kitchen
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KanbanOrderCard;
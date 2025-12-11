import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Badge,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Restaurant,
  DoneAll,
  LocalShipping,
} from '@mui/icons-material';
import { Order, OrderStatus } from '../../services/business';
import KanbanOrderCard from './KanbanOrderCard';

interface KanbanBoardProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
  onViewOrder: (order: Order) => void;
}

interface KanbanColumn {
  id: OrderStatus;
  title: string;
  icon: React.ReactElement;
  color: string;
  bgColor: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orders,
  onStatusUpdate,
  onViewOrder,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<OrderStatus | null>(null);

  const columns: KanbanColumn[] = [
    {
      id: 'pending',
      title: 'Pending',
      icon: <Assignment />,
      color: '#f59e0b',
      bgColor: alpha('#f59e0b', 0.1),
    },
    {
      id: 'confirmed',
      title: 'Confirmed',
      icon: <CheckCircle />,
      color: '#3b82f6',
      bgColor: alpha('#3b82f6', 0.1),
    },
    {
      id: 'preparing',
      title: 'Preparing',
      icon: <Restaurant />,
      color: '#f97316',
      bgColor: alpha('#f97316', 0.1),
    },
    {
      id: 'ready',
      title: 'Ready',
      icon: <DoneAll />,
      color: '#10b981',
      bgColor: alpha('#10b981', 0.1),
    },
    {
      id: 'served',
      title: 'Served',
      icon: <LocalShipping />,
      color: '#059669',
      bgColor: alpha('#059669', 0.1),
    },
  ];

  // Sort orders by creation time (FIFO - oldest first)
  const sortOrdersByFIFO = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  // Get orders for a specific column
  const getColumnOrders = (status: OrderStatus) => {
    const filteredOrders = orders.filter(order => order.status === status);
    return sortOrdersByFIFO(filteredOrders);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, order: Order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent, columnId: OrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedOrder && draggedOrder.status !== targetStatus) {
      onStatusUpdate(draggedOrder.id, targetStatus);
    }

    setDraggedOrder(null);
  };

  const handleDragEnd = () => {
    setDraggedOrder(null);
    setDragOverColumn(null);
  };

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        pb: 2,
        // Custom scrollbar
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'grey.100',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'grey.400',
          borderRadius: 4,
          '&:hover': {
            backgroundColor: 'grey.500',
          },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          minWidth: isMobile ? '1200px' : 'auto',
          width: isMobile ? 'max-content' : '100%',
        }}
      >
        {columns.map((column) => {
          const columnOrders = getColumnOrders(column.id);
          const isActive = dragOverColumn === column.id;

          return (
            <Paper
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              sx={{
                flex: 1,
                minWidth: isMobile ? 280 : 240,
                maxWidth: isMobile ? 280 : 'none',
                p: 2,
                backgroundColor: isActive ? alpha(column.color, 0.05) : 'background.paper',
                border: `2px solid ${isActive ? column.color : 'transparent'}`,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                height: 'fit-content',
                minHeight: 400,
              }}
            >
              {/* Column Header */}
              <Box
                sx={{
                  mb: 2,
                  pb: 1.5,
                  borderBottom: `2px solid ${column.color}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      backgroundColor: column.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {React.cloneElement(column.icon, { sx: { fontSize: 18 } })}
                  </Box>
                  <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                    {column.title}
                  </Typography>
                </Stack>

                <Badge
                  badgeContent={columnOrders.length}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: column.color,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 20,
                      minWidth: 20,
                      borderRadius: 1,
                    },
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight="600">
                    {columnOrders.length} {columnOrders.length === 1 ? 'order' : 'orders'}
                  </Typography>
                </Badge>
              </Box>

              {/* Orders List */}
              <Box
                sx={{
                  minHeight: 300,
                  maxHeight: 600,
                  overflowY: 'auto',
                  pr: 0.5,
                  // Custom scrollbar
                  '&::-webkit-scrollbar': {
                    width: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.100',
                    borderRadius: 3,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: 3,
                    '&:hover': {
                      backgroundColor: 'grey.500',
                    },
                  },
                }}
              >
                {columnOrders.length === 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 6,
                      px: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: column.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {React.cloneElement(column.icon, {
                        sx: { fontSize: 32, color: column.color },
                      })}
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      No {column.title.toLowerCase()} orders
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Drag orders here to update status
                    </Typography>
                  </Box>
                ) : (
                  columnOrders.map((order) => (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order)}
                      onDragEnd={handleDragEnd}
                    >
                      <KanbanOrderCard
                        order={order}
                        onViewDetails={onViewOrder}
                        isDragging={draggedOrder?.id === order.id}
                      />
                    </div>
                  ))
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default KanbanBoard;
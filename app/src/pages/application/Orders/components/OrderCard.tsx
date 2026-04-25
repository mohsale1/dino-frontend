import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  TableRestaurant,
  AccessTime,
  CheckCircle,
  DoneAll,
  DeliveryDining,
  TaskAlt,
  Cancel,
  ChevronRight,
  Whatshot,
} from '@mui/icons-material';
import { Order, STATUS_FLOW, CANCELLABLE, timeAgo, formatINR } from '../orders.types';
import StatusBadge from './StatusBadge';

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  actionLoading: string | null;
  onOrderClick: (order: Order) => void;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onCancelOrder: (order: Order) => void;
}

const FLOW_ICONS: Partial<Record<Order['status'], React.ReactElement>> = {
  pending:   <CheckCircle sx={{ fontSize: 14 }} />,
  confirmed: <Whatshot sx={{ fontSize: 14 }} />,
  preparing: <DoneAll sx={{ fontSize: 14 }} />,
  ready:     <DeliveryDining sx={{ fontSize: 14 }} />,
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isSelected,
  actionLoading,
  onOrderClick,
  onStatusUpdate,
  onCancelOrder,
}) => {
  const flow = STATUS_FLOW[order.status];
  const canCancel = CANCELLABLE.includes(order.status);
  const isActing = actionLoading === order.id;
  const hasActions = !!(flow || canCancel);

  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (flow) onStatusUpdate(order.id, flow.next);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancelOrder(order);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOrderClick(order);
  };

  return (
    <Box
      onClick={() => onOrderClick(order)}
      sx={{
        bgcolor: '#ffffff',
        border: isSelected ? '2px solid #2563EB' : '1px solid #e2e8f0',
        borderRadius: 2.5,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none',
        transition: 'all 0.15s ease',
        '&:hover': {
          boxShadow: isSelected
            ? '0 0 0 3px rgba(37,99,235,0.08)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* TOP BAR */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#1C1C1E',
            letterSpacing: 0,
          }}
        >
          #{order.order_number}
        </Typography>
        <StatusBadge status={order.status} size="sm" />
      </Box>

      {/* BODY */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* Customer row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Person sx={{ fontSize: 14, color: '#94a3b8', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: '0.82rem',
              color: '#374151',
              fontWeight: 500,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {order.customer_name?.trim() || 'Walk-in'}
          </Typography>
        </Box>

        {/* Table + time row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <TableRestaurant sx={{ fontSize: 14, color: '#94a3b8', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.3 }}>
            {order.table_number ? `Table ${order.table_number}` : '\u2014'}
          </Typography>
          <Box
            sx={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              bgcolor: '#cbd5e1',
              flexShrink: 0,
              mx: 0.25,
            }}
          />
          <AccessTime sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
            {timeAgo(order.createdAt)}
          </Typography>
        </Box>

        {/* Items + amount row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${order.items_count ?? 0} item${(order.items_count ?? 0) !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              bgcolor: '#f1f5f9',
              color: '#475569',
              fontSize: '0.7rem',
              fontWeight: 600,
              height: 20,
              borderRadius: 1,
              '& .MuiChip-label': { px: 1 },
            }}
          />
          <Box sx={{ flex: 1 }} />
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1rem',
              color: '#1C1C1E',
              lineHeight: 1,
            }}
          >
            {formatINR(order.total)}
          </Typography>
        </Box>
      </Box>

      {/* ACTION FOOTER */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {hasActions ? (
          <>
            {flow && (
              <Button
                size="small"
                variant="contained"
                disabled={isActing}
                onClick={handlePrimaryAction}
                startIcon={
                  isActing ? (
                    <CircularProgress size={14} sx={{ color: 'inherit' }} />
                  ) : (
                    FLOW_ICONS[order.status]
                  )
                }
                sx={{
                  flex: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  bgcolor: flow.btnBg,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: flow.btnBg,
                    boxShadow: 'none',
                    filter: 'brightness(0.92)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: flow.btnBg,
                    color: '#ffffff',
                    opacity: 0.7,
                  },
                }}
              >
                {!isActing && flow.label}
              </Button>
            )}

            {canCancel && (
              <Button
                size="small"
                variant="outlined"
                disabled={isActing}
                onClick={handleCancel}
                startIcon={
                  isActing && !flow ? (
                    <CircularProgress size={14} sx={{ color: 'inherit' }} />
                  ) : (
                    <Cancel sx={{ fontSize: 14 }} />
                  )
                }
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  borderColor: '#e0e0e0',
                  color: '#94a3b8',
                  '&:hover': {
                    borderColor: '#f43f5e',
                    color: '#f43f5e',
                    bgcolor: '#fff1f2',
                  },
                  '&.Mui-disabled': {
                    borderColor: '#e0e0e0',
                    color: '#94a3b8',
                    opacity: 0.6,
                  },
                }}
              >
                Cancel
              </Button>
            )}
          </>
        ) : (
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              flex: 1,
              lineHeight: 1.3,
            }}
          >
            {order.status === 'completed' || order.status === 'cancelled'
              ? `${order.status === 'completed' ? 'Completed' : 'Cancelled'} ${timeAgo(order.createdAt)}`
              : null}
          </Typography>
        )}

        <IconButton
          size="small"
          onClick={handleViewDetails}
          sx={{
            color: '#94a3b8',
            p: 0.5,
            ml: hasActions ? 0 : 'auto',
            '&:hover': { color: '#64748b', bgcolor: '#f8fafc' },
          }}
        >
          <ChevronRight sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default OrderCard;

import React from 'react';
import {
  Box,
  Typography,
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
  Cancel,
  ChevronRight,
  Whatshot,
  ShoppingBag,
} from '@mui/icons-material';
import { Order, STATUS_FLOW, STATUS_CONFIG, CANCELLABLE, timeAgo, formatINR } from '../orders.types';

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
  const flow     = STATUS_FLOW[order.status];
  const config   = STATUS_CONFIG[order.status];
  const canCancel = CANCELLABLE.includes(order.status);
  const isActing  = actionLoading === order.id;
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
        border: isSelected ? `2px solid ${config.dot}` : '1px solid #e0e0e0',
        borderLeft: `4px solid ${config.dot}`,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isSelected ? `0 0 0 3px ${config.bg}` : 'none',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        '&:hover': {
          boxShadow: isSelected
            ? `0 0 0 3px ${config.bg}`
            : '0 2px 8px rgba(0,0,0,0.07)',
        },
      }}
    >
      {/* ── Header: order number + time ── */}
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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

        {/* Status label — text only, no chip */}
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: config.color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {config.label}
        </Typography>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ px: 2, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>

        {/* Customer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Person sx={{ fontSize: 14, color: '#999999', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: '#1C1C1E',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {order.customer_name?.trim() || 'Walk-in'}
          </Typography>
        </Box>

        {/* Table + time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <TableRestaurant sx={{ fontSize: 14, color: '#999999', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.8125rem', color: '#666666' }}>
            {order.table_number ? `Table ${order.table_number}` : 'No table'}
          </Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#e0e0e0', flexShrink: 0, mx: 0.25 }} />
          <AccessTime sx={{ fontSize: 13, color: '#999999', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999999' }}>
            {timeAgo(order.createdAt)}
          </Typography>
        </Box>

        {/* Items count + total */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          <ShoppingBag sx={{ fontSize: 14, color: '#999999', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.8125rem', color: '#666666' }}>
            {order.items_count ?? 0} item{(order.items_count ?? 0) !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1C1C1E', lineHeight: 1 }}>
            {formatINR(order.total)}
          </Typography>
        </Box>
      </Box>

      {/* ── Action footer ── */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderTop: '1px solid #f8fafc',
          bgcolor: '#fafafa',
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
                  isActing
                    ? <CircularProgress size={13} sx={{ color: 'inherit' }} />
                    : FLOW_ICONS[order.status]
                }
                sx={{
                  flex: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  bgcolor: flow.btnBg,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: flow.btnBg, filter: 'brightness(0.92)', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: flow.btnBg, color: '#ffffff', opacity: 0.65 },
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
                  isActing && !flow
                    ? <CircularProgress size={13} sx={{ color: 'inherit' }} />
                    : <Cancel sx={{ fontSize: 14 }} />
                }
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  borderColor: '#e0e0e0',
                  color: '#999999',
                  '&:hover': { borderColor: '#f43f5e', color: '#f43f5e', bgcolor: '#fff1f2' },
                  '&.Mui-disabled': { borderColor: '#e0e0e0', color: '#999999', opacity: 0.6 },
                }}
              >
                Cancel
              </Button>
            )}
          </>
        ) : (
          <Typography sx={{ fontSize: '0.72rem', color: '#999999', flex: 1, lineHeight: 1.3 }}>
            {order.status === 'completed'
              ? `Completed ${timeAgo(order.createdAt)}`
              : order.status === 'cancelled'
              ? `Cancelled ${timeAgo(order.createdAt)}`
              : null}
          </Typography>
        )}

        <IconButton
          size="small"
          onClick={handleViewDetails}
          sx={{
            color: '#999999',
            p: 0.5,
            ml: hasActions ? 0 : 'auto',
            '&:hover': { color: '#666666', bgcolor: '#f8fafc' },
          }}
        >
          <ChevronRight sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default OrderCard;

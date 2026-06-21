import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
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
  Receipt,
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
  pending:   <CheckCircle sx={{ fontSize: 13 }} />,
  confirmed: <Whatshot sx={{ fontSize: 13 }} />,
  preparing: <DoneAll sx={{ fontSize: 13 }} />,
  ready:     <DeliveryDining sx={{ fontSize: 13 }} />,
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isSelected,
  actionLoading,
  onOrderClick,
  onStatusUpdate,
  onCancelOrder,
}) => {
  const flow      = STATUS_FLOW[order.status];
  const config    = STATUS_CONFIG[order.status];
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
        border: isSelected ? `1.5px solid ${config.dot}` : '1px solid #e8ecf0',
        borderLeft: `3px solid ${config.dot}`,
        borderRadius: 2.5,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isSelected
          ? `0 0 0 3px ${config.bg}, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
        '&:hover': {
          boxShadow: isSelected
            ? `0 0 0 3px ${config.bg}, 0 4px 12px rgba(0,0,0,0.08)`
            : '0 4px 12px rgba(0,0,0,0.08)',
          transform: isSelected ? 'none' : 'translateY(-1px)',
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${config.bg}`,
          bgcolor: config.bg,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Receipt sx={{ fontSize: 13, color: config.color, opacity: 0.7 }} />
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: config.color,
              letterSpacing: '0.02em',
            }}
          >
            #{order.order_number}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: config.dot,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: config.color,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {config.label}
          </Typography>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.875 }}>

        {/* Customer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Person sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: '#1C1C1E',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {order.customer_name?.trim() || 'Walk-in'}
          </Typography>
        </Box>

        {/* Table + time row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {order.table_number ? (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                bgcolor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
              }}
            >
              <TableRestaurant sx={{ fontSize: 11, color: '#475569' }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', lineHeight: 1 }}>
                Table {order.table_number}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                bgcolor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
              }}
            >
              <TableRestaurant sx={{ fontSize: 11, color: '#94a3b8' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1 }}>
                No table
              </Typography>
            </Box>
          )}

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <AccessTime sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {timeAgo(order.createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Items count + total */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 0.5,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ShoppingBag sx={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
              {order.items_count ?? 0} item{(order.items_count ?? 0) !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1, letterSpacing: '-0.01em' }}>
            {formatINR(order.total)}
          </Typography>
        </Box>
      </Box>

      {/* ── Action footer ── */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: '1px solid #f1f5f9',
          bgcolor: '#fafbfc',
          display: 'flex',
          gap: 0.75,
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
                    ? <CircularProgress size={12} sx={{ color: 'inherit' }} />
                    : FLOW_ICONS[order.status]
                }
                sx={{
                  flex: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  py: 0.6,
                  bgcolor: flow.btnBg,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: flow.btnBg, filter: 'brightness(0.9)', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: flow.btnBg, color: '#ffffff', opacity: 0.6 },
                }}
              >
                {!isActing && flow.label}
              </Button>
            )}

            {canCancel && (
              <Tooltip title="Cancel order" placement="top">
                <span>
                  <IconButton
                    size="small"
                    disabled={isActing}
                    onClick={handleCancel}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1.5,
                      color: '#94a3b8',
                      p: 0.6,
                      '&:hover': { borderColor: '#f43f5e', color: '#f43f5e', bgcolor: '#fff1f2' },
                      '&.Mui-disabled': { opacity: 0.5 },
                    }}
                  >
                    <Cancel sx={{ fontSize: 14 }} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </>
        ) : (
          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', flex: 1, lineHeight: 1.3 }}>
            {order.status === 'completed'
              ? `Completed ${timeAgo(order.createdAt)}`
              : order.status === 'cancelled'
              ? `Cancelled ${timeAgo(order.createdAt)}`
              : null}
          </Typography>
        )}

        <Tooltip title="View details" placement="top">
          <IconButton
            size="small"
            onClick={handleViewDetails}
            sx={{
              color: '#94a3b8',
              p: 0.5,
              ml: hasActions ? 0 : 'auto',
              borderRadius: 1.5,
              '&:hover': { color: '#475569', bgcolor: '#f1f5f9' },
            }}
          >
            <ChevronRight sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default OrderCard;
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Button,
  ButtonGroup,
  Chip,
  Typography,
} from '@mui/material';
import { Add, Remove, Restaurant } from '@mui/icons-material';
import { CartItem, PosMenuItem } from '../pos.types';

interface ItemCardProps {
  item: PosMenuItem;
  inCart: CartItem | undefined;
  viewMode: 'grid' | 'list';
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
  formatINR: (n: number) => string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  inCart,
  viewMode,
  onAdd,
  onUpdateQty,
  formatINR,
}) => {
  if (viewMode === 'list') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          gap: 2,
          transition: 'background 0.15s',
          '&:hover': { bgcolor: '#f8fafc' },
          borderBottom: '1px solid #e0e0e0',
          '&:last-child': { borderBottom: 'none' },
        }}
      >
        {/* Avatar */}
        {item.image ? (
          <Avatar
            src={item.image}
            alt={item.name}
            variant="rounded"
            sx={{ width: 52, height: 52, flexShrink: 0, borderRadius: 1.5 }}
          />
        ) : (
          <Avatar
            variant="rounded"
            sx={{
              width: 52,
              height: 52,
              flexShrink: 0,
              borderRadius: 1.5,
              bgcolor: '#f1f5f9',
            }}
          >
            <Restaurant sx={{ fontSize: 22, color: '#94a3b8' }} />
          </Avatar>
        )}

        {/* Middle: name, description, category */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight={600}
            noWrap
            sx={{ fontSize: '0.83rem', color: '#1C1C1E', mb: 0.25 }}
          >
            {item.name}
          </Typography>
          {item.description && (
            <Typography
              noWrap
              sx={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', mb: 0.5 }}
            >
              {item.description}
            </Typography>
          )}
          <Chip
            label={item.categoryName}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e0e0e0',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        </Box>

        {/* Right: price + controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          <Typography fontWeight={800} sx={{ fontSize: '0.9rem', color: '#1C1C1E' }}>
            {formatINR(item.price)}
          </Typography>

          {inCart ? (
            <ButtonGroup
              size="small"
              variant="outlined"
              sx={{
                '& .MuiButtonGroup-grouped': {
                  minWidth: 28,
                  px: 0,
                  borderColor: '#e0e0e0',
                  color: '#1C1C1E',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#1976D2', color: '#1976D2', bgcolor: 'transparent' },
                },
              }}
            >
              <Button onClick={() => onUpdateQty(-1)}>
                <Remove sx={{ fontSize: 14 }} />
              </Button>
              <Button
                disableRipple
                sx={{ cursor: 'default', fontWeight: 700, fontSize: '0.8rem' }}
              >
                {inCart.quantity}
              </Button>
              <Button onClick={() => onUpdateQty(1)}>
                <Add sx={{ fontSize: 14 }} />
              </Button>
            </ButtonGroup>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<Add sx={{ fontSize: 14 }} />}
              onClick={onAdd}
              sx={{
                bgcolor: '#1C1C1E',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 600,
                px: 1.5,
                py: 0.4,
                borderRadius: 1.5,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#374151', boxShadow: 'none' },
              }}
            >
              Add
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  // Grid mode
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        overflow: 'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Image area */}
      <Box sx={{ position: 'relative', height: 120, flexShrink: 0 }}>
        {item.image ? (
          <CardMedia
            component="img"
            image={item.image}
            alt={item.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Restaurant sx={{ fontSize: 36, color: '#94a3b8' }} />
          </Box>
        )}

        {/* Category chip - top left, frosted glass */}
        <Chip
          label={item.categoryName}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            height: 20,
            fontSize: '0.62rem',
            fontWeight: 700,
            bgcolor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(6px)',
            color: '#1C1C1E',
            border: '1px solid rgba(255,255,255,0.6)',
            '& .MuiChip-label': { px: 1 },
          }}
        />

        {/* Quantity badge - top right */}
        {inCart && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 22,
              height: 22,
              borderRadius: '50%',
              bgcolor: '#1976D2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(25,118,210,0.4)',
            }}
          >
            <Typography
              sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}
            >
              {inCart.quantity}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Card content */}
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Item name */}
        <Typography
          fontWeight={700}
          sx={{
            fontSize: '0.85rem',
            color: '#1C1C1E',
            mb: 0.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </Typography>

        {/* Description - 2-line clamp */}
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
            minHeight: '2.6em',
            mb: 1,
          }}
        >
          {item.description || '\u00A0'}
        </Typography>

        {/* Price + controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography fontWeight={800} sx={{ fontSize: '0.95rem', color: '#1C1C1E' }}>
            {formatINR(item.price)}
          </Typography>

          {inCart ? (
            <ButtonGroup
              size="small"
              variant="outlined"
              sx={{
                '& .MuiButtonGroup-grouped': {
                  minWidth: 26,
                  px: 0,
                  borderColor: '#e0e0e0',
                  color: '#1C1C1E',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#1976D2', color: '#1976D2', bgcolor: 'transparent' },
                },
              }}
            >
              <Button onClick={() => onUpdateQty(-1)}>
                <Remove sx={{ fontSize: 13 }} />
              </Button>
              <Button
                disableRipple
                sx={{ cursor: 'default', fontWeight: 700, fontSize: '0.78rem' }}
              >
                {inCart.quantity}
              </Button>
              <Button onClick={() => onUpdateQty(1)}>
                <Add sx={{ fontSize: 13 }} />
              </Button>
            </ButtonGroup>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<Add sx={{ fontSize: 13 }} />}
              onClick={onAdd}
              sx={{
                bgcolor: '#1C1C1E',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 600,
                px: 1.25,
                py: 0.35,
                borderRadius: 1.5,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#374151', boxShadow: 'none' },
              }}
            >
              Add
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
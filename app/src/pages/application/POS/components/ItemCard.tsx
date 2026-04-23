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
          borderBottom: '1px solid #e2e8f0',
          gap: 2,
          transition: 'background 0.15s',
          '&:hover': { bgcolor: '#fafafa' },
          '&:last-child': { borderBottom: 'none' },
        }}
      >
        {/* Avatar */}
        {item.image ? (
          <Avatar
            src={item.image}
            alt={item.name}
            variant="rounded"
            sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: 1.5 }}
          />
        ) : (
          <Avatar
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            }}
          >
            <Restaurant sx={{ fontSize: 24, color: '#fff' }} />
          </Avatar>
        )}

        {/* Middle: name, description, category */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            color="#0f172a"
            noWrap
            sx={{ mb: 0.25 }}
          >
            {item.name}
          </Typography>
          {item.description && (
            <Typography
              variant="caption"
              color="#64748b"
              noWrap
              sx={{ display: 'block', mb: 0.5 }}
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
              bgcolor: 'rgba(99,102,241,0.1)',
              color: '#6366f1',
              border: '1px solid rgba(99,102,241,0.2)',
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
          <Typography variant="body2" fontWeight={700} color="#0f172a">
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
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                  '&:hover': { borderColor: '#6366f1', color: '#6366f1' },
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
                bgcolor: '#0f172a',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 600,
                px: 1.5,
                py: 0.4,
                borderRadius: 1,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
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
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
          borderColor: '#cbd5e1',
        },
      }}
    >
      {/* Image area */}
      <Box sx={{ position: 'relative', height: 130, flexShrink: 0 }}>
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
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 60%, #a5b4fc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Restaurant sx={{ fontSize: 40, color: 'rgba(255,255,255,0.7)' }} />
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
            bgcolor: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(6px)',
            color: '#0f172a',
            border: '1px solid rgba(255,255,255,0.5)',
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
              bgcolor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(99,102,241,0.45)',
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
          variant="body2"
          fontWeight={700}
          color="#0f172a"
          sx={{
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
          variant="caption"
          color="#64748b"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
            minHeight: '2.8em',
            mb: 1,
          }}
        >
          {item.description || '\u00A0'}
        </Typography>

        {/* Price + controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" fontWeight={700} color="#0f172a">
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
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                  '&:hover': { borderColor: '#6366f1', color: '#6366f1' },
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
                bgcolor: '#0f172a',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 600,
                px: 1.25,
                py: 0.35,
                borderRadius: 1,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
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

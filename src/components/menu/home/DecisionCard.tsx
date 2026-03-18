import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Chip,
  alpha,
} from '@mui/material';
import {
  Add,
  Remove,
  Star,
  Restaurant,
  AccessTime,
} from '@mui/icons-material';
import { MenuItemType } from '../../../hooks/useMenuData';

interface DecisionCardProps {
  item: MenuItemType;
  onAddToCart?: (item: MenuItemType) => void;
  onRemoveFromCart?: (item: MenuItemType) => void;
  getItemQuantityInCart?: (itemId: string) => number;
  getMenuItemImage?: (item: MenuItemType) => string;
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  item,
  onAddToCart,
  onRemoveFromCart,
  getItemQuantityInCart,
  getMenuItemImage,
}) => {
  const [imageError, setImageError] = useState(false);
  const quantity = getItemQuantityInCart ? getItemQuantityInCart(item.id) : 0;
  const imageUrl = getMenuItemImage ? getMenuItemImage(item) : item.image || '';
  const hasImage = imageUrl && !imageError;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        backgroundColor: 'white',
        borderRadius: 2,
        p: 2,
        border: '1px solid #E0E0E0',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: '#1E3A5F',
          boxShadow: '0 4px 12px rgba(30, 58, 95, 0.1)',
        },
      }}
    >
      {/* Image Section */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: 100, sm: 120 },
          height: { xs: 100, sm: 120 },
          flexShrink: 0,
          borderRadius: 1.5,
          overflow: 'hidden',
          backgroundColor: '#F8F9FA',
        }}
      >
        {hasImage ? (
          <img
            src={imageUrl}
            alt={item.name}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha('#1E3A5F', 0.05),
            }}
          >
            <Restaurant sx={{ fontSize: 40, color: '#CED4DA' }} />
          </Box>
        )}

        {/* Veg/Non-Veg Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 18,
            height: 18,
            border: '2px solid',
            borderColor: item.isVeg ? '#4CAF50' : '#F44336',
            borderRadius: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: item.isVeg ? '#4CAF50' : '#F44336',
            }}
          />
        </Box>

        {/* Rating Badge */}
        {item.rating && (
          <Chip
            icon={<Star sx={{ fontSize: 12, color: 'white' }} />}
            label={item.rating.toFixed(1)}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              backgroundColor: '#4CAF50',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 20,
              '& .MuiChip-icon': {
                color: 'white',
                marginLeft: '4px',
              },
            }}
          />
        )}
      </Box>

      {/* Content Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Name and Category */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.95rem', sm: '1.05rem' },
            color: '#2C3E50',
            mb: 0.5,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            mb: 1,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {item.description || 'Delicious dish prepared with fresh ingredients'}
        </Typography>

        {/* Bottom Section: Price and Add Button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          {/* Price */}
          <Box>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1E3A5F',
                  fontSize: { xs: '1.1rem', sm: '1.2rem' },
                }}
              >
                ₹{item.price}
              </Typography>
              {item.originalPrice && (
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: 'line-through',
                    color: '#6C757D',
                    fontSize: '0.75rem',
                  }}
                >
                  ₹{item.originalPrice}
                </Typography>
              )}
            </Stack>
            
            {/* Prep Time (if available) */}
            {item.preparationTime && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                <AccessTime sx={{ fontSize: 12, color: '#6C757D' }} />
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: '#6C757D',
                    fontWeight: 500,
                  }}
                >
                  {item.preparationTime} min
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Add to Cart Button */}
          {quantity === 0 ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add sx={{ fontSize: 16 }} />}
              onClick={() => onAddToCart && onAddToCart(item)}
              sx={{
                backgroundColor: '#1E3A5F',
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                px: 2,
                py: 0.75,
                borderRadius: 1.5,
                fontSize: '0.85rem',
                minWidth: 80,
                '&:hover': {
                  backgroundColor: '#2C5282',
                },
              }}
            >
              Add
            </Button>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                backgroundColor: alpha('#1E3A5F', 0.1),
                borderRadius: 1.5,
                p: 0.5,
                border: '2px solid #1E3A5F',
              }}
            >
              <IconButton
                size="small"
                onClick={() => onRemoveFromCart && onRemoveFromCart(item)}
                sx={{
                  backgroundColor: 'white',
                  color: '#1E3A5F',
                  width: 26,
                  height: 26,
                  '&:hover': {
                    backgroundColor: '#F8F9FA',
                  },
                }}
              >
                <Remove sx={{ fontSize: 14 }} />
              </IconButton>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#1E3A5F',
                  minWidth: 20,
                  textAlign: 'center',
                  fontSize: '0.9rem',
                }}
              >
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onAddToCart && onAddToCart(item)}
                sx={{
                  backgroundColor: 'white',
                  color: '#1E3A5F',
                  width: 26,
                  height: 26,
                  '&:hover': {
                    backgroundColor: '#F8F9FA',
                  },
                }}
              >
                <Add sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default DecisionCard;
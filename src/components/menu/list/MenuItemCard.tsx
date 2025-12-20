import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
  alpha,
} from '@mui/material';
import {
  Add,
  Remove,
  Timer,
  LocalFireDepartment,
  Restaurant,
  Star,
} from '@mui/icons-material';
import { MenuItemType } from '../../../hooks/useMenuData';
import { useCart } from '../../../contexts/CartContext';
import VegNonVegIcon from '../shared/VegNonVegIcon';

interface MenuItemCardProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType) => void;
  quantityInCart: number;
  imageUrl: string;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  quantityInCart,
  imageUrl,
}) => {
  const { updateQuantity, removeItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleIncreaseQuantity = () => updateQuantity(item.id, quantityInCart + 1);
  const handleDecreaseQuantity = () => {
    if (quantityInCart > 1) {
      updateQuantity(item.id, quantityInCart - 1);
    } else {
      removeItem(item.id);
    }
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        border: '1px solid #E0E0E0',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        height: { xs: 140, sm: 150 },
        '&:hover': {
          borderColor: '#1E3A5F',
          boxShadow: '0 4px 12px rgba(30, 58, 95, 0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Left - Image */}
      <Box
        sx={{
          width: { xs: 110, sm: 130 },
          height: '100%',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {imageUrl && !imageError ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={item.name}
            onError={() => setImageError(true)}
            sx={{
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
              backgroundColor: '#F8F9FA',
            }}
          >
            <Restaurant sx={{ fontSize: 40, color: '#CED4DA' }} />
          </Box>
        )}

        {/* Badges on Image */}
        <Box sx={{ position: 'absolute', top: 6, left: 6, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {item.isNew && (
            <Chip 
              label="New" 
              size="small" 
              sx={{ 
                backgroundColor: '#28A745', 
                color: 'white', 
                fontWeight: 700, 
                height: 18, 
                fontSize: '0.6rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                '& .MuiChip-label': { px: 0.75 },
              }} 
            />
          )}
          {item.isPopular && (
            <Chip 
              label="Popular" 
              size="small" 
              sx={{ 
                backgroundColor: '#FFC107', 
                color: 'white', 
                fontWeight: 700, 
                height: 18, 
                fontSize: '0.6rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                '& .MuiChip-label': { px: 0.75 },
              }} 
            />
          )}
        </Box>

        {/* Discount Badge */}
        {item.discount && (
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: '#DC3545',
              color: 'white',
              px: 0.75,
              py: 0.25,
              borderRadius: 0.75,
              fontWeight: 700,
              fontSize: '0.65rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {item.discount}% OFF
          </Box>
        )}
      </Box>

      {/* Right - Content and Actions */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
        {/* Top Section - Name, Rating, Price */}
        <Box sx={{ mb: 1 }}>
          {/* Veg/Non-Veg and Name */}
          <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 0.75 }}>
            <VegNonVegIcon isVeg={item.isVeg || false} size={14} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                color: '#2C3E50',
                flex: 1,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.name}
            </Typography>
          </Stack>

          {/* Rating and Price Row */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
            {/* Rating */}
            {item.rating ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Star sx={{ fontSize: 14, color: '#FFC107' }} />
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem', color: '#2C3E50' }}>
                  {item.rating}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  ({item.reviewCount})
                </Typography>
              </Stack>
            ) : (
              <Box />
            )}

            {/* Price */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: '#1E3A5F',
                  fontSize: { xs: '1.1rem', sm: '1.2rem' },
                  lineHeight: 1,
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
                    fontSize: '0.7rem',
                    lineHeight: 1,
                  }}
                >
                  ₹{item.originalPrice}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>
        </Box>

        {/* Bottom Section - Meta Info and Add Button */}
        <Box sx={{ mt: 'auto' }}>
          {/* Meta Info */}
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Stack direction="row" spacing={0.25} alignItems="center">
                <Timer sx={{ fontSize: 12, color: '#6C757D' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                  {item.preparationTime}m
                </Typography>
              </Stack>

              {item.spicyLevel && item.spicyLevel > 0 && (
                <Stack direction="row" spacing={0.15} alignItems="center">
                  {[...Array(Math.min(item.spicyLevel, 3))].map((_, i) => (
                    <LocalFireDepartment
                      key={i}
                      sx={{
                        fontSize: 12,
                        color: item.spicyLevel === 1 ? '#FFA726' : item.spicyLevel === 2 ? '#FF7043' : '#F44336',
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>

            {/* Add to Cart Button */}
            <Box sx={{ minWidth: { xs: 90, sm: 100 } }}>
              {quantityInCart === 0 ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  onClick={() => onAddToCart(item)}
                  sx={{
                    backgroundColor: '#1E3A5F',
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'none',
                    py: 0.75,
                    fontSize: '0.8rem',
                    borderRadius: 1.5,
                    boxShadow: '0 2px 8px rgba(30, 58, 95, 0.2)',
                    minHeight: 32,
                    '&:hover': {
                      backgroundColor: '#2C5282',
                      boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
                    },
                  }}
                >
                  Add
                </Button>
              ) : (
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor: alpha('#1E3A5F', 0.08),
                    borderRadius: 1.5,
                    p: 0.5,
                    border: '2px solid #1E3A5F',
                    minHeight: 32,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={handleDecreaseQuantity}
                    sx={{
                      backgroundColor: 'white',
                      color: '#1E3A5F',
                      width: 24,
                      height: 24,
                      '&:hover': {
                        backgroundColor: '#F8F9FA',
                      },
                    }}
                  >
                    <Remove sx={{ fontSize: 14 }} />
                  </IconButton>

                  <Typography variant="body2" fontWeight={700} color="#1E3A5F" sx={{ fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>
                    {quantityInCart}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={handleIncreaseQuantity}
                    sx={{
                      backgroundColor: 'white',
                      color: '#1E3A5F',
                      width: 24,
                      height: 24,
                      '&:hover': {
                        backgroundColor: '#F8F9FA',
                      },
                    }}
                  >
                    <Add sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
};

export default MenuItemCard;
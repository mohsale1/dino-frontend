import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Stack,
  alpha,
  Chip,
} from '@mui/material';
import { 
  LocalFireDepartment, 
  Add, 
  Remove,
  Restaurant,
  Star,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { MenuItemType } from '../../../hooks/useMenuData';

interface PopularDishesProps {
  dishes: MenuItemType[];
  onAddToCart?: (item: MenuItemType) => void;
  onRemoveFromCart?: (item: MenuItemType) => void;
  getItemQuantityInCart?: (itemId: string) => number;
  getMenuItemImage?: (item: MenuItemType) => string;
}

const PopularDishes: React.FC<PopularDishesProps> = ({
  dishes,
  onAddToCart,
  onRemoveFromCart,
  getItemQuantityInCart,
  getMenuItemImage,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (dishes.length === 0) {
    return null;
  }

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const newPosition =
      direction === 'left'
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    setScrollPosition(newPosition);
  };

  return (
    <Box sx={{ py: { xs: 3, sm: 4 }, backgroundColor: 'white' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Section Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocalFireDepartment sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#1E3A5F',
                  fontSize: { xs: '1.15rem', sm: '1.4rem' },
                  letterSpacing: '-0.5px',
                }}
              >
                Popular Dishes
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  fontWeight: 500,
                }}
              >
                Most loved by our customers
              </Typography>
            </Box>
          </Stack>

          {/* Navigation Buttons - Desktop Only */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            <IconButton
              onClick={() => handleScroll('left')}
              disabled={scrollPosition <= 0}
              sx={{
                backgroundColor: '#F8F9FA',
                border: '2px solid #E0E0E0',
                '&:hover': {
                  backgroundColor: 'white',
                  borderColor: '#1E3A5F',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#F8F9FA',
                  borderColor: '#E0E0E0',
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={() => handleScroll('right')}
              sx={{
                backgroundColor: '#F8F9FA',
                border: '2px solid #E0E0E0',
                '&:hover': {
                  backgroundColor: 'white',
                  borderColor: '#1E3A5F',
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Stack>
        </Stack>

        {/* Horizontal Scrolling Carousel */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#E0E0E0',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#1E3A5F',
              borderRadius: 4,
              '&:hover': {
                backgroundColor: '#2C5282',
              },
            },
          }}
        >
          {dishes.map((dish) => {
            const quantity = getItemQuantityInCart ? getItemQuantityInCart(dish.id) : 0;
            const imageUrl = getMenuItemImage ? getMenuItemImage(dish) : dish.image || '';
            const hasImage = imageUrl && !imageErrors[dish.id];

            return (
              <Card
                key={dish.id}
                sx={{
                  minWidth: { xs: 240, sm: 280 },
                  maxWidth: { xs: 240, sm: 280 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2.5,
                  border: '2px solid #E0E0E0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#1E3A5F',
                    boxShadow: '0 8px 24px rgba(30, 58, 95, 0.15)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {/* Image Section */}
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '60%',
                    backgroundColor: '#F8F9FA',
                    overflow: 'hidden',
                  }}
                >
                  {hasImage ? (
                    <CardMedia
                      component="img"
                      image={imageUrl}
                      alt={dish.name}
                      onError={() => handleImageError(dish.id)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha('#1E3A5F', 0.05),
                      }}
                    >
                      <Restaurant sx={{ fontSize: 60, color: '#CED4DA' }} />
                    </Box>
                  )}

                  {/* Veg/Non-Veg Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      width: 20,
                      height: 20,
                      border: '2px solid',
                      borderColor: dish.isVeg ? '#4CAF50' : '#F44336',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: dish.isVeg ? '#4CAF50' : '#F44336',
                      }}
                    />
                  </Box>

                  {/* Rating Badge */}
                  {dish.rating && (
                    <Chip
                      icon={<Star sx={{ fontSize: 14, color: 'white' }} />}
                      label={dish.rating.toFixed(1)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          color: 'white',
                          marginLeft: '4px',
                        },
                      }}
                    />
                  )}
                </Box>

                {/* Content Section */}
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                  {/* Name */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#2C3E50',
                      mb: 0.5,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {dish.name}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.85rem',
                      mb: 1.5,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {dish.description || 'Delicious dish prepared with fresh ingredients'}
                  </Typography>

                  {/* Price and Add Button */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#1E3A5F',
                          fontSize: '1.25rem',
                        }}
                      >
                        ₹{dish.price}
                      </Typography>
                      {dish.originalPrice && (
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'line-through',
                            color: '#6C757D',
                            fontSize: '0.8rem',
                          }}
                        >
                          ₹{dish.originalPrice}
                        </Typography>
                      )}
                    </Box>

                    {/* Add to Cart Button */}
                    {quantity === 0 ? (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => onAddToCart && onAddToCart(dish)}
                        sx={{
                          backgroundColor: '#1E3A5F',
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'none',
                          px: 2,
                          py: 0.75,
                          borderRadius: 1.5,
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
                          onClick={() => onRemoveFromCart && onRemoveFromCart(dish)}
                          sx={{
                            backgroundColor: 'white',
                            color: '#1E3A5F',
                            width: 28,
                            height: 28,
                            '&:hover': {
                              backgroundColor: '#F8F9FA',
                            },
                          }}
                        >
                          <Remove sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: '#1E3A5F',
                            minWidth: 24,
                            textAlign: 'center',
                          }}
                        >
                          {quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => onAddToCart && onAddToCart(dish)}
                          sx={{
                            backgroundColor: 'white',
                            color: '#1E3A5F',
                            width: 28,
                            height: 28,
                            '&:hover': {
                              backgroundColor: '#F8F9FA',
                            },
                          }}
                        >
                          <Add sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default PopularDishes;
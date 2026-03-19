import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  alpha,
  Stack,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { CartItem } from '../hooks/useCart';

interface MenuFragmentProps {
  menuData: any;
  cart: CartItem[];
  onAddToCart: (item: Omit<CartItem, 'quantity' | 'total_price'>) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const MenuFragment: React.FC<MenuFragmentProps> = ({
  menuData,
  cart,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const { categories, items } = menuData;
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const checkScrollButtons = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = categoryScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
    return undefined;
  }, [categories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 250;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getCartItemQuantity = (itemId: string): number => {
    const cartItem = cart.find((item) => item.item_id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: any) => {
    onAddToCart({
      item_id: item.id,
      item_name: item.name,
      unit_price: item.price,
      description: item.description,
    });
  };

  const handleIncrement = (itemId: string) => {
    const currentQuantity = getCartItemQuantity(itemId);
    onUpdateQuantity(itemId, currentQuantity + 1);
  };

  const handleDecrement = (itemId: string) => {
    const currentQuantity = getCartItemQuantity(itemId);
    onUpdateQuantity(itemId, currentQuantity - 1);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch && item.is_available;
    });
  }, [items, selectedCategory, searchQuery]);

  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    if (selectedCategory === 'all') {
      categories.forEach((cat: any) => {
        const categoryItems = filteredItems.filter((item: any) => item.category_id === cat.id);
        if (categoryItems.length > 0) {
          grouped[cat.id] = categoryItems;
        }
      });
    } else {
      grouped[selectedCategory] = filteredItems;
    }
    
    return grouped;
  }, [filteredItems, selectedCategory, categories]);

  const renderItemCard = (item: any) => {
    const quantity = getCartItemQuantity(item.id);
    const isExpanded = expandedItems.has(item.id);
    const hasLongDescription = item.description && item.description.length > 100;

    return (
      <Card
        key={item.id}
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            borderColor: '#d1d5db',
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" gap={2} p={2.5}>
            {/* Item Image Placeholder */}
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 1.5,
                bgcolor: '#f9fafb',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography variant="h3" fontWeight={800} sx={{ color: '#e5e7eb' }}>
                {item.name.charAt(0)}
              </Typography>

              {/* Veg/Non-Veg Indicator */}
              {item.is_vegetarian !== null && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: 20,
                    height: 20,
                    border: `2px solid ${item.is_vegetarian ? '#10b981' : '#ef4444'}`,
                    borderRadius: 0.5,
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: item.is_vegetarian ? '#10b981' : '#ef4444',
                    }}
                  />
                </Box>
              )}

              {/* Bestseller Badge */}
              {item.display_order <= 3 && (
                <Chip
                  label="Bestseller"
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 6,
                    left: 6,
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: '#fbbf24',
                    color: 'white',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              )}
            </Box>

            {/* Item Details */}
            <Box flex={1} minWidth={0} display="flex" flexDirection="column">
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="#1a1a1a"
                sx={{ mb: 0.5 }}
              >
                {item.name}
              </Typography>

              {/* Description */}
              {item.description && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </Typography>
                  {hasLongDescription && (
                    <Button
                      size="small"
                      onClick={() => toggleItemExpanded(item.id)}
                      endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#6b7280',
                        p: 0,
                        mt: 0.5,
                        minWidth: 'auto',
                        '&:hover': {
                          bgcolor: 'transparent',
                          color: '#1a1a1a',
                        },
                      }}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </Button>
                  )}
                </Box>
              )}

              {/* Price and Time Info */}
              <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                <Typography variant="h6" fontWeight={700} color="#1a1a1a">
                  ₹{item.price.toFixed(2)}
                </Typography>
                <Chip
                  icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
                  label="15-20 min"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    bgcolor: '#f3f4f6',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                  }}
                />
              </Box>

              {/* Add to Cart Button - Always at bottom */}
              <Box sx={{ mt: 'auto' }}>
                {quantity === 0 ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAddToCart(item)}
                    sx={{
                      minWidth: 100,
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: '#1a1a1a',
                      px: 2.5,
                      py: 1,
                      fontSize: '0.875rem',
                      borderRadius: 1.5,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        bgcolor: '#2d2d2d',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Add
                  </Button>
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    sx={{
                      border: '2px solid #1a1a1a',
                      borderRadius: 1.5,
                      bgcolor: alpha('#1a1a1a', 0.04),
                      p: 0.5,
                      width: 'fit-content',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleDecrement(item.id)}
                      sx={{
                        bgcolor: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          bgcolor: '#f3f4f6',
                        },
                      }}
                    >
                      <RemoveIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ minWidth: 32, textAlign: 'center', color: '#1a1a1a' }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleIncrement(item.id)}
                      sx={{
                        bgcolor: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          bgcolor: '#f3f4f6',
                        },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Menu Banner */}
      <Fade in timeout={300}>
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          }}
        >
          {/* Decorative Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              opacity: 0.08,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <CardContent sx={{ p: 2.5, position: 'relative', '&:last-child': { pb: 2.5 } }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RestaurantIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
                  Explore Our Menu
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  Browse through our carefully curated selection
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Search Bar */}
      <Fade in timeout={400}>
        <TextField
          fullWidth
          placeholder="Search for dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              borderRadius: 1.5,
              border: '1px solid #e5e7eb',
              '&:hover': {
                borderColor: '#d1d5db',
              },
              '&.Mui-focused': {
                borderColor: '#1a1a1a',
              },
              '& fieldset': {
                border: 'none',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6b7280', fontSize: 22 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Fade>

      {/* Category Slider */}
      <Fade in timeout={500}>
        <Box 
          sx={{ 
            mb: 3, 
            position: 'relative',
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Left Gradient Fade */}
          {showLeftScroll && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 80,
                background: 'linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Right Gradient Fade */}
          {showRightScroll && (
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 80,
                background: 'linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Scroll Buttons */}
          {showLeftScroll && (
            <Fade in>
              <IconButton
                onClick={() => scrollCategories('left')}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: '#1a1a1a',
                  border: '2px solid #1a1a1a',
                  width: 40,
                  height: 40,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  animation: 'slideInLeft 0.3s ease-out',
                  '@keyframes slideInLeft': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(-50%) translateX(-20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(-50%) translateX(0)',
                    },
                  },
                  '&:hover': {
                    bgcolor: '#2d2d2d',
                    borderColor: '#2d2d2d',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
                    transform: 'translateY(-50%) scale(1.08)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 24, color: 'white', fontWeight: 'bold' }} />
              </IconButton>
            </Fade>
          )}
          
          {showRightScroll && (
            <Fade in>
              <IconButton
                onClick={() => scrollCategories('right')}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: '#1a1a1a',
                  border: '2px solid #1a1a1a',
                  width: 40,
                  height: 40,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  animation: 'slideInRight 0.3s ease-out',
                  '@keyframes slideInRight': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(-50%) translateX(20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(-50%) translateX(0)',
                    },
                  },
                  '&:hover': {
                    bgcolor: '#2d2d2d',
                    borderColor: '#2d2d2d',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
                    transform: 'translateY(-50%) scale(1.08)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 24, color: 'white', fontWeight: 'bold' }} />
              </IconButton>
            </Fade>
          )}

          {/* Category Pills */}
          <Box
            ref={categoryScrollRef}
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              py: 2.5,
              px: 3,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <Chip
              label={`All (${items.length})`}
              onClick={() => handleCategoryChange('all')}
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 2.5,
                py: 2.5,
                height: 'auto',
                borderRadius: 1.5,
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                flexShrink: 0,
                bgcolor: selectedCategory === 'all' ? '#1a1a1a' : 'white',
                color: selectedCategory === 'all' ? 'white' : '#374151',
                border: selectedCategory === 'all' ? 'none' : '1px solid #e5e7eb',
                boxShadow: selectedCategory === 'all' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                transform: selectedCategory === 'all' ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  bgcolor: selectedCategory === 'all' ? '#2d2d2d' : '#f9fafb',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            {categories.map((category: any) => {
              const itemCount = items.filter((i: any) => i.category_id === category.id).length;

              return (
                <Chip
                  key={category.id}
                  label={`${category.name} (${itemCount})`}
                  onClick={() => handleCategoryChange(category.id)}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2.5,
                    py: 2.5,
                    height: 'auto',
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                    bgcolor: selectedCategory === category.id ? '#1a1a1a' : 'white',
                    color: selectedCategory === category.id ? 'white' : '#374151',
                    border: selectedCategory === category.id ? 'none' : '1px solid #e5e7eb',
                    boxShadow: selectedCategory === category.id ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                    transform: selectedCategory === category.id ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': {
                      bgcolor: selectedCategory === category.id ? '#2d2d2d' : '#f9fafb',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Fade>

      {/* Results Info */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Typography variant="body2" fontWeight={600} color="#1a1a1a">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
        </Typography>
        {searchQuery && (
          <Chip
            label={`"${searchQuery}"`}
            onDelete={() => setSearchQuery('')}
            size="small"
            sx={{
              fontWeight: 500,
              bgcolor: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
            }}
          />
        )}
      </Box>

      {/* Menu Items */}
      {selectedCategory === 'all' ? (
        <Stack spacing={4}>
          {Object.entries(itemsByCategory).map(([categoryId, categoryItems]) => {
            const category = categories.find((c: any) => c.id === categoryId);
            return (
              <Box key={categoryId}>
                <Box
                  sx={{
                    mb: 2.5,
                    pb: 1,
                    borderBottom: '2px solid #e5e7eb',
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="#1a1a1a" sx={{ mb: 0.5 }}>
                    {category?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  {categoryItems.map(renderItemCard)}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Stack spacing={2}>
          {filteredItems.length === 0 ? (
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <CardContent sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
                  No items found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Try adjusting your search or filters
                </Typography>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map(renderItemCard)
          )}
        </Stack>
      )}
    </Box>
  );
};

export default MenuFragment;
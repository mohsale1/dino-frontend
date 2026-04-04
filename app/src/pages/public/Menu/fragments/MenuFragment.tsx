import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  alpha,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
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
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Keep scroll state for potential future use; checkScrollButtons kept per spec
  const [, setShowLeftScroll] = useState(false);
  const [, setShowRightScroll] = useState(true);

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

  // scrollCategories kept per spec (may be used externally or in future)
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 250;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  // Suppress unused warning — kept per spec
  void scrollCategories;

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
      const matchesCategory =
        selectedCategory === 'all' || item.category_id === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch && item.is_available;
    });
  }, [items, selectedCategory, searchQuery]);

  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    if (selectedCategory === 'all') {
      categories.forEach((cat: any) => {
        const categoryItems = filteredItems.filter(
          (item: any) => item.category_id === cat.id
        );
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

    return (
      <Box
        key={item.id}
        sx={{
          bgcolor: '#ffffff',
          border: '1px solid #e8e8e8',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          gap: 0,
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          },
        }}
      >
        {/* Image Column */}
        <Box
          sx={{
            width: 88,
            minWidth: 88,
            height: 88,
            m: 1.5,
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
            alignSelf: 'flex-start',
          }}
        >
          {item.image_urls && item.image_urls.length > 0 ? (
            <img
              src={item.image_urls[0]}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 10,
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
                bgcolor: '#f3f4f6',
                borderRadius: '10px',
              }}
            >
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ color: '#d1d5db' }}
              >
                {item.name.charAt(0)}
              </Typography>
            </Box>
          )}

          {/* Bestseller badge */}
          {item.display_order != null && item.display_order <= 3 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: '#f97316',
                py: '2px',
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  lineHeight: 1.4,
                }}
              >
                BESTSELLER
              </Typography>
            </Box>
          )}
        </Box>

        {/* Content Column */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            py: 1.5,
            pr: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {/* Veg indicator + name row */}
          <Box display="flex" alignItems="center" gap={0.75}>
            {item.is_vegetarian !== null && item.is_vegetarian !== undefined && (
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: `1.5px solid ${item.is_vegetarian ? '#16a34a' : '#dc2626'}`,
                  borderRadius: '3px',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: item.is_vegetarian ? '#16a34a' : '#dc2626',
                  }}
                />
              </Box>
            )}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: '#1a1a1a',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </Typography>
          </Box>

          {/* Description — always 2-line clamp */}
          {item.description && (
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: '#6b7280',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.description}
            </Typography>
          )}

          {/* Price + prep time */}
          <Box display="flex" alignItems="center" gap={1} mt={0.25}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1a1a1a',
                lineHeight: 1,
              }}
            >
              ₹{item.price.toFixed(2)}
            </Typography>
            {item.preparation_time_minutes && (
              <Chip
                icon={<ScheduleIcon sx={{ fontSize: '11px !important' }} />}
                label={`${item.preparation_time_minutes} min`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  bgcolor: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  '& .MuiChip-label': { px: 0.75 },
                  '& .MuiChip-icon': { ml: 0.5 },
                }}
              />
            )}
          </Box>

          {/* Add / Stepper */}
          <Box sx={{ mt: 'auto', pt: 0.5 }}>
            {quantity === 0 ? (
              <Button
                size="small"
                onClick={() => handleAddToCart(item)}
                sx={{
                  bgcolor: '#1a1a1a',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  letterSpacing: '0.04em',
                  textTransform: 'none',
                  borderRadius: '100px',
                  px: 2.5,
                  py: 0.625,
                  minWidth: 72,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#333333',
                    boxShadow: 'none',
                  },
                }}
                variant="contained"
                disableElevation
              >
                ADD
              </Button>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  border: '1.5px solid #1a1a1a',
                  borderRadius: '100px',
                  width: 'fit-content',
                  overflow: 'hidden',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleDecrement(item.id)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0,
                    color: '#1a1a1a',
                    '&:hover': { bgcolor: alpha('#1a1a1a', 0.06) },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                    minWidth: 24,
                    textAlign: 'center',
                    lineHeight: 1,
                  }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleIncrement(item.id)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0,
                    color: '#1a1a1a',
                    '&:hover': { bgcolor: alpha('#1a1a1a', 0.06) },
                  }}
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const hasResults = filteredItems.length > 0;

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100%' }}>
      {/* Search Bar */}
      <Box sx={{ px: 2, pt: 2, pb: 0 }}>
        <TextField
          fullWidth
          placeholder="Search dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#ffffff',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              '& fieldset': {
                borderColor: '#e8e8e8',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: '#d1d5db',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
                borderWidth: '1px',
                boxShadow: '0 0 0 2px rgba(26,26,26,0.15)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  edge="end"
                  sx={{ color: '#9ca3af' }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {/* Sticky Category Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: '#fafafa',
          py: 1.5,
          px: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Box
          ref={categoryScrollRef}
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {/* All chip */}
          <Chip
            label={`All (${items.filter((i: any) => i.is_available).length})`}
            onClick={() => setSelectedCategory('all')}
            sx={{
              flexShrink: 0,
              borderRadius: '100px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              height: 34,
              cursor: 'pointer',
              bgcolor: selectedCategory === 'all' ? '#1a1a1a' : '#ffffff',
              color: selectedCategory === 'all' ? '#ffffff' : '#374151',
              border: selectedCategory === 'all' ? 'none' : '1px solid #e8e8e8',
              '& .MuiChip-label': { px: 1.5 },
              '&:hover': {
                bgcolor: selectedCategory === 'all' ? '#333333' : '#f9fafb',
              },
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          />

          {categories.map((category: any) => {
            const itemCount = items.filter(
              (i: any) => i.category_id === category.id && i.is_available
            ).length;
            const isSelected = selectedCategory === category.id;
            return (
              <Chip
                key={category.id}
                label={`${category.name} (${itemCount})`}
                onClick={() => setSelectedCategory(category.id)}
                sx={{
                  flexShrink: 0,
                  borderRadius: '100px',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  height: 34,
                  cursor: 'pointer',
                  bgcolor: isSelected ? '#1a1a1a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#374151',
                  border: isSelected ? 'none' : '1px solid #e8e8e8',
                  '& .MuiChip-label': { px: 1.5 },
                  '&:hover': {
                    bgcolor: isSelected ? '#333333' : '#f9fafb',
                  },
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Results count */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: 500 }}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </Typography>
        {searchQuery && (
          <Chip
            label={`"${searchQuery}"`}
            onDelete={() => setSearchQuery('')}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.75rem',
              fontWeight: 500,
              bgcolor: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #e8e8e8',
              '& .MuiChip-label': { px: 1 },
              '& .MuiChip-deleteIcon': { fontSize: 14 },
            }}
          />
        )}
      </Box>

      {/* Item List */}
      <Box sx={{ px: 2, pb: 3 }}>
        {!hasResults ? (
          /* Empty state */
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RestaurantIcon sx={{ fontSize: 28, color: '#d1d5db' }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#374151' }}>
              No items found
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#9ca3af', textAlign: 'center' }}>
              Try a different search or category
            </Typography>
          </Box>
        ) : selectedCategory === 'all' ? (
          /* Grouped by category */
          <Stack spacing={3}>
            {Object.entries(itemsByCategory).map(([categoryId, categoryItems]) => {
              const category = categories.find((c: any) => c.id === categoryId);
              return (
                <Box key={categoryId}>
                  {/* Category header */}
                  <Box
                    sx={{
                      borderLeft: '3px solid #f97316',
                      pl: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: '#1a1a1a',
                        lineHeight: 1.3,
                      }}
                    >
                      {category?.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                      {(categoryItems as any[]).length}{' '}
                      {(categoryItems as any[]).length === 1 ? 'item' : 'items'}
                    </Typography>
                  </Box>

                  <Stack spacing={1.5}>
                    {(categoryItems as any[]).map(renderItemCard)}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        ) : (
          /* Single category */
          <Stack spacing={1.5}>
            {filteredItems.map(renderItemCard)}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MenuFragment;
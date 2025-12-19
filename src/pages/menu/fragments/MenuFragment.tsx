import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  Stack,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Rating,
  Tabs,
  Tab,
  Card,
  CardMedia,
  Divider,
} from '@mui/material';
import { 
  Search, 
  Clear, 
  Add, 
  Remove, 
  LocalFireDepartment,
  Timer,
  Restaurant,
} from '@mui/icons-material';
import { MenuItemType, CategoryType } from '../../../hooks/useMenuData';
import { useCart } from '../../../contexts/CartContext';

interface MenuFragmentProps {
  groupedMenuItems: Array<CategoryType & { items: MenuItemType[] }>;
  categoryRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  allCategories: CategoryType[];
  onAddToCart: (item: MenuItemType) => void;
  getItemQuantityInCart: (itemId: string) => number;
  onToggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  getMenuItemImage: (item: MenuItemType) => string;
}

const MenuFragment: React.FC<MenuFragmentProps> = ({
  groupedMenuItems,
  categoryRefs,
  allCategories,
  onAddToCart,
  getItemQuantityInCart,
  onToggleFavorite,
  isFavorite,
  getMenuItemImage,
}) => {
  const theme = useTheme();
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items
  const getFilteredGroups = () => {
    return groupedMenuItems.map(group => ({
      ...group,
      items: group.items.filter(item => {
        const matchesVegFilter = 
          vegFilter === 'all' || 
          (vegFilter === 'veg' && item.isVeg) || 
          (vegFilter === 'non-veg' && !item.isVeg);
        
        const matchesSearch = 
          searchQuery === '' ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesVegFilter && matchesSearch;
      }),
    })).filter(group => group.items.length > 0);
  };

  const filteredGroups = getFilteredGroups();

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        const element = categoryRefs.current[categoryId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <Box 
      sx={{ 
        pb: { xs: 14, sm: 16 },
        backgroundColor: '#F8F9FA',
        width: '100%',
        height: '100%',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#1E3A5F',
          color: 'white',
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.15rem', sm: '1.35rem' },
            }}
          >
            Menu
          </Typography>
        </Container>
      </Box>

      {/* Search & Filters */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E0E0E0',
          py: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F8F9FA',
                '& fieldset': {
                  borderColor: '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: '#1E3A5F',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1E3A5F',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#6C757D', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')} size="small">
                    <Clear sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Filter Buttons */}
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
            <Button
              variant={vegFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setVegFilter('all')}
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                borderColor: '#E0E0E0',
                color: vegFilter === 'all' ? 'white' : '#2C3E50',
                backgroundColor: vegFilter === 'all' ? '#1E3A5F' : 'transparent',
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: '#1E3A5F',
                  backgroundColor: vegFilter === 'all' ? '#2C5282' : 'rgba(30, 58, 95, 0.04)',
                },
              }}
            >
              All Items
            </Button>
            <Button
              variant={vegFilter === 'veg' ? 'contained' : 'outlined'}
              onClick={() => setVegFilter('veg')}
              size="small"
              startIcon={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    border: `2px solid ${vegFilter === 'veg' ? 'white' : '#4CAF50'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: vegFilter === 'veg' ? 'white' : '#4CAF50',
                    }}
                  />
                </Box>
              }
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                borderColor: vegFilter === 'veg' ? '#4CAF50' : '#E0E0E0',
                color: vegFilter === 'veg' ? 'white' : '#2C3E50',
                backgroundColor: vegFilter === 'veg' ? '#4CAF50' : 'transparent',
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: '#4CAF50',
                  backgroundColor: vegFilter === 'veg' ? '#45A049' : 'rgba(76, 175, 80, 0.04)',
                },
              }}
            >
              Veg
            </Button>
            <Button
              variant={vegFilter === 'non-veg' ? 'contained' : 'outlined'}
              onClick={() => setVegFilter('non-veg')}
              size="small"
              startIcon={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    border: `2px solid ${vegFilter === 'non-veg' ? 'white' : '#F44336'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      backgroundColor: vegFilter === 'non-veg' ? 'white' : '#F44336',
                    }}
                  />
                </Box>
              }
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                borderColor: vegFilter === 'non-veg' ? '#F44336' : '#E0E0E0',
                color: vegFilter === 'non-veg' ? 'white' : '#2C3E50',
                backgroundColor: vegFilter === 'non-veg' ? '#F44336' : 'transparent',
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: '#F44336',
                  backgroundColor: vegFilter === 'non-veg' ? '#E53935' : 'rgba(244, 67, 54, 0.04)',
                },
              }}
            >
              Non-Veg
            </Button>
          </Stack>

          {/* Results Count */}
          {(searchQuery || vegFilter !== 'all') && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, fontWeight: 500, fontSize: '0.8rem' }}
            >
              {filteredGroups.reduce((acc, group) => acc + group.items.length, 0)} items found
            </Typography>
          )}
        </Container>
      </Box>

      {/* Category Tabs */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E0E0E0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Tabs
            value={activeCategory}
            onChange={(e, newValue) => handleCategoryClick(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 42,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: '#6C757D',
                minHeight: 42,
                py: 1,
                '&.Mui-selected': {
                  color: '#1E3A5F',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1E3A5F',
                height: 2,
              },
            }}
          >
            <Tab label="All" value="all" />
            {allCategories.map((category) => (
              <Tab
                key={category.id}
                label={`${category.name} (${category.itemCount || 0})`}
                value={category.id}
              />
            ))}
          </Tabs>
        </Container>
      </Box>

      {/* Menu Items */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 2.5 }}>
        {filteredGroups.map((group, index) => (
          <Box key={group.id} sx={{ mb: 3 }}>
            <Box
              id={group.id}
              ref={(el: HTMLDivElement | null) => (categoryRefs.current[group.id] = el)}
            >
              {/* Category Header */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#1E3A5F',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    mb: 0.25,
                  }}
                >
                  {group.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: '0.8rem' }}
                >
                  {group.description || `Explore our ${group.name.toLowerCase()}`}
                </Typography>
              </Box>

              {/* Menu Items */}
              <Stack spacing={1.5}>
                {group.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={onAddToCart}
                    quantityInCart={getItemQuantityInCart(item.id)}
                    imageUrl={getMenuItemImage(item)}
                  />
                ))}
              </Stack>
            </Box>

            {index < filteredGroups.length - 1 && (
              <Divider sx={{ my: 3 }} />
            )}
          </Box>
        ))}

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              backgroundColor: 'white',
              borderRadius: 1,
              border: '1px solid #E0E0E0',
            }}
          >
            <Search sx={{ fontSize: 56, color: '#CED4DA', mb: 1.5 }} />
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 0.75, fontWeight: 600, fontSize: '1.1rem' }}
            >
              No items found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.85rem' }}>
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : 'Try adjusting your filters'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              size="small"
              onClick={() => {
                setSearchQuery('');
                setVegFilter('all');
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#1E3A5F',
                color: '#1E3A5F',
                fontSize: '0.85rem',
                '&:hover': {
                  borderColor: '#2C5282',
                  backgroundColor: 'rgba(30, 58, 95, 0.04)',
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

// Menu Item Card Component
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
  const theme = useTheme();
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

  const VegNonVegIcon = ({ isVeg }: { isVeg: boolean }) => (
    <Box
      sx={{
        width: 14,
        height: 14,
        border: `2px solid ${isVeg ? '#4CAF50' : '#F44336'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: isVeg ? '50%' : 0,
          backgroundColor: isVeg ? '#4CAF50' : '#F44336',
        }}
      />
    </Box>
  );

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        border: '1px solid #E0E0E0',
        boxShadow: 'none',
        '&:hover': {
          borderColor: '#1E3A5F',
          boxShadow: '0 1px 4px rgba(30, 58, 95, 0.08)',
        },
      }}
    >
      {/* Left - Content */}
      <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
        {/* Name and Veg/Non-Veg */}
        <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 0.75 }}>
          <VegNonVegIcon isVeg={item.isVeg || false} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              color: '#2C3E50',
              flex: 1,
              lineHeight: 1.3,
            }}
          >
            {item.name}
          </Typography>
        </Stack>

        {/* Price */}
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: '#1E3A5F',
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
            }}
          >
            ₹{item.price}
          </Typography>
          {item.originalPrice && (
            <>
              <Typography
                variant="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: '#6C757D',
                  fontSize: '0.8rem',
                }}
              >
                ₹{item.originalPrice}
              </Typography>
              {item.discount && (
                <Chip
                  label={`${item.discount}% OFF`}
                  size="small"
                  sx={{
                    backgroundColor: '#DC3545',
                    color: 'white',
                    fontWeight: 600,
                    height: 18,
                    fontSize: '0.65rem',
                  }}
                />
              )}
            </>
          )}
        </Stack>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
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

        {/* Meta Info */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 0.75 }}>
          {item.rating && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Rating value={item.rating} size="small" readOnly precision={0.5} sx={{ fontSize: '0.9rem' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                ({item.reviewCount})
              </Typography>
            </Stack>
          )}

          <Stack direction="row" spacing={0.25} alignItems="center">
            <Timer sx={{ fontSize: 14, color: '#6C757D' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.7rem' }}>
              {item.preparationTime} min
            </Typography>
          </Stack>

          {item.spicyLevel && item.spicyLevel > 0 && (
            <Stack direction="row" spacing={0.15} alignItems="center">
              {[...Array(Math.min(item.spicyLevel, 3))].map((_, i) => (
                <LocalFireDepartment
                  key={i}
                  sx={{
                    fontSize: 14,
                    color: item.spicyLevel === 1 ? '#FFA726' : item.spicyLevel === 2 ? '#FF7043' : '#F44336',
                  }}
                />
              ))}
            </Stack>
          )}

          {item.isNew && (
            <Chip label="New" size="small" sx={{ backgroundColor: '#28A745', color: 'white', fontWeight: 600, height: 18, fontSize: '0.65rem' }} />
          )}
          {item.isPopular && (
            <Chip label="Popular" size="small" sx={{ backgroundColor: '#FFC107', color: 'white', fontWeight: 600, height: 18, fontSize: '0.65rem' }} />
          )}
        </Stack>
      </Box>

      {/* Right - Image and Add Button */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
          gap: 1,
        }}
      >
        {/* Image */}
        <Box
          sx={{
            width: { xs: 90, sm: 110 },
            height: { xs: 90, sm: 110 },
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid #E0E0E0',
            backgroundColor: '#F8F9FA',
            flexShrink: 0,
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
              }}
            >
              <Restaurant sx={{ fontSize: 40, color: '#CED4DA' }} />
            </Box>
          )}
        </Box>

        {/* Add to Cart Button */}
        <Box sx={{ width: { xs: 90, sm: 110 } }}>
          {quantityInCart === 0 ? (
            <Button
              variant="contained"
              fullWidth
              size="small"
              onClick={() => onAddToCart(item)}
              sx={{
                backgroundColor: '#1E3A5F',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                py: 0.75,
                fontSize: '0.8rem',
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
              spacing={0.5}
              alignItems="center"
              justifyContent="space-between"
              sx={{
                backgroundColor: '#F0F4F8',
                borderRadius: 1,
                p: 0.5,
                border: '1px solid #1E3A5F',
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
                    backgroundColor: '#E9ECEF',
                  },
                }}
              >
                <Remove sx={{ fontSize: 14 }} />
              </IconButton>

              <Typography variant="body2" fontWeight={700} color="#1E3A5F" sx={{ fontSize: '0.85rem', minWidth: 20, textAlign: 'center' }}>
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
                    backgroundColor: '#E9ECEF',
                  },
                }}
              >
                <Add sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default MenuFragment;

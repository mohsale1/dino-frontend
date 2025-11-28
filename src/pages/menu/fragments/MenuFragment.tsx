import React, { useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  useTheme,
  Stack,
  Button,
  Chip,
  alpha,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Rating,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { 
  Search, 
  Clear, 
  Add, 
  Remove, 
  LocalFireDepartment,
  Timer,
  Favorite,
  FavoriteBorder,
  FilterList,
  Close,
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
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  // Filter items based on veg/non-veg selection and search query
  const getFilteredGroups = () => {
    return groupedMenuItems.map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Veg/Non-veg filter
        const matchesVegFilter = 
          vegFilter === 'all' || 
          (vegFilter === 'veg' && item.isVeg) || 
          (vegFilter === 'non-veg' && !item.isVeg);
        
        // Search filter
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
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  };

  return (
    <Box sx={{ pb: 10, backgroundColor: theme.palette.background.default }}>
      {/* Header Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 3, sm: 4 },
          mb: 3,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              fontSize: { xs: '1.75rem', sm: '2.125rem' },
            }}
          >
            Our Menu
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              mt: 1,
              opacity: 0.9,
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Explore our delicious offerings
          </Typography>
        </Container>
      </Box>

      {/* Hero Search Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 1)} 0%, ${alpha(theme.palette.grey[100], 0.8)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          mb: 4,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Decorative Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.palette.primary.main} 2px, transparent 2px),
                             radial-gradient(circle at 80% 80%, ${theme.palette.primary.main} 2px, transparent 2px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, sm: 5 } }}>
          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                mb: 2,
                textAlign: 'center',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Find Your Favorite Dish
            </Typography>
            <Box sx={{ maxWidth: 700, mx: 'auto' }}>
              <TextField
                fullWidth
                placeholder="Search for dishes, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 3,
                    border: `2px solid ${theme.palette.divider}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    },
                    '&.Mui-focused': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: { xs: 2, sm: 2.5 },
                    px: 2,
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'primary.main', fontSize: { xs: 26, sm: 30 } }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setSearchQuery('')}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main',
                          },
                        }}
                      >
                        <Clear sx={{ fontSize: 22 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Food Preference Filter */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ gap: 1.5 }}>
              <IconButton
                onClick={() => setVegFilter('all')}
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  border: `2px solid ${vegFilter === 'all' ? theme.palette.primary.main : theme.palette.divider}`,
                  backgroundColor: vegFilter === 'all' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: vegFilter === 'all' ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.grey[200], 0.5),
                    borderColor: theme.palette.primary.main,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>🍽️</Typography>
              </IconButton>

              <IconButton
                onClick={() => setVegFilter('veg')}
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  border: `2px solid ${vegFilter === 'veg' ? '#4CAF50' : theme.palette.divider}`,
                  backgroundColor: vegFilter === 'veg' ? alpha('#4CAF50', 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: vegFilter === 'veg' ? alpha('#4CAF50', 0.15) : alpha('#4CAF50', 0.05),
                    borderColor: '#4CAF50',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    border: `3px solid #4CAF50`,
                    borderRadius: '50%',
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
                      backgroundColor: '#4CAF50',
                    }}
                  />
                </Box>
              </IconButton>

              <IconButton
                onClick={() => setVegFilter('non-veg')}
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  border: `2px solid ${vegFilter === 'non-veg' ? '#F44336' : theme.palette.divider}`,
                  backgroundColor: vegFilter === 'non-veg' ? alpha('#F44336', 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: vegFilter === 'non-veg' ? alpha('#F44336', 0.15) : alpha('#F44336', 0.05),
                    borderColor: '#F44336',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    border: `3px solid #F44336`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: '#F44336',
                    }}
                  />
                </Box>
              </IconButton>
            </Stack>
          </Box>



          {/* Results Info */}
          {(searchQuery || vegFilter !== 'all') && (
            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  textAlign: 'center',
                }}
              >
                {filteredGroups.reduce((acc, group) => acc + group.items.length, 0)} items found
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg">

        {filteredGroups.map((group, index) => (
          <Box key={group.id}>
            <Box
              id={group.id}
              ref={(el: HTMLDivElement | null) => (categoryRefs.current[group.id] = el)}
            >
              {/* Category Header */}
              <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
                <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5, color: 'text.primary' }}>
                  {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.description || `Discover our delicious ${group.name.toLowerCase()}`}
                </Typography>
              </Box>

              {/* Menu Items List */}
              <Stack spacing={0}>
                {group.items.map((item) => (
                  <MenuItemRectangleCard
                    key={item.id}
                    item={item}
                    onAddToCart={onAddToCart}
                    quantityInCart={getItemQuantityInCart(item.id)}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={isFavorite(item.id)}
                    imageUrl={getMenuItemImage(item)}
                  />
                ))}
              </Stack>
            </Box>

            {/* Category Separator */}
            {index < filteredGroups.length - 1 && (
              <Box
                sx={{
                  height: { xs: 8, sm: 10 },
                  backgroundColor: alpha(theme.palette.grey[200], 0.5),
                  my: { xs: 3, sm: 4 },
                }}
              />
            )}
          </Box>
        ))}

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: 'background.paper',
              borderRadius: 3,
              border: `2px dashed ${theme.palette.grey[300]}`,
            }}
          >
            <Search sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="600">
              No items found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : 'Try adjusting your filters'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={() => {
                setSearchQuery('');
                setVegFilter('all');
                setActiveCategory('all');
              }}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Container>

      {/* Floating Quick Access Button */}
      <Fab
        color="primary"
        onClick={() => setShowQuickAccess(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 90, sm: 100 },
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            transform: 'scale(1.1)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.3)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <FilterList />
      </Fab>

      {/* Quick Access Drawer */}
      <Drawer
        anchor="bottom"
        open={showQuickAccess}
        onClose={() => setShowQuickAccess(false)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '70vh',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="700">
              Quick Access
            </Typography>
            <IconButton onClick={() => setShowQuickAccess(false)} size="small">
              <Close />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Categories List */}
          <List sx={{ p: 0 }}>
            {/* All Categories */}
            <ListItem disablePadding>
              <ListItemButton
                selected={activeCategory === 'all'}
                onClick={() => {
                  handleCategoryClick('all');
                  setShowQuickAccess(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: activeCategory === 'all' ? theme.palette.primary.main : alpha(theme.palette.grey[400], 0.2),
                      color: activeCategory === 'all' ? 'white' : 'text.secondary',
                    }}
                  >
                    🍽️
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="All Categories"
                  secondary={`${allCategories.reduce((acc, cat) => acc + (cat.itemCount || 0), 0)} items`}
                  primaryTypographyProps={{
                    fontWeight: activeCategory === 'all' ? 700 : 600,
                    color: activeCategory === 'all' ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>

            {/* Individual Categories */}
            {allCategories.map((category) => (
              <ListItem key={category.id} disablePadding>
                <ListItemButton
                  selected={activeCategory === category.id}
                  onClick={() => {
                    handleCategoryClick(category.id);
                    setShowQuickAccess(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: activeCategory === category.id ? theme.palette.primary.main : alpha(theme.palette.grey[400], 0.2),
                        color: activeCategory === category.id ? 'white' : 'text.secondary',
                        fontSize: '1.5rem',
                      }}
                    >
                      {category.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={category.name}
                    secondary={`${category.itemCount || 0} items`}
                    primaryTypographyProps={{
                      fontWeight: activeCategory === category.id ? 700 : 600,
                      color: activeCategory === category.id ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

// Rectangle Menu Item Card Component
interface MenuItemRectangleCardProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType) => void;
  quantityInCart: number;
  onToggleFavorite: (itemId: string) => void;
  isFavorite: boolean;
  imageUrl: string;
}

const MenuItemRectangleCard: React.FC<MenuItemRectangleCardProps> = ({
  item,
  onAddToCart,
  quantityInCart,
  onToggleFavorite,
  isFavorite,
  imageUrl,
}) => {
  const theme = useTheme();
  const { updateQuantity, removeItem } = useCart();

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        py: { xs: 2, sm: 2.5 },
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      {/* Left Side - Content */}
      <Box
        sx={{
          flex: 1,
          pr: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top Section */}
        <Box>
          {/* Name and Veg/Non-Veg Indicator */}
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
            <VegNonVegIcon isVeg={item.isVeg || false} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: 1.3,
                flex: 1,
                color: 'text.primary',
              }}
            >
              {item.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onToggleFavorite(item.id)}
              sx={{
                p: 0.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              {isFavorite ? (
                <Favorite sx={{ fontSize: 20, color: theme.palette.error.main }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: 20, color: 'text.secondary' }} />
              )}
            </IconButton>
          </Stack>

          {/* Price */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight="700" color="primary.main">
              ₹{item.price}
            </Typography>
            {item.originalPrice && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: 'text.disabled',
                  fontSize: '0.875rem',
                }}
              >
                ₹{item.originalPrice}
              </Typography>
            )}
          </Stack>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              lineHeight: 1.5,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>

          {/* Meta Info */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 1.5 }}>
            {/* Rating */}
            {item.rating && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating value={item.rating} size="small" readOnly precision={0.5} />
                <Typography variant="caption" color="text.secondary">
                  ({item.reviewCount})
                </Typography>
              </Stack>
            )}

            {/* Preparation Time */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Timer sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {item.preparationTime} min
              </Typography>
            </Stack>

            {/* Spicy Level */}
            {item.spicyLevel && item.spicyLevel > 0 && (
              <Stack direction="row" spacing={0.3} alignItems="center">
                {[...Array(Math.min(item.spicyLevel, 3))].map((_, i) => (
                  <LocalFireDepartment
                    key={i}
                    sx={{
                      fontSize: 14,
                      color:
                        item.spicyLevel === 1
                          ? '#FFA726'
                          : item.spicyLevel === 2
                          ? '#FF7043'
                          : '#F44336',
                    }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Bottom Section - Add to Cart */}
        <Box>
          {quantityInCart === 0 ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onAddToCart(item)}
              sx={{
                px: 3,
                py: 0.75,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                fontSize: '0.875rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Add to Cart
            </Button>
          ) : (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                display: 'inline-flex',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 1.5,
                p: 0.5,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            >
              <IconButton
                size="small"
                onClick={handleDecreaseQuantity}
                sx={{
                  color: 'primary.main',
                  backgroundColor: 'background.paper',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>

              <Typography variant="body1" fontWeight="700" color="primary.main" sx={{ minWidth: 20, textAlign: 'center' }}>
                {quantityInCart}
              </Typography>

              <IconButton
                size="small"
                onClick={handleIncreaseQuantity}
                sx={{
                  color: 'primary.main',
                  backgroundColor: 'background.paper',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Right Side - Image */}
      <Box
        sx={{
          width: { xs: 100, sm: 120, md: 140 },
          height: { xs: 100, sm: 120, md: 140 },
          flexShrink: 0,
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={item.name}
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
              backgroundColor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" color="text.disabled">
              🍽️
            </Typography>
          </Box>
        )}

        {/* Badges on Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {item.isNew && (
            <Chip
              label="New"
              size="small"
              sx={{
                backgroundColor: theme.palette.success.main,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 18,
              }}
            />
          )}
          {item.isPopular && (
            <Chip
              label="Popular"
              size="small"
              sx={{
                backgroundColor: theme.palette.warning.main,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 18,
              }}
            />
          )}
          {item.discount && (
            <Chip
              label={`${item.discount}% OFF`}
              size="small"
              sx={{
                backgroundColor: theme.palette.error.main,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 18,
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MenuFragment;
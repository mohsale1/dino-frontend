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
  Card,
  CardContent,
  AppBar,
  Toolbar,
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
    <Box 
      sx={{ 
        pb: 10, 
        backgroundColor: theme.palette.background.default,
        width: '100%',
        overflowX: 'hidden', // Prevent horizontal scroll
        minHeight: '100vh',
      }}
    >
      {/* Top Navigation Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.primary.dark}`,
          top: 0,
          zIndex: 100,
        }}
      >
        <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Restaurant sx={{ color: 'white', fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'white',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Our Menu
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Search & Filter Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 1)} 0%, ${alpha(theme.palette.grey[100], 0.8)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          mb: { xs: 2, sm: 3, md: 4 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: '100%',
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

        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 1, 
            py: { xs: 3, sm: 4, md: 5 },
            px: { xs: 2, sm: 3 },
          }}
        >
          {/* Search Bar */}
          <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                mb: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
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
                    borderRadius: { xs: 2, sm: 3 },
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
                    py: { xs: 1.75, sm: 2, md: 2.5 },
                    px: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1.05rem' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 26, md: 30 } }} />
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
                        <Clear sx={{ fontSize: { xs: 20, sm: 22 } }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Food Preference Filter */}
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Stack 
              direction="row" 
              spacing={{ xs: 1.5, sm: 2 }} 
              justifyContent="center" 
              flexWrap="wrap" 
              sx={{ gap: { xs: 1, sm: 1.5 } }}
            >
              <IconButton
                onClick={() => setVegFilter('all')}
                sx={{
                  width: { xs: 44, sm: 48, md: 56 },
                  height: { xs: 44, sm: 48, md: 56 },
                  border: `2px solid ${vegFilter === 'all' ? theme.palette.primary.main : theme.palette.divider}`,
                  backgroundColor: vegFilter === 'all' ? alpha(theme.palette.primary.main, 0.1) : 'white',
                  '&:hover': {
                    backgroundColor: vegFilter === 'all' ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.grey[200], 0.5),
                    borderColor: theme.palette.primary.main,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.75rem' } }}>🍽️</Typography>
              </IconButton>

              <IconButton
                onClick={() => setVegFilter('veg')}
                sx={{
                  width: { xs: 44, sm: 48, md: 56 },
                  height: { xs: 44, sm: 48, md: 56 },
                  border: `2px solid ${vegFilter === 'veg' ? '#4CAF50' : theme.palette.divider}`,
                  backgroundColor: vegFilter === 'veg' ? alpha('#4CAF50', 0.1) : 'white',
                  '&:hover': {
                    backgroundColor: vegFilter === 'veg' ? alpha('#4CAF50', 0.15) : alpha('#4CAF50', 0.05),
                    borderColor: '#4CAF50',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    width: { xs: 16, sm: 18 },
                    height: { xs: 16, sm: 18 },
                    border: `3px solid #4CAF50`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 7, sm: 8 },
                      height: { xs: 7, sm: 8 },
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                    }}
                  />
                </Box>
              </IconButton>

              <IconButton
                onClick={() => setVegFilter('non-veg')}
                sx={{
                  width: { xs: 44, sm: 48, md: 56 },
                  height: { xs: 44, sm: 48, md: 56 },
                  border: `2px solid ${vegFilter === 'non-veg' ? '#F44336' : theme.palette.divider}`,
                  backgroundColor: vegFilter === 'non-veg' ? alpha('#F44336', 0.1) : 'white',
                  '&:hover': {
                    backgroundColor: vegFilter === 'non-veg' ? alpha('#F44336', 0.15) : alpha('#F44336', 0.05),
                    borderColor: '#F44336',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    width: { xs: 16, sm: 18 },
                    height: { xs: 16, sm: 18 },
                    border: `3px solid #F44336`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 7, sm: 8 },
                      height: { xs: 7, sm: 8 },
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
                mt: { xs: 2, sm: 3 },
                pt: { xs: 2, sm: 3 },
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  textAlign: 'center',
                }}
              >
                {filteredGroups.reduce((acc, group) => acc + group.items.length, 0)} items found
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      <Container 
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3 } }}
      >
        {filteredGroups.map((group, index) => (
          <Box key={group.id}>
            <Box
              id={group.id}
              ref={(el: HTMLDivElement | null) => (categoryRefs.current[group.id] = el)}
            >
              {/* Category Header */}
              <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
                <Typography 
                  variant="h5" 
                  fontWeight="700" 
                  sx={{ 
                    mb: 0.5, 
                    color: 'text.primary',
                    fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' },
                  }}
                >
                  {group.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
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
                  height: { xs: 6, sm: 8, md: 10 },
                  backgroundColor: alpha(theme.palette.grey[200], 0.5),
                  my: { xs: 2.5, sm: 3, md: 4 },
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
              py: { xs: 6, sm: 8 },
              backgroundColor: 'background.paper',
              borderRadius: { xs: 2, sm: 3 },
              border: `2px dashed ${theme.palette.grey[300]}`,
            }}
          >
            <Search sx={{ fontSize: { xs: 48, sm: 56, md: 64 }, color: 'text.disabled', mb: 2 }} />
            <Typography 
              variant="h6" 
              color="text.secondary" 
              gutterBottom 
              fontWeight="600"
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              No items found
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
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
                px: { xs: 2.5, sm: 3 },
                py: { xs: 0.75, sm: 1 },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
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
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
  const [showFullDescription, setShowFullDescription] = useState(false);
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
        width: { xs: 12, sm: 14 },
        height: { xs: 12, sm: 14 },
        border: `2px solid ${isVeg ? '#4CAF50' : '#F44336'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: { xs: 5, sm: 6 },
          height: { xs: 5, sm: 6 },
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
        gap: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      {/* Left Side - Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0, // Prevent flex item overflow
        }}
      >
        {/* Top Section */}
        <Box>
          {/* Name and Veg/Non-Veg Indicator */}
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: { xs: 0.75, sm: 1 } }}>
            <VegNonVegIcon isVeg={item.isVeg || false} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                lineHeight: 1.3,
                flex: 1,
                color: 'text.primary',
                wordBreak: 'break-word',
              }}
            >
              {item.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onToggleFavorite(item.id)}
              sx={{
                p: { xs: 0.25, sm: 0.5 },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              {isFavorite ? (
                <Favorite sx={{ fontSize: { xs: 18, sm: 20 }, color: theme.palette.error.main }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: { xs: 18, sm: 20 }, color: 'text.secondary' }} />
              )}
            </IconButton>
          </Stack>

          {/* Price */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 0.75, sm: 1 } }}>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              color="primary.main"
              sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
            >
              ₹{item.price}
            </Typography>
            {item.originalPrice && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: 'text.disabled',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                ₹{item.originalPrice}
              </Typography>
            )}
          </Stack>

          {/* Description */}
          <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.5,
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                display: showFullDescription ? 'block' : '-webkit-box',
                WebkitLineClamp: showFullDescription ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.description}
            </Typography>
            {item.description && item.description.length > 100 && (
              <Button
                size="small"
                onClick={() => setShowFullDescription(!showFullDescription)}
                sx={{
                  p: 0,
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  fontWeight: 600,
                  mt: 0.5,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
              </Button>
            )}
          </Box>

          {/* Meta Info */}
          <Stack 
            direction="row" 
            spacing={{ xs: 1, sm: 1.5, md: 2 }} 
            alignItems="center" 
            flexWrap="wrap" 
            sx={{ mb: { xs: 1, sm: 1.5 }, gap: { xs: 0.5, sm: 0.75 } }}
          >
            {/* Rating */}
            {item.rating && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating 
                  value={item.rating} 
                  size="small" 
                  readOnly 
                  precision={0.5}
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  ({item.reviewCount})
                </Typography>
              </Stack>
            )}

            {/* Preparation Time */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Timer sx={{ fontSize: { xs: 12, sm: 14 }, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
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
                      fontSize: { xs: 12, sm: 14 },
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
      </Box>

      {/* Right Side - Image and Add to Cart */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1, sm: 1.5 },
          flexShrink: 0,
        }}
      >
        {/* Image */}
        <Box
          sx={{
            width: { xs: 90, sm: 110, md: 130 },
            height: { xs: 90, sm: 110, md: 130 },
            position: 'relative',
            borderRadius: { xs: 1.5, sm: 2 },
            overflow: 'hidden',
          }}
        >
          {imageUrl && !imageError ? (
            <Box
              component="img"
              src={imageUrl}
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
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Restaurant 
                sx={{ 
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  color: alpha(theme.palette.primary.main, 0.4),
                }} 
              />
            </Box>
          )}

          {/* Badges on Image */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 4, sm: 6 },
              right: { xs: 4, sm: 6 },
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
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  height: { xs: 16, sm: 18 },
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
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  height: { xs: 16, sm: 18 },
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
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  height: { xs: 16, sm: 18 },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Add to Cart Button Below Image */}
        <Box sx={{ width: { xs: 90, sm: 110, md: 130 } }}>
          {quantityInCart === 0 ? (
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => onAddToCart(item)}
              sx={{
                py: { xs: 0.5, sm: 0.75 },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 1,
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
                  width: { xs: 22, sm: 24 },
                  height: { xs: 22, sm: 24 },
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <Remove sx={{ fontSize: { xs: 12, sm: 14 } }} />
              </IconButton>

              <Typography 
                variant="body2" 
                fontWeight="700" 
                color="primary.main" 
                sx={{ 
                  minWidth: { xs: 16, sm: 18 }, 
                  textAlign: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {quantityInCart}
              </Typography>

              <IconButton
                size="small"
                onClick={handleIncreaseQuantity}
                sx={{
                  color: 'primary.main',
                  backgroundColor: 'background.paper',
                  width: { xs: 22, sm: 24 },
                  height: { xs: 22, sm: 24 },
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <Add sx={{ fontSize: { xs: 12, sm: 14 } }} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MenuFragment;

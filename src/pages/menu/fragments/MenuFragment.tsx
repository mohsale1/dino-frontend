import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Divider,
  alpha,
  Tabs,
  Tab,
  InputAdornment,
  TextField,
  IconButton,
  Collapse,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  Close,
  Restaurant,
  LocalOffer,
} from '@mui/icons-material';
import { MenuItemType, CategoryType } from '../../../hooks/useMenuData';
import {
  MenuItemCard,
} from '../../../components/menu';

export type VegFilterType = 'all' | 'veg' | 'non-veg';

interface MenuFragmentProps {
  groupedMenuItems: Array<CategoryType & { items: MenuItemType[] }>;
  categoryRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  allCategories: CategoryType[];
  onAddToCart: (item: MenuItemType) => void;
  getItemQuantityInCart: (itemId: string) => number;
  getMenuItemImage: (item: MenuItemType) => string;
}

const MenuFragment: React.FC<MenuFragmentProps> = ({
  groupedMenuItems,
  categoryRefs,
  allCategories,
  onAddToCart,
  getItemQuantityInCart,
  getMenuItemImage,
}) => {
  const [vegFilter, setVegFilter] = useState<VegFilterType>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
        
        const matchesCategory = 
          activeCategory === 'all' || 
          group.id === activeCategory;
        
        return matchesVegFilter && matchesSearch && matchesCategory;
      }),
    })).filter(group => group.items.length > 0);
  };

  const filteredGroups = getFilteredGroups();
  const totalFilteredItems = filteredGroups.reduce((acc, group) => acc + group.items.length, 0);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        const element = categoryRefs.current[categoryId];
        if (element) {
          const offset = 180; // Account for sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setVegFilter('all');
    setActiveCategory('all');
  };

  const hasActiveFilters = searchQuery !== '' || vegFilter !== 'all' || activeCategory !== 'all';

  return (
    <Box 
      sx={{ 
        pb: { xs: 10, sm: 12 },
        backgroundColor: '#F8F9FA',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sticky Header with Search and Filters */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'white',
          borderBottom: '2px solid #E0E0E0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        {/* Title Bar */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
            color: 'white',
            py: 1.5,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap={1}>
                <Restaurant sx={{ fontSize: 24 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  Our Menu
                </Typography>
              </Stack>
              <Chip
                label={`${totalFilteredItems} items`}
                size="small"
                sx={{
                  backgroundColor: alpha('#FFFFFF', 0.2),
                  color: 'white',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
            </Stack>
          </Container>
        </Box>

        {/* Search Bar */}
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#6C757D', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Close sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F8F9FA',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#F0F4F8',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                },
              }}
            />
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                backgroundColor: showFilters ? '#1E3A5F' : '#F8F9FA',
                color: showFilters ? 'white' : '#1E3A5F',
                '&:hover': {
                  backgroundColor: showFilters ? '#2C5282' : '#E0E0E0',
                },
              }}
            >
              <Badge badgeContent={hasActiveFilters ? '•' : 0} color="error">
                <FilterList />
              </Badge>
            </IconButton>
          </Stack>
        </Container>

        {/* Expandable Filters */}
        <Collapse in={showFilters}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pb: 1.5 }}>
            <Box
              sx={{
                backgroundColor: '#F8F9FA',
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#6C757D',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  mb: 1,
                  display: 'block',
                }}
              >
                Dietary Preference
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => setVegFilter('all')}
                  sx={{
                    backgroundColor: vegFilter === 'all' ? '#1E3A5F' : 'white',
                    color: vegFilter === 'all' ? 'white' : '#2C3E50',
                    fontWeight: 600,
                    border: '2px solid',
                    borderColor: vegFilter === 'all' ? '#1E3A5F' : '#E0E0E0',
                    '&:hover': {
                      backgroundColor: vegFilter === 'all' ? '#2C5282' : '#F0F4F8',
                    },
                  }}
                />
                <Chip
                  label="🟢 Vegetarian"
                  onClick={() => setVegFilter('veg')}
                  sx={{
                    backgroundColor: vegFilter === 'veg' ? '#4CAF50' : 'white',
                    color: vegFilter === 'veg' ? 'white' : '#2C3E50',
                    fontWeight: 600,
                    border: '2px solid',
                    borderColor: vegFilter === 'veg' ? '#4CAF50' : '#E0E0E0',
                    '&:hover': {
                      backgroundColor: vegFilter === 'veg' ? '#45A049' : '#F0F4F8',
                    },
                  }}
                />
                <Chip
                  label="🔴 Non-Vegetarian"
                  onClick={() => setVegFilter('non-veg')}
                  sx={{
                    backgroundColor: vegFilter === 'non-veg' ? '#F44336' : 'white',
                    color: vegFilter === 'non-veg' ? 'white' : '#2C3E50',
                    fontWeight: 600,
                    border: '2px solid',
                    borderColor: vegFilter === 'non-veg' ? '#F44336' : '#E0E0E0',
                    '&:hover': {
                      backgroundColor: vegFilter === 'non-veg' ? '#E53935' : '#F0F4F8',
                    },
                  }}
                />
              </Stack>

              {hasActiveFilters && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #E0E0E0' }}>
                  <Chip
                    label="Clear All Filters"
                    onClick={handleClearFilters}
                    onDelete={handleClearFilters}
                    size="small"
                    sx={{
                      backgroundColor: '#FFF3E0',
                      color: '#F57C00',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#FFE0B2',
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Container>
        </Collapse>

        {/* Category Tabs */}
        <Box
          sx={{
            borderBottom: '1px solid #E0E0E0',
            backgroundColor: 'white',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#1E3A5F',
              borderRadius: 2,
            },
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Tabs
              value={activeCategory}
              onChange={(_, value) => handleCategoryClick(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#6C757D',
                  '&.Mui-selected': {
                    color: '#1E3A5F',
                    fontWeight: 700,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1E3A5F',
                  height: 3,
                },
              }}
            >
              <Tab label="All Items" value="all" />
              {allCategories.map((category) => (
                <Tab
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Tabs>
          </Container>
        </Box>
      </Box>

      {/* Menu Items Content */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3, flex: 1 }}>
        {filteredGroups.length > 0 ? (
          <Stack spacing={4}>
            {filteredGroups.map((group, groupIndex) => (
              <Box key={group.id}>
                {/* Category Header */}
                <Box
                  id={group.id}
                  ref={(el: HTMLDivElement | null) => (categoryRefs.current[group.id] = el)}
                  sx={{
                    mb: 2.5,
                    pb: 1.5,
                    borderBottom: '3px solid',
                    borderImage: 'linear-gradient(90deg, #1E3A5F 0%, transparent 100%) 1',
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: '#1E3A5F',
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          mb: 0.5,
                          letterSpacing: '-0.5px',
                        }}
                      >
                        {group.name}
                      </Typography>
                      {group.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: '0.85rem', fontWeight: 500 }}
                        >
                          {group.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      icon={<LocalOffer sx={{ fontSize: 16 }} />}
                      label={`${group.items.length} ${group.items.length === 1 ? 'item' : 'items'}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#1E3A5F', 0.1),
                        color: '#1E3A5F',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: 28,
                        '& .MuiChip-icon': {
                          color: '#1E3A5F',
                        },
                      }}
                    />
                  </Stack>
                </Box>

                {/* Menu Items Grid */}
                <Stack spacing={2}>
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

                {/* Category Separator */}
                {groupIndex < filteredGroups.length - 1 && (
                  <Divider
                    sx={{
                      mt: 4,
                      borderColor: alpha('#1E3A5F', 0.1),
                      borderWidth: 1,
                    }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          // Empty State
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha('#1E3A5F', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Search sx={{ fontSize: 40, color: '#1E3A5F' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#2C3E50',
                mb: 1,
              }}
            >
              No items found
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
            >
              {searchQuery
                ? `No results for "${searchQuery}". Try different keywords or filters.`
                : 'No items match your current filters. Try adjusting your preferences.'}
            </Typography>
            {hasActiveFilters && (
              <Chip
                label="Clear All Filters"
                onClick={handleClearFilters}
                onDelete={handleClearFilters}
                sx={{
                  backgroundColor: '#1E3A5F',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#2C5282',
                  },
                }}
              />
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MenuFragment;
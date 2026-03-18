import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Divider,
  alpha,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search,
  Close,
  Restaurant,
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
  const totalFilteredItems = filteredGroups.reduce((acc, group) => acc + group.items.length, 0);

  const handleClearFilters = () => {
    setSearchQuery('');
    setVegFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || vegFilter !== 'all';

  return (
    <Box 
      sx={{ 
        pb: { xs: 10, sm: 12 },
        backgroundColor: '#F8F9FA',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
          color: 'white',
          py: { xs: 2, sm: 2.5 },
          borderBottom: '3px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap={1}>
              <Restaurant sx={{ fontSize: { xs: 22, sm: 26 } }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.15rem', sm: '1.35rem' },
                }}
              >
                Our Menu
              </Typography>
            </Stack>
            <Chip
              label={`${totalFilteredItems} items`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Search and Filters */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderBottom: '2px solid #E0E0E0',
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
              mb: 1.5,
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

          {/* Filter Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            <Chip
              label="All"
              onClick={() => setVegFilter('all')}
              sx={{
                backgroundColor: vegFilter === 'all' ? '#1E3A5F' : 'white',
                color: vegFilter === 'all' ? 'white' : '#2C3E50',
                fontWeight: 600,
                fontSize: '0.8rem',
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
                fontSize: '0.8rem',
                border: '2px solid',
                borderColor: vegFilter === 'veg' ? '#4CAF50' : '#E0E0E0',
                '&:hover': {
                  backgroundColor: vegFilter === 'veg' ? '#45A049' : '#F0F4F8',
                },
              }}
            />
            <Chip
              label="🔴 Non-Veg"
              onClick={() => setVegFilter('non-veg')}
              sx={{
                backgroundColor: vegFilter === 'non-veg' ? '#F44336' : 'white',
                color: vegFilter === 'non-veg' ? 'white' : '#2C3E50',
                fontWeight: 600,
                fontSize: '0.8rem',
                border: '2px solid',
                borderColor: vegFilter === 'non-veg' ? '#F44336' : '#E0E0E0',
                '&:hover': {
                  backgroundColor: vegFilter === 'non-veg' ? '#E53935' : '#F0F4F8',
                },
              }}
            />
            {hasActiveFilters && (
              <Chip
                label="Clear Filters"
                onClick={handleClearFilters}
                onDelete={handleClearFilters}
                size="small"
                sx={{
                  backgroundColor: '#FFF3E0',
                  color: '#F57C00',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '&:hover': {
                    backgroundColor: '#FFE0B2',
                  },
                }}
              />
            )}
          </Stack>
        </Container>
      </Box>

      {/* Menu Items Content */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
        {filteredGroups.length > 0 ? (
          <Stack spacing={4}>
            {filteredGroups.map((group, groupIndex) => (
              <Box key={group.id}>
                {/* Category Header */}
                <Box
                  id={group.id}
                  ref={(el: HTMLDivElement | null) => (categoryRefs.current[group.id] = el)}
                  sx={{
                    mb: 2,
                    pb: 1.5,
                    borderBottom: '2px solid #1E3A5F',
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: '#1E3A5F',
                          fontSize: { xs: '1.15rem', sm: '1.35rem' },
                          mb: 0.5,
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
                      label={`${group.items.length} items`}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#1E3A5F', 0.1),
                        color: '#1E3A5F',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </Stack>
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

                {/* Category Separator */}
                {groupIndex < filteredGroups.length - 1 && (
                  <Divider
                    sx={{
                      mt: 4,
                      borderColor: '#1E3A5F',
                      borderWidth: 1,
                      opacity: 0.2,
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
                ? `No results for "${searchQuery}". Try different keywords.`
                : 'No items match your current filters.'}
            </Typography>
            {hasActiveFilters && (
              <Chip
                label="Clear Filters"
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
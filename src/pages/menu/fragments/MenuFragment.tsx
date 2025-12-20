import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import { MenuItemType, CategoryType } from '../../../hooks/useMenuData';
import {
  MenuHeader,
  SearchBar,
  FilterButtons,
  CategoryTabs,
  MenuItemCard,
  EmptyMenuState,
  VegFilterType,
} from '../../../components/menu';

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

  const handleClearFilters = () => {
    setSearchQuery('');
    setVegFilter('all');
  };

  return (
    <Box 
      sx={{ 
        pb: { xs: 10, sm: 12 },
        backgroundColor: '#F8F9FA',
        width: '100%',
        height: '100%',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <MenuHeader />

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
          <Box sx={{ mb: 1.5 }}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </Box>

          {/* Filter Buttons */}
          <FilterButtons activeFilter={vegFilter} onFilterChange={setVegFilter} />

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
      <CategoryTabs
        categories={allCategories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryClick}
      />

      {/* Menu Items */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 2.5 }}>
        {filteredGroups.map((group, index) => (
          <Box key={group.id} sx={{ mb: 3.5 }}>
            <Box
              id={group.id}
              ref={(el: HTMLDivElement | null) => (categoryRefs.current[group.id] = el)}
            >
              {/* Category Header */}
              <Box 
                sx={{ 
                  mb: 2,
                  pb: 1.5,
                  borderBottom: '2px solid #1E3A5F',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: '0.85rem', fontWeight: 500 }}
                    >
                      {group.description || `Explore our ${group.name.toLowerCase()}`}
                    </Typography>
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
            </Box>

            {/* Category Separator */}
            {index < filteredGroups.length - 1 && (
              <Box sx={{ my: 3.5 }}>
                <Divider 
                  sx={{ 
                    borderColor: '#1E3A5F',
                    borderWidth: 1,
                    opacity: 0.2,
                  }} 
                />
              </Box>
            )}
          </Box>
        ))}

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <EmptyMenuState
            searchQuery={searchQuery}
            onClearFilters={handleClearFilters}
          />
        )}
      </Container>
    </Box>
  );
};

export default MenuFragment;
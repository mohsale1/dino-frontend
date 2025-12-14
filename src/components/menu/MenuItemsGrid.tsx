import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Restaurant, Search, Clear, FilterList } from '@mui/icons-material';
import MenuItemCard from './MenuItemCard';
import { useMenuFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

interface MenuItemsGridProps {
  filteredItems: any[];
  menuItems: any[];
  categories: any[];
  getCategoryName: (categoryId: string) => string;
  formatCurrency: (amount: number) => string;
  onToggleAvailability: (itemId: string) => void;
  onQuickImageUpload: (itemId: string, file: File) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: () => void;
  onClearFilters: () => void;
  // Filter props
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  vegFilter: string;
  setVegFilter: (value: string) => void;
  availabilityFilter: string;
  setAvailabilityFilter: (value: string) => void;
  showFilters?: boolean;
  setShowFilters?: (value: boolean) => void;
}

const MenuItemsGrid: React.FC<MenuItemsGridProps> = ({
  filteredItems,
  menuItems,
  categories,
  getCategoryName,
  formatCurrency,
  onToggleAvailability,
  onQuickImageUpload,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onClearFilters,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  vegFilter,
  setVegFilter,
  availabilityFilter,
  setAvailabilityFilter,
  showFilters = false,
  setShowFilters
}) => {
  const theme = useTheme();
  const menuFlags = useMenuFlags();

  return (
    <Box sx={{ minHeight: '50vh' }}>
      {/* Title and Filters Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ mb: 0.5, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
            Menu Items ({filteredItems.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.85rem' }, display: { xs: 'none', sm: 'block' } }}>
            Browse and manage your menu offerings
          </Typography>
        </Box>
          
        {/* Filters and Add Button */}
        <FlagGate flag="menu.showMenuFilters">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 1.5 },
            alignItems: { xs: 'stretch', sm: 'center' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            {/* Search Bar */}
            <TextField
              size="small"
              placeholder={theme.breakpoints.down('sm') ? "Search..." : "Search menu items..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: { xs: '100%', sm: 180 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.grey[50], 0.8),
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary', fontSize: { xs: 16, sm: 18 } }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ p: 0.5 }}>
                      <Clear sx={{ fontSize: { xs: 14, sm: 16 } }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Category Filter Dropdown */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
              <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
                sx={{ 
                  borderRadius: 1,
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.filter(cat => cat.active !== false).map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Quick filter buttons */}
            <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
              <Button
                variant={vegFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setVegFilter('all')}
                size="small"
                sx={{ 
                  minWidth: { xs: 45, sm: 50 }, 
                  fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
                  borderRadius: 1, 
                  px: { xs: 1, sm: 1.5 },
                  flex: { xs: 1, sm: 'none' }
                }}
              >
                All
              </Button>
              
              <Button
                variant={vegFilter === 'veg' ? 'contained' : 'outlined'}
                onClick={() => setVegFilter('veg')}
                size="small"
                startIcon={
                  <Box sx={{ 
                    width: { xs: 4, sm: 5 }, 
                    height: { xs: 4, sm: 5 }, 
                    borderRadius: '50%', 
                    backgroundColor: '#4CAF50',
                  }} />
                }
                sx={{ 
                  minWidth: { xs: 45, sm: 50 },
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  borderRadius: 1,
                  px: { xs: 1, sm: 1.5 },
                  flex: { xs: 1, sm: 'none' },
                  color: vegFilter === 'veg' ? 'white' : '#4CAF50',
                  borderColor: '#4CAF50',
                  backgroundColor: vegFilter === 'veg' ? '#4CAF50' : 'transparent',
                  '&:hover': { 
                    backgroundColor: vegFilter === 'veg' ? '#43A047' : alpha('#4CAF50', 0.08),
                    borderColor: '#4CAF50',
                  }
                }}
              >
                Veg
              </Button>
              
              <Button
                variant={vegFilter === 'non-veg' ? 'contained' : 'outlined'}
                onClick={() => setVegFilter('non-veg')}
                size="small"
                startIcon={
                  <Box sx={{ 
                    width: { xs: 4, sm: 5 }, 
                    height: { xs: 4, sm: 5 }, 
                    backgroundColor: '#F44336',
                  }} />
                }
                sx={{ 
                  minWidth: { xs: 60, sm: 70 },
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  borderRadius: 1,
                  px: { xs: 1, sm: 1.5 },
                  flex: { xs: 1, sm: 'none' },
                  color: vegFilter === 'non-veg' ? 'white' : '#F44336',
                  borderColor: '#F44336',
                  backgroundColor: vegFilter === 'non-veg' ? '#F44336' : 'transparent',
                  '&:hover': { 
                    backgroundColor: vegFilter === 'non-veg' ? '#E53935' : alpha('#F44336', 0.08),
                    borderColor: '#F44336',
                  }
                }}
              >
                Non-Veg
              </Button>
            </Stack>

            {/* Add Menu Item Button */}
            <FlagGate flag="menu.showAddMenuItem">
              <Button
                variant="contained"
                startIcon={<Add fontSize={theme.breakpoints.down('sm') ? "small" : "medium"} />}
                onClick={onAddItem}
                sx={{ 
                  borderRadius: 1,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.75, sm: 0.75 },
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  boxShadow: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }
                }}
              >
                {theme.breakpoints.down('sm') ? 'Add' : 'Add Item'}
              </Button>
            </FlagGate>
          </Box>
        </FlagGate>
      </Box>

      {/* Advanced Filters */}
      {setShowFilters && (
        <Collapse in={showFilters}>
          <Box sx={{ 
            mb: 3,
            p: 3, 
            backgroundColor: alpha(theme.palette.grey[50], 0.8), 
            borderRadius: 1,
            border: `1px solid ${theme.palette.grey[200]}`
          }}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2, color: 'text.primary' }}>
              Advanced Filters
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              {/* Category Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.filter(cat => cat.active !== false).map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Availability Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    label="Status"
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="unavailable">Unavailable</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Clear Filters */}
              <Grid item xs={12} sm={12} md={4}>
                {(searchTerm || selectedCategory !== 'all' || vegFilter !== 'all' || availabilityFilter !== 'all') && (
                  <Button
                    variant="text"
                    onClick={onClearFilters}
                    startIcon={<Clear />}
                    fullWidth
                    size="small"
                    sx={{ 
                      height: '40px',
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.08),
                        color: 'error.main'
                      }
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      )}

      {/* Content Section - All menu items */}
      <Box>
        {filteredItems.length === 0 ? (
          /* Empty State */
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 8, sm: 10 },
              px: 3,
            }}
          >
            <Box
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
                border: `3px dashed ${theme.palette.primary.main}`,
              }}
            >
              <Restaurant sx={{ fontSize: { xs: 50, sm: 60 }, color: 'primary.main' }} />
            </Box>
            
            <Typography variant="h4" fontWeight="700" gutterBottom color="text.primary" sx={{ mb: 2 }}>
              {menuItems.length === 0 ? 'No Menu Items Yet' : 'No Items Match Your Filters'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ 
              mb: 4, 
              maxWidth: '600px', 
              mx: 'auto', 
              lineHeight: 1.6,
              fontSize: '1rem'
            }}>
              {menuItems.length === 0 
                ? 'Start building your menu by adding delicious items that will make your customers\' mouths water. Create categories and add your signature dishes!'
                : 'Try adjusting your search terms or filters to find the items you\'re looking for. You can also add new items to expand your menu.'
              }
            </Typography>

            {menuItems.length === 0 ? (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAddItem}
                size="large"
                sx={{ 
                  borderRadius: 2,
                  px: 6,
                  py: 2,
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Add Your First Menu Item
              </Button>
            ) : (
              <Stack direction="row" spacing={3} justifyContent="center">
                <Button 
                  variant="outlined" 
                  onClick={onClearFilters}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Clear All Filters
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={onAddItem}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                  }}
                >
                  Add New Item
                </Button>
              </Stack>
            )}
          </Box>
        ) : (
          /* Menu Items Grid */
          <Box>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {filteredItems.map(item => (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={item.id}>
                  <MenuItemCard
                    item={item}
                    getCategoryName={getCategoryName}
                    formatCurrency={formatCurrency}
                    onToggleAvailability={onToggleAvailability}
                    onQuickImageUpload={onQuickImageUpload}
                    onEditItem={onEditItem}
                    onDeleteItem={onDeleteItem}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Add Item Button at the end */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: { xs: 4, sm: 6 },
              pt: { xs: 3, sm: 4 },
              borderTop: `1px solid ${theme.palette.grey[100]}`
            }}>
              <Button
                variant="text"
                startIcon={<Add />}
                onClick={onAddItem}
                sx={{ 
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    color: 'primary.main',
                  }
                }}
              >
                Add Another Item
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MenuItemsGrid;
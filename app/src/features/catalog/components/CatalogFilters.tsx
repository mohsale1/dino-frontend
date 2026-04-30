import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import type { Category } from '../types';

export interface CatalogFiltersProps {
  categories: Category[];
  filters: {
    categoryId?: string;
    priceRange: [number, number];
    availability?: 'all' | 'available' | 'unavailable';
    dietary: {
      vegetarian: boolean;
    };
    tags: string[];
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  availableTags?: string[];
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
  availableTags = [],
}) => {
  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    onFilterChange({ ...filters, priceRange: newValue as [number, number] });
  };

  const handleDietaryChange = (key: string, checked: boolean) => {
    onFilterChange({
      ...filters,
      dietary: { ...filters.dietary, [key]: checked },
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const activeFiltersCount = [
    filters.categoryId,
    !!filters.availability && filters.availability !== 'all',
    filters.dietary.vegetarian,
    filters.tags.length > 0,
  ].filter(Boolean).length;

  return (
    <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterList fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Filters
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip label={activeFiltersCount} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
            )}
          </Stack>
          <Button size="small" startIcon={<Clear />} onClick={onReset} sx={{ textTransform: 'none' }}>
            Clear
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Category */}
        <Box mb={2}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
            CATEGORY
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={filters.categoryId || 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                categoryId: e.target.value === 'all' ? undefined : e.target.value,
              })
            }
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Availability */}
        <Box mb={2}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
            AVAILABILITY
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={filters.availability || 'all'}
            onChange={(e) =>
              onFilterChange({ ...filters, availability: e.target.value })
            }
          >
            <MenuItem value="all">All Items</MenuItem>
            <MenuItem value="available">Available Only</MenuItem>
            <MenuItem value="unavailable">Unavailable Only</MenuItem>
          </TextField>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Price Range */}
        <Box mb={2}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
            PRICE RANGE
          </Typography>
          <Box sx={{ px: 1, pt: 1 }}>
            <Slider
              value={filters.priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={10}
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                ${filters.priceRange[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${filters.priceRange[1]}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Dietary */}
        <Box mb={2}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
            DIETARY
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.dietary.vegetarian}
                  onChange={(e) => handleDietaryChange('vegetarian', e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Vegetarian</Typography>}
            />
          </FormGroup>
        </Box>

        {availableTags.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
                TAGS
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {availableTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onClick={() => handleTagToggle(tag)}
                    color={filters.tags.includes(tag) ? 'primary' : 'default'}
                    variant={filters.tags.includes(tag) ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default CatalogFilters;
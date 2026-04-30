import React from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search,
  GridView,
  ViewList,
  ViewModule,
  Sort,
  FileDownload,
  Refresh,
} from '@mui/icons-material';

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'date-asc' | 'date-desc';

export interface CatalogToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onExport?: () => void;
  onImport?: () => void;
  onRefresh?: () => void;
  showViewModes?: boolean;
  showSort?: boolean;
  showActions?: boolean;
}

export const CatalogToolbar: React.FC<CatalogToolbarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onExport,
  onRefresh,
  showViewModes = true,
  showSort = true,
  showActions = true,
}) => {
  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: '#ffffff' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { sm: 300 } }}
        />

        <Box sx={{ flex: 1 }} />

        {/* Sort */}
        {showSort && (
          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            sx={{ minWidth: 160 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Sort fontSize="small" />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            <MenuItem value="price-asc">Price (Low-High)</MenuItem>
            <MenuItem value="price-desc">Price (High-Low)</MenuItem>
            <MenuItem value="date-asc">Oldest First</MenuItem>
            <MenuItem value="date-desc">Newest First</MenuItem>
          </TextField>
        )}

        {/* View Mode */}
        {showViewModes && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <Tooltip title="Grid">
                <GridView fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="compact">
              <Tooltip title="Compact">
                <ViewModule fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list">
              <Tooltip title="List">
                <ViewList fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* Actions */}
        {showActions && (
          <Stack direction="row" spacing={0.5}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onExport && (
              <Tooltip title="Export">
                <IconButton size="small" onClick={onExport}>
                  <FileDownload fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

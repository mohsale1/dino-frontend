/**
 * LocationFilters Component - Clean Professional Design
 *
 * Filter and search locations
 */

import React from 'react';
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface LocationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  activeTab: string;
}

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#1976d2',
  },
} as const;

const LocationFilters: React.FC<LocationFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  activeTab,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6b7280', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            minWidth: { xs: '100%', sm: 250 },
            ...textFieldSx,
          }}
        />
        {activeTab === 'locations' && (
          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 150 },
              ...textFieldSx,
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="occupied">Occupied</MenuItem>
            <MenuItem value="reserved">Reserved</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
          </TextField>
        )}
      </Box>
    </Paper>
  );
};

export default LocationFilters;
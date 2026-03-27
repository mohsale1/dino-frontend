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
import {
  Search as SearchIcon,
} from '@mui/icons-material';

interface LocationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  activeTab: string;
}

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
        p: 3,
        mb: 3,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
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
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#9ca3af',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1a1a1a',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#1a1a1a',
            },
          }}
        />
        {activeTab === 'locations' && (
          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#9ca3af',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a1a1a',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
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
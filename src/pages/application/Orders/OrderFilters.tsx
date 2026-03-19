/**
 * OrderFilters Component - Clean Professional Design
 * 
 * Filter and search orders
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

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterDate: string;
  onDateChange: (value: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterDate,
  onDateChange,
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
          placeholder="Search orders..."
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
        <TextField
          select
          label="Date Range"
          value={filterDate}
          onChange={(e) => onDateChange(e.target.value)}
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
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week">This Week</MenuItem>
          <MenuItem value="month">This Month</MenuItem>
        </TextField>
      </Box>
    </Paper>
  );
};

export default OrderFilters;
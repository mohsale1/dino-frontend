/**
 * CouponFilters Component - Clean Professional Design
 * 
 * Filter and search coupons
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

interface CouponFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
}

const CouponFilters: React.FC<CouponFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
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
          placeholder="Search coupons..."
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
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </TextField>
        <TextField
          select
          label="Type"
          value={filterType}
          onChange={(e) => onTypeChange(e.target.value)}
          sx={{
            minWidth: 180,
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
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="percentage">Percentage</MenuItem>
          <MenuItem value="fixed">Fixed Amount</MenuItem>
          <MenuItem value="bogo">Buy One Get One</MenuItem>
          <MenuItem value="free_shipping">Free Shipping</MenuItem>
        </TextField>
      </Box>
    </Paper>
  );
};

export default CouponFilters;
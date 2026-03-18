import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <TextField
      fullWidth
      placeholder="Search for dishes..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#F8F9FA',
          height: 40,
          '& fieldset': {
            borderColor: '#E0E0E0',
          },
          '&:hover fieldset': {
            borderColor: '#1E3A5F',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1E3A5F',
          },
        },
        '& .MuiInputBase-input': {
          fontSize: '0.9rem',
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ color: '#6C757D', fontSize: 20 }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton onClick={() => onChange('')} size="small">
              <Clear sx={{ fontSize: 18 }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
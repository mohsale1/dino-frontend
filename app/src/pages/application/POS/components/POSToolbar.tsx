import React from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import GridView from '@mui/icons-material/GridView';
import ViewList from '@mui/icons-material/ViewList';
import Refresh from '@mui/icons-material/Refresh';

interface POSToolbarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (m: 'grid' | 'list') => void;
  onRefresh: () => void;
  totalItems: number;
  total: number;
  filteredCount: number;
  totalCount: number;
  categories: Array<{ id: string; name: string }>;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  formatINR: (n: number) => string;
}

const POSToolbar: React.FC<POSToolbarProps> = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  totalItems,
  total,
  filteredCount,
  totalCount,
  categories,
  selectedCategory,
  onSelectCategory,
  formatINR,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}
    >
      {/* Main toolbar row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1.25,
        }}
      >
        {/* Search box */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 1.5,
            px: 1.5,
            py: 0.625,
            transition: 'border-color 0.15s ease',
            '&:focus-within': {
              borderColor: '#6366f1',
              backgroundColor: '#ffffff',
            },
          }}
        >
          <Search sx={{ fontSize: 18, color: '#64748b', flexShrink: 0 }} />
          <InputBase
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search menu items..."
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              color: '#0f172a',
              '& input': {
                padding: 0,
                '&::placeholder': {
                  color: '#94a3b8',
                  opacity: 1,
                },
              },
            }}
          />
          {searchTerm.length > 0 && (
            <IconButton
              size="small"
              onClick={() => onSearchChange('')}
              sx={{
                p: 0.25,
                color: '#94a3b8',
                flexShrink: 0,
                '&:hover': { color: '#64748b', backgroundColor: 'transparent' },
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        {/* Grid / List toggle */}
        <ButtonGroup
          size="small"
          disableElevation
          sx={{
            flexShrink: 0,
            border: '1px solid #e2e8f0',
            borderRadius: 1.5,
            overflow: 'hidden',
            '& .MuiButtonGroup-grouped': {
              border: 'none',
              borderRadius: 0,
              minWidth: 36,
              px: 1,
              py: 0.75,
            },
          }}
        >
          <Button
            onClick={() => onViewModeChange('grid')}
            sx={{
              backgroundColor: viewMode === 'grid' ? '#0f172a' : '#ffffff',
              color: viewMode === 'grid' ? '#ffffff' : '#64748b',
              '&:hover': {
                backgroundColor: viewMode === 'grid' ? '#1e293b' : '#f8fafc',
              },
            }}
          >
            <GridView sx={{ fontSize: 18 }} />
          </Button>
          <Button
            onClick={() => onViewModeChange('list')}
            sx={{
              backgroundColor: viewMode === 'list' ? '#0f172a' : '#ffffff',
              color: viewMode === 'list' ? '#ffffff' : '#64748b',
              borderLeft: '1px solid #e2e8f0 !important',
              '&:hover': {
                backgroundColor: viewMode === 'list' ? '#1e293b' : '#f8fafc',
              },
            }}
          >
            <ViewList sx={{ fontSize: 18 }} />
          </Button>
        </ButtonGroup>

        {/* Refresh button */}
        <IconButton
          size="small"
          onClick={onRefresh}
          sx={{
            flexShrink: 0,
            border: '1px solid #e2e8f0',
            borderRadius: 1.5,
            p: 0.75,
            color: '#64748b',
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              borderColor: '#cbd5e1',
            },
          }}
        >
          <Refresh sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Right-side chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {totalItems > 0 && (
            <Chip
              label={`${totalItems} item${totalItems !== 1 ? 's' : ''} · ${formatINR(total)}`}
              size="small"
              sx={{
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: '1px solid #c7d2fe',
                height: 28,
                '& .MuiChip-label': { px: 1.25 },
              }}
            />
          )}
          <Chip
            label={`${filteredCount} / ${totalCount}`}
            size="small"
            sx={{
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              fontWeight: 500,
              fontSize: '0.75rem',
              border: '1px solid #e2e8f0',
              height: 28,
              '& .MuiChip-label': { px: 1.25 },
            }}
          />
        </Box>
      </Box>

      {/* Mobile category chips row */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          pb: 1.25,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <Chip
              key={cat.id}
              label={cat.name}
              size="small"
              onClick={() => onSelectCategory(cat.id)}
              sx={{
                flexShrink: 0,
                height: 28,
                fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                backgroundColor: isActive ? '#0f172a' : '#f8fafc',
                color: isActive ? '#ffffff' : '#64748b',
                border: `1px solid ${isActive ? '#0f172a' : '#e2e8f0'}`,
                '& .MuiChip-label': { px: 1.25 },
                '&:hover': {
                  backgroundColor: isActive ? '#1e293b' : '#f1f5f9',
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default POSToolbar;

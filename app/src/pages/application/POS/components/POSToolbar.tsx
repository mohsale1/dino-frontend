import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
        borderBottom: '1px solid #e0e0e0',
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
        {/* Title */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#1C1C1E',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          Menu
        </Typography>

        {/* Item count pill */}
        <Box
          sx={{
            bgcolor: '#f1f5f9',
            borderRadius: '999px',
            px: 1,
            py: 0.25,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#475569',
              lineHeight: 1,
            }}
          >
            {filteredCount === totalCount
              ? totalCount
              : `${filteredCount} / ${totalCount}`}
          </Typography>
        </Box>

        {/* Search box */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#f7f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            px: 1.5,
            py: 0.625,
            transition: 'border-color 0.15s ease, background-color 0.15s ease',
            '&:focus-within': {
              borderColor: '#1976D2',
              bgcolor: '#ffffff',
            },
          }}
        >
          <Search sx={{ fontSize: 17, color: '#94a3b8', flexShrink: 0 }} />
          <InputBase
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search menu items..."
            sx={{
              flex: 1,
              fontSize: '0.83rem',
              color: '#1C1C1E',
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
                '&:hover': { color: '#64748b', bgcolor: 'transparent' },
              }}
            >
              <Close sx={{ fontSize: 15 }} />
            </IconButton>
          )}
        </Box>

        {/* Cart summary chip */}
        {totalItems > 0 && (
          <Chip
            label={`${totalItems} item${totalItems !== 1 ? 's' : ''} · ${formatINR(total)}`}
            size="small"
            sx={{
              flexShrink: 0,
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid #BFDBFE',
              height: 28,
              textTransform: 'none',
              boxShadow: 'none',
              '& .MuiChip-label': { px: 1.25 },
            }}
          />
        )}

        {/* Grid / List toggle */}
        <ButtonGroup
          size="small"
          disableElevation
          sx={{
            flexShrink: 0,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            overflow: 'hidden',
            '& .MuiButtonGroup-grouped': {
              border: 'none',
              borderRadius: 0,
              minWidth: 34,
              px: 0.875,
              py: 0.625,
              textTransform: 'none',
              boxShadow: 'none',
            },
          }}
        >
          <Button
            onClick={() => onViewModeChange('grid')}
            disableRipple={false}
            sx={{
              bgcolor: viewMode === 'grid' ? '#1C1C1E' : '#ffffff',
              color: viewMode === 'grid' ? '#ffffff' : '#64748b',
              '&:hover': {
                bgcolor: viewMode === 'grid' ? '#2d2d2f' : '#f7f9fa',
              },
            }}
          >
            <GridView sx={{ fontSize: 17 }} />
          </Button>
          <Button
            onClick={() => onViewModeChange('list')}
            disableRipple={false}
            sx={{
              bgcolor: viewMode === 'list' ? '#1C1C1E' : '#ffffff',
              color: viewMode === 'list' ? '#ffffff' : '#64748b',
              borderLeft: '1px solid #e0e0e0 !important',
              '&:hover': {
                bgcolor: viewMode === 'list' ? '#2d2d2f' : '#f7f9fa',
              },
            }}
          >
            <ViewList sx={{ fontSize: 17 }} />
          </Button>
        </ButtonGroup>

        {/* Refresh button */}
        <IconButton
          size="small"
          onClick={onRefresh}
          sx={{
            flexShrink: 0,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 0.75,
            color: '#64748b',
            bgcolor: '#ffffff',
            '&:hover': {
              bgcolor: '#f7f9fa',
              borderColor: '#1976D2',
              color: '#1976D2',
            },
          }}
        >
          <Refresh sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {/* Mobile category chips row */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          gap: 0.75,
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
                height: 27,
                fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textTransform: 'none',
                boxShadow: 'none',
                bgcolor: isActive ? '#1C1C1E' : '#f7f9fa',
                color: isActive ? '#ffffff' : '#64748b',
                border: `1px solid ${isActive ? '#1C1C1E' : '#e0e0e0'}`,
                '& .MuiChip-label': { px: 1.25 },
                '&:hover': {
                  bgcolor: isActive ? '#2d2d2f' : '#f1f5f9',
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
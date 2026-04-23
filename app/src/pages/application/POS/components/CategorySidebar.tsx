import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface CategorySidebarProps {
  filteredCategories: Array<{ id: string; name: string }>;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  catSearch: string;
  onCatSearchChange: (v: string) => void;
  categoryItemCounts: Record<string, number>;
  venueName: string;
  venueIsOpen: boolean;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  filteredCategories,
  selectedCategory,
  onSelectCategory,
  catSearch,
  onCatSearchChange,
  categoryItemCounts,
  venueName,
  venueIsOpen,
}) => {
  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'none', md: 'flex' },
        flexDirection: 'column',
        width: 220,
        minWidth: 220,
        maxWidth: 220,
        height: '100%',
        bgcolor: '#0f172a',
        borderRight: '1px solid',
        borderColor: 'rgba(226,232,240,0.08)',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          pt: 2.5,
          pb: 1.5,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            display: 'block',
            mb: 1.5,
          }}
        >
          Categories
        </Typography>

        {/* Search Box */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(226,232,240,0.1)',
            borderRadius: 1.5,
            px: 1,
            py: 0.25,
            transition: 'border-color 0.15s ease',
            '&:focus-within': {
              borderColor: 'rgba(99,102,241,0.5)',
              bgcolor: 'rgba(99,102,241,0.05)',
            },
          }}
        >
          <SearchIcon
            sx={{
              fontSize: 15,
              color: '#64748b',
              mr: 0.75,
              flexShrink: 0,
            }}
          />
          <InputBase
            value={catSearch}
            onChange={(e) => onCatSearchChange(e.target.value)}
            placeholder="Search..."
            inputProps={{ 'aria-label': 'search categories' }}
            sx={{
              flex: 1,
              fontSize: '0.78rem',
              color: '#f8fafc',
              '& input': {
                p: 0,
                '&::placeholder': {
                  color: '#64748b',
                  opacity: 1,
                },
              },
            }}
          />
          {catSearch.length > 0 && (
            <IconButton
              size="small"
              onClick={() => onCatSearchChange('')}
              sx={{
                p: 0.25,
                color: '#64748b',
                '&:hover': { color: '#f8fafc' },
              }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Scrollable Category List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1,
          pb: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(99,102,241,0.3) transparent',
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(99,102,241,0.3)',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(99,102,241,0.55)',
          },
        }}
      >
        {filteredCategories.length === 0 ? (
          <Typography
            sx={{
              color: '#64748b',
              fontSize: '0.75rem',
              textAlign: 'center',
              mt: 3,
              px: 1,
            }}
          >
            No categories found
          </Typography>
        ) : (
          filteredCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = categoryItemCounts[cat.id] ?? 0;

            return (
              <Box
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.25,
                  py: 0.875,
                  mb: 0.25,
                  borderRadius: 1.25,
                  cursor: 'pointer',
                  position: 'relative',
                  borderLeft: '3px solid',
                  borderColor: isActive ? '#6366f1' : 'transparent',
                  bgcolor: isActive
                    ? 'rgba(99,102,241,0.12)'
                    : 'transparent',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive
                      ? 'rgba(99,102,241,0.16)'
                      : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#f8fafc' : '#94a3b8',
                    lineHeight: 1.3,
                    flex: 1,
                    mr: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {cat.name}
                </Typography>
                <Box
                  sx={{
                    minWidth: 20,
                    height: 18,
                    px: 0.625,
                    borderRadius: 0.75,
                    bgcolor: isActive
                      ? 'rgba(99,102,241,0.35)'
                      : 'rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: isActive ? '#c7d2fe' : '#64748b',
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.5,
          borderTop: '1px solid rgba(226,232,240,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
        }}
      >
        <FiberManualRecordIcon
          sx={{
            fontSize: 9,
            color: venueIsOpen ? '#22c55e' : '#ef4444',
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: '#64748b',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
          title={venueName}
        >
          {venueName}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: venueIsOpen ? '#22c55e' : '#ef4444',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            flexShrink: 0,
          }}
        >
          {venueIsOpen ? 'Open' : 'Closed'}
        </Typography>
      </Box>
    </Box>
  );
};

export default CategorySidebar;

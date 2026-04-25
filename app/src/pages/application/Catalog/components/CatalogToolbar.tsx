import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import InventoryIcon from '@mui/icons-material/Inventory'
import CategoryIcon from '@mui/icons-material/Category'
import FilterAltIcon from '@mui/icons-material/FilterAlt'

interface CatalogToolbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  searchQuery: string
  onSearchChange: (v: string) => void
  categoryFilter: string
  onCategoryFilterChange: (v: string) => void
  availFilter: string
  onAvailFilterChange: (v: string) => void
  categories: Array<{ id: string; name: string }>
  itemCount: number
  categoryCount: number
  filteredCount: number
  canAdd: boolean
  onAdd: () => void
}

const selectSx = {
  fontSize: '0.82rem',
  fontWeight: 500,
  color: '#1C1C1E',
  backgroundColor: '#f7f9fa',
  borderRadius: 2,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#bdbdbd',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976D2',
    borderWidth: '1px',
  },
  '& .MuiSelect-select': {
    py: '6px',
    px: '12px',
  },
}

export default function CatalogToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  availFilter,
  onAvailFilterChange,
  categories,
  itemCount,
  categoryCount,
  filteredCount,
  canAdd,
  onAdd,
}: CatalogToolbarProps) {
  const isItems = activeTab === 'items'
  const activeTabLabel = isItems ? 'Items' : 'Categories'
  const addLabel = isItems ? 'Add Item' : 'Add Category'
  const countLabel = isItems
    ? `${filteredCount} item${filteredCount !== 1 ? 's' : ''}`
    : `${filteredCount} categor${filteredCount !== 1 ? 'ies' : 'y'}`

  const hasFilters =
    searchQuery.trim() !== '' ||
    (isItems && (categoryFilter !== '' || availFilter !== ''))

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue)
  }

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0,
      }}
    >
      {/* Row 1 */}
      <Box
        sx={{
          px: { xs: 2, sm: '32px' },
          pt: '16px',
          pb: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Title + Divider + Tab Label */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#1C1C1E',
              lineHeight: 1,
            }}
          >
            Catalog
          </Typography>
          <Box
            sx={{
              width: '1px',
              height: '18px',
              bgcolor: '#e0e0e0',
              mx: 0.5,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: '#666666',
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {activeTabLabel}
          </Typography>
        </Box>

        {/* Middle: Search */}
        <Box
          sx={{
            flex: 1,
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f7f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            gap: 0.75,
            '&:focus-within': {
              borderColor: '#1976D2',
              bgcolor: '#ffffff',
            },
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
        >
          <SearchIcon sx={{ fontSize: '1rem', color: '#999999', flexShrink: 0 }} />
          <InputBase
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${activeTabLabel.toLowerCase()}...`}
            sx={{
              flex: 1,
              fontSize: '0.82rem',
              color: '#1C1C1E',
              '& input::placeholder': {
                color: '#999999',
                opacity: 1,
              },
              '& input': {
                p: 0,
              },
            }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => onSearchChange('')}
              sx={{
                p: 0.25,
                color: '#999999',
                '&:hover': { color: '#666666' },
              }}
            >
              <CloseIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          )}
        </Box>

        {/* Right: Filters + Count + Add */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {isItems && (
            <>
              {/* Category Filter */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => onCategoryFilterChange(e.target.value)}
                  displayEmpty
                  sx={{ ...selectSx, minWidth: 140 }}
                >
                  <MenuItem value="">
                    <Typography sx={{ fontSize: '0.82rem', color: '#666666' }}>
                      All Categories
                    </Typography>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#1C1C1E' }}>{cat.name}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Availability Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={availFilter}
                  onChange={(e) => onAvailFilterChange(e.target.value)}
                  displayEmpty
                  sx={{ ...selectSx, minWidth: 120 }}
                >
                  <MenuItem value="">
                    <Typography sx={{ fontSize: '0.82rem', color: '#666666' }}>
                      Availability
                    </Typography>
                  </MenuItem>
                  <MenuItem value="available">
                    <Typography sx={{ fontSize: '0.82rem', color: '#1C1C1E' }}>Available</Typography>
                  </MenuItem>
                  <MenuItem value="unavailable">
                    <Typography sx={{ fontSize: '0.82rem', color: '#1C1C1E' }}>Unavailable</Typography>
                  </MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {/* Clear Filters */}
          {hasFilters && (
            <Button
              size="small"
              startIcon={<FilterAltIcon sx={{ fontSize: '0.9rem !important' }} />}
              onClick={() => {
                onSearchChange('')
                onCategoryFilterChange('')
                onAvailFilterChange('')
              }}
              sx={{
                color: '#666666',
                fontSize: '0.78rem',
                fontWeight: 500,
                textTransform: 'none',
                px: 1,
                py: 0.5,
                minWidth: 'unset',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  color: '#1C1C1E',
                },
              }}
            >
              Clear
            </Button>
          )}

          {/* Count Pill */}
          <Box
            sx={{
              bgcolor: '#f1f5f9',
              color: '#475569',
              borderRadius: '999px',
              px: 1.25,
              py: 0.25,
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              lineHeight: '1.6',
            }}
          >
            {countLabel}
          </Box>

          {/* Add Button */}
          {canAdd && (
            <Button
              variant="contained"
              disableElevation
              startIcon={<AddIcon sx={{ fontSize: '1rem !important' }} />}
              onClick={onAdd}
              sx={{
                bgcolor: '#1976D2',
                color: '#ffffff',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                px: 2,
                py: 0.75,
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#1565C0',
                },
              }}
            >
              {addLabel}
            </Button>
          )}
        </Box>
      </Box>

      {/* Row 2: Tabs */}
      <Box sx={{ borderTop: '1px solid #f1f5f9' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            px: 2,
            '& .MuiTabs-indicator': {
              height: '2px',
              backgroundColor: '#1976D2',
            },
            '& .MuiTabs-flexContainer': {
              gap: 0.5,
            },
          }}
        >
          <Tab
            value="items"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <InventoryIcon sx={{ fontSize: '0.95rem' }} />
                <span>Items</span>
                <Chip
                  label={itemCount}
                  size="small"
                  sx={{
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    bgcolor: activeTab === 'items' ? '#1976D2' : '#f1f5f9',
                    color: activeTab === 'items' ? '#ffffff' : '#475569',
                    '& .MuiChip-label': { px: '6px' },
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                />
              </Box>
            }
            sx={{
              minHeight: 40,
              fontSize: '0.82rem',
              textTransform: 'none',
              fontWeight: 600,
              color: '#666666',
              px: 1.5,
              py: 0,
              '&.Mui-selected': {
                color: '#1976D2',
              },
            }}
          />
          <Tab
            value="categories"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CategoryIcon sx={{ fontSize: '0.95rem' }} />
                <span>Categories</span>
                <Chip
                  label={categoryCount}
                  size="small"
                  sx={{
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    bgcolor: activeTab === 'categories' ? '#1976D2' : '#f1f5f9',
                    color: activeTab === 'categories' ? '#ffffff' : '#475569',
                    '& .MuiChip-label': { px: '6px' },
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                />
              </Box>
            }
            sx={{
              minHeight: 40,
              fontSize: '0.82rem',
              textTransform: 'none',
              fontWeight: 600,
              color: '#666666',
              px: 1.5,
              py: 0,
              '&.Mui-selected': {
                color: '#1976D2',
              },
            }}
          />
        </Tabs>
      </Box>
    </Box>
  )
}

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
  color: '#0f172a',
  backgroundColor: '#f8fafc',
  borderRadius: '1.5rem',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e2e8f0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#94a3b8',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#2563EB',
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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}
    >
      {/* Row 1 */}
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
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
              color: '#0f172a',
              lineHeight: 1,
            }}
          >
            Catalog
          </Typography>
          <Box
            sx={{
              width: '1px',
              height: '18px',
              backgroundColor: '#e2e8f0',
              mx: 0.5,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: '#64748b',
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
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '1.5rem',
            px: 1.5,
            py: 0.75,
            gap: 0.75,
            '&:focus-within': {
              borderColor: '#2563EB',
              backgroundColor: '#ffffff',
            },
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
        >
          <SearchIcon sx={{ fontSize: '1rem', color: '#94a3b8', flexShrink: 0 }} />
          <InputBase
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${activeTabLabel.toLowerCase()}...`}
            sx={{
              flex: 1,
              fontSize: '0.82rem',
              color: '#0f172a',
              '& input::placeholder': {
                color: '#94a3b8',
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
                color: '#94a3b8',
                '&:hover': { color: '#64748b' },
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
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                      All Categories
                    </Typography>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Typography sx={{ fontSize: '0.82rem' }}>{cat.name}</Typography>
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
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Availability
                    </Typography>
                  </MenuItem>
                  <MenuItem value="available">
                    <Typography sx={{ fontSize: '0.82rem' }}>Available</Typography>
                  </MenuItem>
                  <MenuItem value="unavailable">
                    <Typography sx={{ fontSize: '0.82rem' }}>Unavailable</Typography>
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
                color: '#64748b',
                fontSize: '0.78rem',
                fontWeight: 500,
                textTransform: 'none',
                px: 1,
                py: 0.5,
                minWidth: 'unset',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                },
              }}
            >
              Clear
            </Button>
          )}

          {/* Count Pill */}
          <Box
            sx={{
              backgroundColor: '#f1f5f9',
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
              startIcon={<AddIcon sx={{ fontSize: '1rem !important' }} />}
              onClick={onAdd}
              sx={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '1.5rem',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                px: 2,
                py: 0.75,
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: '#1e293b',
                  boxShadow: 'none',
                },
                '&:active': {
                  boxShadow: 'none',
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
              backgroundColor: '#0f172a',
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
                    backgroundColor: activeTab === 'items' ? '#0f172a' : '#e2e8f0',
                    color: activeTab === 'items' ? '#ffffff' : '#64748b',
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
              color: '#64748b',
              px: 1.5,
              py: 0,
              '&.Mui-selected': {
                color: '#0f172a',
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
                    backgroundColor: activeTab === 'categories' ? '#0f172a' : '#e2e8f0',
                    color: activeTab === 'categories' ? '#ffffff' : '#64748b',
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
              color: '#64748b',
              px: 1.5,
              py: 0,
              '&.Mui-selected': {
                color: '#0f172a',
              },
            }}
          />
        </Tabs>
      </Box>
    </Box>
  )
}

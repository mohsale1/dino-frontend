import React, { useEffect } from 'react';
import {
  Box, InputBase, IconButton, Select, MenuItem,
  FormControl, Tabs, Tab, Typography,
} from '@mui/material';
import { Search, Close, Refresh } from '@mui/icons-material';
import { StatusFilter, DateFilter, STATUS_CONFIG } from '../orders.types';

const PULSE_STYLE_ID = 'orders-toolbar-live-pulse';

function injectPulseKeyframe(): void {
  if (document.getElementById(PULSE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes livePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.4; transform: scale(0.72); }
    }
  `;
  document.head.appendChild(style);
}

interface OrdersToolbarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (v: DateFilter) => void;
  filteredCount: number;
  totalCount: number;
  onRefresh: () => void;
}

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'served', label: 'Served' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getTabColor(value: StatusFilter): string {
  if (!value) return '#2563EB';
  return STATUS_CONFIG[value as keyof typeof STATUS_CONFIG]?.dot ?? '#2563EB';
}

const OrdersToolbar: React.FC<OrdersToolbarProps> = ({
  searchQuery, onSearchChange,
  statusFilter, onStatusFilterChange,
  dateFilter, onDateFilterChange,
  filteredCount, totalCount,
  onRefresh,
}) => {
  const activeColor = getTabColor(statusFilter);

  useEffect(() => { injectPulseKeyframe(); }, []);

  return (
    <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>

      {/* Main toolbar row */}
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
        {/* 1. Page title + live indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#0f172a',
              lineHeight: 1,
            }}
          >
            Orders
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.25 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#16a34a',
                animation: 'livePulse 1.8s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: '0.68rem',
                color: '#16a34a',
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: '0.02em',
              }}
            >
              Live
            </Typography>
          </Box>
        </Box>

        {/* 2. Search box */}
        <Box
          sx={{
            flex: '1 1 220px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 1.5,
            px: 1.5,
            py: 0.75,
            transition: 'border-color 0.15s',
            '&:focus-within': { borderColor: '#94a3b8' },
          }}
        >
          <Search sx={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }} />
          <InputBase
            placeholder="Search order # or customer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              flex: 1,
              fontSize: '0.83rem',
              color: '#0f172a',
              '& input': { p: 0 },
              '& input::placeholder': { color: '#94a3b8', opacity: 1 },
            }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => onSearchChange('')}
              sx={{ p: 0.2, color: '#94a3b8', '&:hover': { color: '#64748b' } }}
            >
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>

        {/* 3. Date select */}
        <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
          <Select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
            displayEmpty
            sx={{
              borderRadius: 1.5,
              fontSize: '0.83rem',
              bgcolor: '#f8fafc',
              color: '#0f172a',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8', borderWidth: 1 },
              '& .MuiSelect-select': { py: '6.5px' },
            }}
          >
            <MenuItem value="today" sx={{ fontSize: '0.83rem' }}>Today</MenuItem>
            <MenuItem value="week" sx={{ fontSize: '0.83rem' }}>This Week</MenuItem>
            <MenuItem value="month" sx={{ fontSize: '0.83rem' }}>This Month</MenuItem>
            <MenuItem value="" sx={{ fontSize: '0.83rem' }}>All Dates</MenuItem>
          </Select>
        </FormControl>

        {/* 4. Refresh button */}
        <IconButton
          onClick={onRefresh}
          sx={{
            width: 36,
            height: 36,
            border: '1px solid #e2e8f0',
            borderRadius: 1.5,
            color: '#64748b',
            flexShrink: 0,
            '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
          }}
        >
          <Refresh sx={{ fontSize: 18 }} />
        </IconButton>

        {/* 5. Count chip */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f1f5f9',
            borderRadius: '999px',
            px: 1.25,
            py: 0.4,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#475569',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {filteredCount === totalCount
              ? `${totalCount} orders`
              : `${filteredCount} of ${totalCount}`}
          </Typography>
        </Box>
      </Box>

      {/* Status filter tabs row */}
      <Tabs
        value={statusFilter}
        onChange={(_, v) => onStatusFilterChange(v as StatusFilter)}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: {
            backgroundColor: activeColor,
            height: 2,
            borderRadius: '2px 2px 0 0',
          },
        }}
        sx={{
          minHeight: 40,
          px: 1.5,
          borderTop: '1px solid #f1f5f9',
          '& .MuiTab-root': {
            minHeight: 40,
            fontSize: '0.78rem',
            textTransform: 'none',
            fontWeight: 600,
            py: 0,
            px: 1.5,
            color: '#64748b',
            gap: 0.6,
          },
          '& .MuiTab-root.Mui-selected': { color: '#0f172a' },
          '& .MuiTabs-scrollButtons': { width: 28 },
        }}
      >
        {STATUS_TABS.map((tab) => {
          const dotColor = getTabColor(tab.value);
          const isActive = statusFilter === tab.value;
          return (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  {tab.value && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: isActive ? dotColor : '#cbd5e1',
                        flexShrink: 0,
                        transition: 'background-color 0.15s',
                      }}
                    />
                  )}
                  {tab.label}
                </Box>
              }
            />
          );
        })}
      </Tabs>
    </Box>
  );
};

export default OrdersToolbar;

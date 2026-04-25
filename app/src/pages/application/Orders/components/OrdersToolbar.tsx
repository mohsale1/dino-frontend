import React, { useEffect, useRef, useState } from 'react';
import {
  Box, InputBase, IconButton, Select, MenuItem,
  FormControl, Tabs, Tab, Typography, GlobalStyles, Collapse,
} from '@mui/material';
import { Search, Close, Refresh, DateRange as DateRangeIcon } from '@mui/icons-material';
import { StatusFilter, DateFilter, STATUS_CONFIG } from '../orders.types';

interface OrdersToolbarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (v: DateFilter) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (v: string) => void;
  onCustomEndDateChange: (v: string) => void;
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
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getTabColor(value: StatusFilter): string {
  if (!value) return '#1976D2';
  return STATUS_CONFIG[value as keyof typeof STATUS_CONFIG]?.dot ?? '#1976D2';
}

const DATE_INPUT_SX = {
  fontSize: '0.8rem',
  color: '#1C1C1E',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  px: 1.25,
  py: '5px',
  bgcolor: '#f7f9fa',
  outline: 'none',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'border-color 0.15s',
  '&:focus': { borderColor: '#1976D2' },
  '&::-webkit-calendar-picker-indicator': { cursor: 'pointer', opacity: 0.6 },
} as const;

const OrdersToolbar: React.FC<OrdersToolbarProps> = ({
  searchQuery, onSearchChange,
  statusFilter, onStatusFilterChange,
  dateFilter, onDateFilterChange,
  customStartDate, customEndDate,
  onCustomStartDateChange, onCustomEndDateChange,
  filteredCount, totalCount,
  onRefresh,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Track previous dateFilter to detect transition away from 'custom'
  const prevDateFilter = useRef(dateFilter);
  const [customRowVisible, setCustomRowVisible] = useState(dateFilter === 'custom');

  useEffect(() => {
    if (dateFilter === 'custom') {
      setCustomRowVisible(true);
    } else if (prevDateFilter.current === 'custom') {
      setCustomRowVisible(false);
    }
    prevDateFilter.current = dateFilter;
  }, [dateFilter]);

  return (
    <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
      <GlobalStyles styles={{
        '@keyframes livePulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%':      { opacity: 0.4, transform: 'scale(0.72)' },
        },
      }} />

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
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1C1C1E', lineHeight: 1 }}>
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
            <Typography sx={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600, lineHeight: 1, letterSpacing: '0.02em' }}>
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
            bgcolor: '#f7f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            transition: 'border-color 0.15s',
            '&:focus-within': { borderColor: '#1976D2' },
          }}
        >
          <Search sx={{ fontSize: 16, color: '#999999', flexShrink: 0 }} />
          <InputBase
            placeholder="Search order # or customer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              flex: 1,
              fontSize: '0.83rem',
              color: '#1C1C1E',
              '& input': { p: 0 },
              '& input::placeholder': { color: '#999999', opacity: 1 },
            }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => onSearchChange('')}
              sx={{ p: 0.2, color: '#999999', '&:hover': { color: '#666666' } }}
            >
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>

        {/* 3. Date select */}
        <FormControl size="small" sx={{ minWidth: 148, flexShrink: 0 }}>
          <Select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
            displayEmpty
            renderValue={(val) => {
              if (val === 'custom') {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <DateRangeIcon sx={{ fontSize: 15, color: '#1976D2' }} />
                    <span>Custom Range</span>
                  </Box>
                );
              }
              const labels: Record<string, string> = {
                today: 'Today', week: 'This Week', month: 'This Month', '': 'All Dates',
              };
              return labels[val as string] ?? val;
            }}
            sx={{
              borderRadius: 2,
              fontSize: '0.83rem',
              bgcolor: dateFilter === 'custom' ? '#EFF6FF' : '#f7f9fa',
              color: '#1C1C1E',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: dateFilter === 'custom' ? '#BFDBFE' : '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2', borderWidth: 1 },
              '& .MuiSelect-select': { py: '6.5px' },
            }}
          >
            <MenuItem value="today" sx={{ fontSize: '0.83rem' }}>Today</MenuItem>
            <MenuItem value="week" sx={{ fontSize: '0.83rem' }}>This Week</MenuItem>
            <MenuItem value="month" sx={{ fontSize: '0.83rem' }}>This Month</MenuItem>
            <MenuItem value="" sx={{ fontSize: '0.83rem' }}>All Dates</MenuItem>
            <MenuItem
              value="custom"
              sx={{
                fontSize: '0.83rem',
                color: '#1976D2',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <DateRangeIcon sx={{ fontSize: 15 }} />
              Custom Range
            </MenuItem>
          </Select>
        </FormControl>

        {/* 4. Refresh button */}
        <IconButton
          onClick={onRefresh}
          sx={{
            width: 36,
            height: 36,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            color: '#666666',
            flexShrink: 0,
            '&:hover': { bgcolor: '#f7f9fa', borderColor: '#1976D2', color: '#1976D2' },
          }}
        >
          <Refresh sx={{ fontSize: 18 }} />
        </IconButton>

        {/* 5. Count pill */}
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
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', lineHeight: 1, whiteSpace: 'nowrap' }}>
            {filteredCount === totalCount
              ? `${totalCount} orders`
              : `${filteredCount} of ${totalCount}`}
          </Typography>
        </Box>
      </Box>

      {/* Custom date range row */}
      <Collapse in={customRowVisible} timeout={200}>
        <Box
          sx={{
            px: 2.5,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            bgcolor: '#F8FAFF',
            borderTop: '1px solid #e8f0fe',
          }}
        >
          <DateRangeIcon sx={{ fontSize: 16, color: '#1976D2', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', flexShrink: 0 }}>
            Date Range
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {/* Start date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', flexShrink: 0 }}>From</Typography>
              <Box
                component="input"
                type="date"
                value={customStartDate}
                max={customEndDate || today}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomStartDateChange(e.target.value)}
                sx={DATE_INPUT_SX}
              />
            </Box>

            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</Typography>

            {/* End date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', flexShrink: 0 }}>To</Typography>
              <Box
                component="input"
                type="date"
                value={customEndDate}
                min={customStartDate || undefined}
                max={today}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomEndDateChange(e.target.value)}
                sx={DATE_INPUT_SX}
              />
            </Box>
          </Box>

          {/* Active range summary badge */}
          {customStartDate && customEndDate && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: '#DBEAFE',
                border: '1px solid #BFDBFE',
                borderRadius: '999px',
                px: 1.25,
                py: 0.35,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#1976D2', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#1D4ED8', lineHeight: 1 }}>
                {customStartDate === customEndDate
                  ? customStartDate
                  : `${customStartDate} to ${customEndDate}`}
              </Typography>
            </Box>
          )}

          {/* Clear custom range */}
          <IconButton
            size="small"
            onClick={() => onDateFilterChange('today')}
            sx={{
              ml: 'auto',
              p: 0.4,
              color: '#94a3b8',
              '&:hover': { color: '#ef4444', bgcolor: '#FEF2F2' },
            }}
            title="Clear custom range"
          >
            <Close sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      </Collapse>

      {/* Status filter tabs row */}
      <Tabs
        value={statusFilter}
        onChange={(_, v) => onStatusFilterChange(v as StatusFilter)}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: { backgroundColor: '#1976D2', height: 2, borderRadius: '2px 2px 0 0' },
        }}
        sx={{
          minHeight: 40,
          px: 1.5,
          borderTop: '1px solid #e0e0e0',
          '& .MuiTab-root': {
            minHeight: 40,
            fontSize: '0.78rem',
            textTransform: 'none',
            fontWeight: 600,
            py: 0,
            px: 1.5,
            color: '#666666',
            gap: 0.6,
          },
          '& .MuiTab-root.Mui-selected': { color: '#1C1C1E' },
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

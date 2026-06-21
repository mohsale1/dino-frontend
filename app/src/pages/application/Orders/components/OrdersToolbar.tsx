import React, { useEffect, useRef, useState } from 'react';
import {
  Box, InputBase, IconButton, Select, MenuItem,
  FormControl, Tabs, Tab, Typography, GlobalStyles, Collapse, Divider,
} from '@mui/material';
import {
  Search, Close, Refresh, DateRange as DateRangeIcon,
  TableRestaurant as TableRestaurantIcon,
} from '@mui/icons-material';
import { StatusFilter, DateFilter, TableFilter, STATUS_CONFIG } from '../orders.types';

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
  tableFilter: TableFilter;
  onTableFilterChange: (v: TableFilter) => void;
  availableTables: string[];
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
  if (!value) return '#00A6CA';
  return STATUS_CONFIG[value as keyof typeof STATUS_CONFIG]?.dot ?? '#00A6CA';
}

const DATE_INPUT_SX = {
  fontSize: '0.8rem',
  color: '#1C1C1E',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  px: 1.25,
  py: '5px',
  bgcolor: '#f8fafc',
  outline: 'none',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'border-color 0.15s',
  '&:focus': { borderColor: '#00A6CA' },
  '&::-webkit-calendar-picker-indicator': { cursor: 'pointer', opacity: 0.6 },
} as const;

const SELECT_SX = {
  borderRadius: 2,
  fontSize: '0.83rem',
  bgcolor: '#f8fafc',
  color: '#1C1C1E',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00A6CA' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00A6CA', borderWidth: 1 },
  '& .MuiSelect-select': { py: '6.5px' },
} as const;

const OrdersToolbar: React.FC<OrdersToolbarProps> = ({
  searchQuery, onSearchChange,
  statusFilter, onStatusFilterChange,
  dateFilter, onDateFilterChange,
  customStartDate, customEndDate,
  onCustomStartDateChange, onCustomEndDateChange,
  tableFilter, onTableFilterChange,
  availableTables,
  filteredCount, totalCount,
  onRefresh,
}) => {
  const today = new Date().toISOString().split('T')[0];

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

  const isTableFiltered = tableFilter !== '';
  const isDateCustom = dateFilter === 'custom';

  return (
    <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
      <GlobalStyles styles={{
        '@keyframes livePulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.72)' },
        },
      }} />

      {/* ── Main toolbar row ─────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5 },
          flexWrap: 'wrap',
        }}
      >
        {/* 1. Title + live dot */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '18px', sm: '22px' }, letterSpacing: '-0.3px', color: '#1C1C1E', lineHeight: 1 }}>
            Orders
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.25 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#16a34a',
                animation: 'livePulse 1.8s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 600, lineHeight: 1, letterSpacing: '0.02em' }}>
              Live
            </Typography>
          </Box>
        </Box>

        {/* 2. Search box */}
        <Box
          sx={{
            flex: '1 1 180px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: '#f8fafc',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            transition: 'border-color 0.15s',
            '&:focus-within': { borderColor: '#00A6CA' },
          }}
        >
          <Search sx={{ fontSize: 15, color: '#999999', flexShrink: 0 }} />
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

        {/* 3. Table filter */}
        <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 140 }, flexShrink: 0 }}>
          <Select
            value={tableFilter}
            onChange={(e) => onTableFilterChange(e.target.value as TableFilter)}
            displayEmpty
            renderValue={(val) => {
              if (!val) {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <TableRestaurantIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                    <span style={{ color: '#94a3b8' }}>All Tables</span>
                  </Box>
                );
              }
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <TableRestaurantIcon sx={{ fontSize: 14, color: '#00A6CA' }} />
                  <span>Table {val}</span>
                </Box>
              );
            }}
            sx={{
              ...SELECT_SX,
              bgcolor: isTableFiltered ? 'rgba(0,166,202,0.07)' : '#f8fafc',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isTableFiltered ? 'rgba(0,166,202,0.3)' : '#e0e0e0',
              },
            }}
          >
            <MenuItem value="" sx={{ fontSize: '0.83rem', color: '#64748b' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <TableRestaurantIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                All Tables
              </Box>
            </MenuItem>
            {availableTables.length > 0 && <Divider sx={{ my: 0.5 }} />}
            {availableTables.map((t) => (
              <MenuItem key={t} value={t} sx={{ fontSize: '0.83rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <TableRestaurantIcon sx={{ fontSize: 14, color: '#64748b' }} />
                  Table {t}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 4. Date filter */}
        <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 148 }, flexShrink: 0 }}>
          <Select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
            displayEmpty
            renderValue={(val) => {
              if (val === 'custom') {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <DateRangeIcon sx={{ fontSize: 14, color: '#00A6CA' }} />
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
              ...SELECT_SX,
              bgcolor: isDateCustom ? 'rgba(0,166,202,0.07)' : '#f8fafc',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDateCustom ? 'rgba(0,166,202,0.3)' : '#e0e0e0',
              },
            }}
          >
            <MenuItem value="today" sx={{ fontSize: '0.83rem' }}>Today</MenuItem>
            <MenuItem value="week" sx={{ fontSize: '0.83rem' }}>This Week</MenuItem>
            <MenuItem value="month" sx={{ fontSize: '0.83rem' }}>This Month</MenuItem>
            <MenuItem value="" sx={{ fontSize: '0.83rem' }}>All Dates</MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem value="custom" sx={{ fontSize: '0.83rem', color: '#00A6CA', fontWeight: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <DateRangeIcon sx={{ fontSize: 14 }} />
                Custom Range
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* 5. Refresh */}
        <IconButton
          onClick={onRefresh}
          sx={{
            width: 34,
            height: 34,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            color: '#666666',
            flexShrink: 0,
            '&:hover': { bgcolor: '#f8fafc', borderColor: '#00A6CA', color: '#00A6CA' },
          }}
        >
          <Refresh sx={{ fontSize: 17 }} />
        </IconButton>

        {/* 6. Count pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f8fafc',
            border: '1px solid #e0e0e0',
            borderRadius: '999px',
            px: 1.25,
            py: 0.4,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, color: '#666666', lineHeight: 1, whiteSpace: 'nowrap' }}>
            {filteredCount === totalCount
              ? `${totalCount} orders`
              : `${filteredCount} of ${totalCount}`}
          </Typography>
        </Box>
      </Box>

      {/* ── Custom date range row ─────────────────────────────────────────── */}
      <Collapse in={customRowVisible} timeout={200}>
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            bgcolor: '#f8fafc',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <DateRangeIcon sx={{ fontSize: 15, color: '#00A6CA', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#666666', flexShrink: 0 }}>
            Date Range
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#666666', flexShrink: 0 }}>From</Typography>
              <Box
                component="input"
                type="date"
                value={customStartDate}
                max={customEndDate || today}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomStartDateChange(e.target.value)}
                sx={DATE_INPUT_SX}
              />
            </Box>

            <Typography sx={{ fontSize: '0.75rem', color: '#999999' }}>—</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#666666', flexShrink: 0 }}>To</Typography>
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

          {customStartDate && customEndDate && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: 'rgba(0,166,202,0.08)',
                border: '1px solid rgba(0,166,202,0.2)',
                borderRadius: '999px',
                px: 1.25,
                py: 0.35,
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#00A6CA', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#00A6CA', lineHeight: 1 }}>
                {customStartDate === customEndDate
                  ? customStartDate
                  : `${customStartDate} to ${customEndDate}`}
              </Typography>
            </Box>
          )}

          <IconButton
            size="small"
            onClick={() => onDateFilterChange('today')}
            sx={{ ml: 'auto', p: 0.4, color: '#999999', '&:hover': { color: '#ef4444', bgcolor: '#FEF2F2' } }}
            title="Clear custom range"
          >
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Collapse>

      {/* ── Status tabs ───────────────────────────────────────────────────── */}
      <Tabs
        value={statusFilter}
        onChange={(_, v) => onStatusFilterChange(v as StatusFilter)}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: { backgroundColor: '#00A6CA', height: 2, borderRadius: '2px 2px 0 0' },
        }}
        sx={{
          minHeight: 38,
          px: { xs: 1, sm: 1.5 },
          borderTop: '1px solid #e0e0e0',
          '& .MuiTab-root': {
            minHeight: 38,
            fontSize: '0.77rem',
            textTransform: 'none',
            fontWeight: 600,
            py: 0,
            px: { xs: 1, sm: 1.5 },
            color: '#666666',
          },
          '& .MuiTab-root.Mui-selected': { color: '#1C1C1E' },
          '& .MuiTabs-scrollButtons': { width: 24 },
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
                        bgcolor: isActive ? dotColor : '#d1d5db',
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

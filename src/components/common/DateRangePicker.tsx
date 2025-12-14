import React from 'react';
import {
  Box,
  TextField,
  Stack,
  Button,
  Chip,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarToday,
  Today,
  DateRange as DateRangeIcon,
  Refresh,
} from '@mui/icons-material';

export type DateFilterPreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onApply?: () => void;
  showPresets?: boolean;
  showApplyButton?: boolean;
  label?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  onApply,
  showPresets = true,
  showApplyButton = false,
  label = 'Date Range',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedPreset, setSelectedPreset] = React.useState<DateFilterPreset>('today');

  // Helper function to format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get date range for preset
  const getPresetRange = (preset: DateFilterPreset): DateRange => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    switch (preset) {
      case 'today':
        return {
          startDate: formatDate(startOfToday),
          endDate: formatDate(startOfToday),
        };
      
      case 'yesterday':
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: formatDate(yesterday),
          endDate: formatDate(yesterday),
        };
      
      case 'last7days':
        const last7Days = new Date(startOfToday);
        last7Days.setDate(last7Days.getDate() - 6);
        return {
          startDate: formatDate(last7Days),
          endDate: formatDate(startOfToday),
        };
      
      case 'last30days':
        const last30Days = new Date(startOfToday);
        last30Days.setDate(last30Days.getDate() - 29);
        return {
          startDate: formatDate(last30Days),
          endDate: formatDate(startOfToday),
        };
      
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: formatDate(startOfMonth),
          endDate: formatDate(startOfToday),
        };
      
      case 'lastMonth':
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          startDate: formatDate(startOfLastMonth),
          endDate: formatDate(endOfLastMonth),
        };
      
      case 'custom':
      default:
        return value;
    }
  };

  // Handle preset selection
  const handlePresetClick = (preset: DateFilterPreset) => {
    setSelectedPreset(preset);
    const range = getPresetRange(preset);
    onChange(range);
    
    // Auto-apply if no apply button
    if (!showApplyButton && onApply) {
      onApply();
    }
  };

  // Handle manual date change
  const handleDateChange = (field: 'startDate' | 'endDate', newValue: string) => {
    setSelectedPreset('custom');
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  // Preset buttons configuration
  const presets: { key: DateFilterPreset; label: string; icon?: React.ReactNode }[] = [
    { key: 'today', label: 'Today', icon: <Today fontSize="small" /> },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7days', label: 'Last 7 Days' },
    { key: 'last30days', label: 'Last 30 Days' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack spacing={2}>
        {/* Label */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 14, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
        </Box>

        {/* Preset Buttons */}
        {showPresets && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ gap: 1 }}
          >
            {presets.map((preset) => (
              <Chip
                key={preset.key}
                label={preset.label}
                icon={preset.icon as any}
                onClick={() => handlePresetClick(preset.key)}
                color={selectedPreset === preset.key ? 'primary' : 'default'}
                variant={selectedPreset === preset.key ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: selectedPreset === preset.key ? 600 : 400,
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  height: isMobile ? 28 : 32,
                }}
              />
            ))}
          </Stack>
        )}

        {/* Date Inputs */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          alignItems={isMobile ? 'stretch' : 'center'}
        >
          <TextField
            label="Start Date"
            type="date"
            value={value.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth={isMobile}
            sx={{ minWidth: isMobile ? 'auto' : 180 }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DateRangeIcon sx={{ color: 'text.secondary', fontSize: 14 }} />
          </Box>
          
          <TextField
            label="End Date"
            type="date"
            value={value.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth={isMobile}
            sx={{ minWidth: isMobile ? 'auto' : 180 }}
            inputProps={{
              min: value.startDate, // Prevent end date before start date
            }}
          />

          {/* Apply Button */}
          {showApplyButton && onApply && (
            <Button
              variant="contained"
              onClick={onApply}
              startIcon={<Refresh />}
              size="medium"
              fullWidth={isMobile}
              sx={{
                minWidth: isMobile ? 'auto' : 120,
                fontWeight: 600,
              }}
            >
              Apply
            </Button>
          )}
        </Stack>

        {/* Selected Range Display */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: 'primary.lighter',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Selected Range:
          </Typography>
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {new Date(value.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {' → '}
            {new Date(value.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default DateRangePicker;
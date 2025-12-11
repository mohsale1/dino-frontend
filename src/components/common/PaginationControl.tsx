import React from 'react';
import {
  Box,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface PaginationControlProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showItemCount?: boolean;
  variant?: 'default' | 'compact';
}

const PaginationControl: React.FC<PaginationControlProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showItemCount = true,
  variant = 'default',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { page, pageSize, totalItems, totalPages } = pagination;

  // Calculate item range
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // Compact variant for mobile
  if (variant === 'compact' || isMobile) {
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
          {/* Item Count */}
          {showItemCount && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              fontWeight={500}
            >
              Showing {startItem}-{endItem} of {totalItems} items
            </Typography>
          )}

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => onPageChange(newPage)}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={1}
              showFirstButton={!isMobile}
              showLastButton={!isMobile}
            />
          </Box>

          {/* Page Size Selector */}
          {showPageSizeSelector && (
            <FormControl size="small" fullWidth>
              <InputLabel>Items per page</InputLabel>
              <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                label="Items per page"
              >
                {pageSizeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option} items
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Paper>
    );
  }

  // Default variant for desktop
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
      <Stack
        direction={isTablet ? 'column' : 'row'}
        spacing={2}
        alignItems={isTablet ? 'stretch' : 'center'}
        justifyContent="space-between"
      >
        {/* Left: Item Count */}
        {showItemCount && (
          <Box sx={{ minWidth: isTablet ? 'auto' : 200 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Showing{' '}
              <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
                {startItem}-{endItem}
              </Typography>
              {' '}of{' '}
              <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
                {totalItems}
              </Typography>
              {' '}items
            </Typography>
          </Box>
        )}

        {/* Center: Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => onPageChange(newPage)}
            color="primary"
            size="medium"
            siblingCount={1}
            boundaryCount={1}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 500,
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                fontWeight: 700,
              },
            }}
          />
        </Box>

        {/* Right: Page Size Selector */}
        {showPageSizeSelector && (
          <FormControl size="small" sx={{ minWidth: isTablet ? 'auto' : 150 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              label="Per page"
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </Paper>
  );
};

export default PaginationControl;

// Helper hook for managing pagination state
export const usePagination = (initialPageSize: number = 20) => {
  const [pagination, setPagination] = React.useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0,
  });

  const updateTotalItems = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / pagination.pageSize);
    setPagination((prev) => ({
      ...prev,
      totalItems,
      totalPages,
      // Reset to page 1 if current page exceeds total pages
      page: prev.page > totalPages ? 1 : prev.page,
    }));
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const setPageSize = (pageSize: number) => {
    const totalPages = Math.ceil(pagination.totalItems / pageSize);
    setPagination((prev) => ({
      ...prev,
      pageSize,
      totalPages,
      page: 1, // Reset to first page when changing page size
    }));
  };

  const reset = () => {
    setPagination({
      page: 1,
      pageSize: initialPageSize,
      totalItems: 0,
      totalPages: 0,
    });
  };

  return {
    pagination,
    updateTotalItems,
    setPage,
    setPageSize,
    reset,
  };
};

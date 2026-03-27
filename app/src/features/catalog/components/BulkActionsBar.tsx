import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  MenuItem,
  TextField,
  Slide,
} from '@mui/material';
import {
  Close,
  Delete,
  Visibility,
  VisibilityOff,
  Category as CategoryIcon,
} from '@mui/icons-material';
import type { Category } from '../types';

export interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkToggleAvailability: (available: boolean) => void;
  onBulkChangeCategory?: (categoryId: string) => void;
  categories?: Category[];
  show: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkToggleAvailability,
  onBulkChangeCategory,
  categories = [],
  show,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const handleCategoryChange = () => {
    if (selectedCategory && onBulkChangeCategory) {
      onBulkChangeCategory(selectedCategory);
      setSelectedCategory('');
    }
  };

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          maxWidth: 800,
          width: '90%',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            {/* Selection Info */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={selectedCount}
                color="primary"
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Typography variant="body2" fontWeight={500}>
                {selectedCount === 1 ? 'item' : 'items'} selected
              </Typography>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            {/* Actions */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ flex: 1 }}
            >
              <Button
                size="small"
                startIcon={<Visibility />}
                onClick={() => onBulkToggleAvailability(true)}
                variant="outlined"
              >
                Make Available
              </Button>
              <Button
                size="small"
                startIcon={<VisibilityOff />}
                onClick={() => onBulkToggleAvailability(false)}
                variant="outlined"
              >
                Make Unavailable
              </Button>

              {onBulkChangeCategory && categories.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                  <TextField
                    select
                    size="small"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    placeholder="Change category"
                    sx={{ minWidth: 150, flex: 1 }}
                    InputProps={{
                      startAdornment: <CategoryIcon fontSize="small" sx={{ mr: 1 }} />,
                    }}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    size="small"
                    onClick={handleCategoryChange}
                    disabled={!selectedCategory}
                    variant="outlined"
                  >
                    Apply
                  </Button>
                </Stack>
              )}

              <Button
                size="small"
                startIcon={<Delete />}
                onClick={onBulkDelete}
                color="error"
                variant="outlined"
              >
                Delete
              </Button>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            {/* Clear Selection */}
            <Button
              size="small"
              startIcon={<Close />}
              onClick={onClearSelection}
              variant="text"
              color="inherit"
            >
              Clear
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Slide>
  );
};

export default BulkActionsBar;
/**
 * CategoryCard Component - Clean Professional Design
 * 
 * Display individual category
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import type { Category } from '../../../features/catalog/types';

interface CategoryCardProps {
  category: Category;
  itemCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  itemCount,
  onEdit,
  onDelete,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
      onClick={() => onEdit(category)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CategoryIcon sx={{ fontSize: 24, color: '#6b7280' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              fontSize: '1.125rem',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {category.name}
          </Typography>
          <Chip
            label={`${itemCount} items`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #e5e7eb',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      {category.description && (
        <Typography
          variant="body2"
          sx={{
            color: '#6b7280',
            fontSize: '0.875rem',
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            flex: 1,
          }}
        >
          {category.description}
        </Typography>
      )}

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
          mt: 'auto',
          pt: 2,
          borderTop: '1px solid #f3f4f6',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="Edit category">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                color: '#1a1a1a',
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete category">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category);
            }}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#fee2e2',
                color: '#991b1b',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default CategoryCard;
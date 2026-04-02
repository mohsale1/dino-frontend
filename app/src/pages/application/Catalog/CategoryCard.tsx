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
        p: { xs: 2, sm: 3 },
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
      }}
      onClick={() => onEdit(category)}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: 1.5,
            bgcolor: 'rgba(15,23,42,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CategoryIcon sx={{ fontSize: 24, color: '#0f172a' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
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
              bgcolor: 'rgba(15,23,42,0.06)',
              color: '#0f172a',
              border: '1px solid rgba(15,23,42,0.1)',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      {category.description && (
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
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
          pt: { xs: 1.5, sm: 2 },
          borderTop: '1px solid #f1f5f9',
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
              color: '#94a3b8',
              '&:hover': {
                color: '#0f172a',
                bgcolor: 'rgba(15,23,42,0.06)',
              },
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
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
              color: '#94a3b8',
              '&:hover': {
                color: '#f43f5e',
                bgcolor: 'rgba(244,63,94,0.08)',
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default CategoryCard;
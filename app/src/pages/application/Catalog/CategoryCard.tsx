import React from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import {
  Category as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Category } from '../../../features/catalog/types';

const T = {
  primary: '#00A6CA',
  primaryBg: 'rgba(0,166,202,0.08)',
  primaryBorder: 'rgba(0,166,202,0.2)',
  textPri: '#1C1C1E',
  textSec: '#666666',
  textMuted: '#999999',
  border: '#e0e0e0',
  surface: '#ffffff',
  bg: '#f8fafc',
};

interface CategoryCardProps {
  category: Category;
  itemCount?: number;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  itemCount = 0,
  onEdit,
  onDelete,
}) => {
  return (
    <Box
      sx={{
        bgcolor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'box-shadow 0.15s',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          borderColor: '#bdbdbd',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: T.primaryBg,
          borderBottom: `1px solid ${T.primaryBorder}`,
          px: 2.5,
          pt: 2.5,
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        {/* Icon box */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: T.surface,
            border: `1px solid ${T.primaryBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CategoryIcon sx={{ fontSize: 22, color: T.primary }} />
        </Box>

        {/* Name + count */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: T.textPri,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {category.name}
          </Typography>

          <Chip
            label={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            size="small"
            sx={{
              alignSelf: 'flex-start',
              height: 18,
              fontSize: '0.68rem',
              fontWeight: 600,
              bgcolor: T.surface,
              border: `1px solid ${T.primaryBorder}`,
              color: T.primary,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 2.5, pt: 1.5, pb: 2 }}>
        {category.description ? (
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: T.textSec,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {category.description}
          </Typography>
        ) : (
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: T.textMuted,
              fontStyle: 'italic',
            }}
          >
            No description
          </Typography>
        )}
      </Box>

      {/* Actions */}
      <Box
        sx={{
          borderTop: `1px solid ${T.border}`,
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.5,
        }}
      >
        <Tooltip title="Edit category" arrow>
          <span>
            <IconButton
              size="small"
              disabled={!onEdit}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(category);
              }}
              sx={{
                borderRadius: 1.5,
                color: T.textMuted,
                '&:hover': {
                  color: T.textPri,
                  bgcolor: 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Delete category" arrow>
          <span>
            <IconButton
              size="small"
              disabled={!onDelete}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(category);
              }}
              sx={{
                borderRadius: 1.5,
                color: T.textMuted,
                '&:hover': {
                  color: '#EB0000',
                  bgcolor: 'rgba(235,0,0,0.06)',
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default CategoryCard;

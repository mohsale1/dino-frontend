import React from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Category as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Category } from '../../../features/catalog/types';

interface CategoryCardProps {
  category: Category;
  itemCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const PALETTE = [
  { bg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', accent: '#7c3aed', light: '#ede9fe', border: '#c4b5fd' },
  { bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', accent: '#1d4ed8', light: '#dbeafe', border: '#93c5fd' },
  { bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', accent: '#15803d', light: '#dcfce7', border: '#86efac' },
  { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', accent: '#b45309', light: '#fef3c7', border: '#fcd34d' },
  { bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', accent: '#dc2626', light: '#fee2e2', border: '#fca5a5' },
  { bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', accent: '#0369a1', light: '#e0f2fe', border: '#7dd3fc' },
  { bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', accent: '#be185d', light: '#fce7f3', border: '#f9a8d4' },
  { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', accent: '#166534', light: '#f0fdf4', border: '#86efac' },
];

const getPalette = (id: string) => {
  const idx = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[idx];
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, itemCount, onEdit, onDelete }) => {
  const p = getPalette(category.id);

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.15s, transform 0.15s',
        '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.09)', transform: 'translateY(-2px)' },
      }}
    >
      {/* Coloured top band */}
      <Box
        sx={{
          background: p.bg,
          px: 2.5,
          pt: 2.5,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        {/* Icon circle */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.7),
            border: `1.5px solid ${p.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 2px 8px ${alpha(p.accent, 0.15)}`,
          }}
        >
          <CategoryIcon sx={{ fontSize: 24, color: p.accent }} />
        </Box>

        {/* Item count badge */}
        <Box
          sx={{
            px: 1.25,
            py: 0.4,
            borderRadius: 10,
            bgcolor: alpha('#fff', 0.65),
            border: `1px solid ${p.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: p.accent, lineHeight: 1 }}>
            {itemCount}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: alpha(p.accent, 0.75), lineHeight: 1 }}>
            {itemCount === 1 ? 'item' : 'items'}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2.5, pt: 1.75, pb: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '0.95rem',
              lineHeight: 1.3,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {category.name}
          </Typography>
          <Chip
            label={category.isActive ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.62rem',
              fontWeight: 700,
              flexShrink: 0,
              bgcolor: category.isActive ? '#dcfce7' : '#f1f5f9',
              color: category.isActive ? '#15803d' : '#94a3b8',
              border: `1px solid ${category.isActive ? '#bbf7d0' : '#e2e8f0'}`,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>

        {category.description ? (
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: '#64748b',
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
          <Typography sx={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic' }}>
            No description
          </Typography>
        )}
      </Box>

      {/* Divider + Actions */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.25,
        }}
      >
        <Tooltip title="Edit category" arrow>
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onEdit(category); }}
            sx={{ color: '#94a3b8', borderRadius: 1.5, '&:hover': { color: '#0f172a', bgcolor: alpha('#0f172a', 0.06) } }}
          >
            <EditIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete category" arrow>
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onDelete(category); }}
            sx={{ color: '#94a3b8', borderRadius: 1.5, '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) } }}
          >
            <DeleteIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default CategoryCard;

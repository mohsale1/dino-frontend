/**
 * CatalogItemCard Component - Clean Professional Design
 *
 * Display individual catalog item
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import type { CatalogItem } from '../../../features/catalog/types';

interface CatalogItemCardProps {
  item: CatalogItem;
  categoryName?: string;
  onEdit: (item: CatalogItem) => void;
  onDelete: (item: CatalogItem) => void;
  onToggleAvailability: (itemId: string) => void;
  onImageUpload: (itemId: string, file: File) => void;
}

const CatalogItemCard: React.FC<CatalogItemCardProps> = ({
  item,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailability,
  onImageUpload,
}) => {
  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageUpload(item.id, file);
      }
    };
    input.click();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
      }}
    >
      {/* Image */}
      <Box
        onClick={handleImageClick}
        sx={{
          height: 180,
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            backgroundColor: '#f1f5f9',
          },
        }}
      >
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <img
            src={item.imageUrls[0]}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <ImageIcon sx={{ fontSize: 48, color: '#94a3b8' }} />
        )}
        <Chip
          label={item.isAvailable ? 'Available' : 'Unavailable'}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAvailability(item.id);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: item.isAvailable
              ? 'rgba(16,185,129,0.9)'
              : 'rgba(239,68,68,0.9)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: item.isAvailable
                ? 'rgba(16,185,129,1)'
                : 'rgba(239,68,68,1)',
            },
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            fontSize: '1rem',
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </Typography>

        {categoryName && (
          <Typography
            variant="body2"
            sx={{ color: '#64748b', fontSize: '0.8125rem', mb: 1 }}
          >
            {categoryName}
          </Typography>
        )}

        {item.description && (
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontSize: '0.8125rem',
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              flex: 1,
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* Price */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.125rem' }}
          >
            ${(item.basePrice ?? 0).toFixed(2)}
          </Typography>
          {item.preparationTime && (
            <Typography
              variant="caption"
              sx={{ color: '#94a3b8', fontSize: '0.75rem' }}
            >
              {item.preparationTime} min
            </Typography>
          )}
        </Box>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  backgroundColor: 'rgba(25,118,210,0.06)',
                  color: '#1976d2',
                  border: '1px solid rgba(25,118,210,0.15)',
                }}
              />
            ))}
          </Box>
        )}

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            pt: 2,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <Tooltip title="Edit item">
            <IconButton
              size="small"
              onClick={() => onEdit(item)}
              sx={{
                color: '#94a3b8',
                '&:hover': {
                  backgroundColor: 'rgba(25,118,210,0.08)',
                  color: '#1976d2',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete item">
            <IconButton
              size="small"
              onClick={() => onDelete(item)}
              sx={{
                color: '#94a3b8',
                '&:hover': {
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  color: '#dc2626',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default CatalogItemCard;
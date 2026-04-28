import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Schedule as ScheduleIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from '@mui/icons-material';
import type { CatalogItem } from '../../../features/catalog/types';
import { formatCurrency } from '../../../utils/helpers/formatters';

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
  success: '#008A00',
  error: '#EB0000',
};

interface CatalogItemCardProps {
  item: CatalogItem;
  categoryName?: string;
  onEdit?: (item: CatalogItem) => void;
  onDelete?: (item: CatalogItem) => void;
  onToggleAvailability?: (itemId: string) => void;
  onImageUpload?: (itemId: string, file: File) => void;
}

const CatalogItemCard: React.FC<CatalogItemCardProps> = ({
  item,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailability,
  onImageUpload: _onImageUpload,
}) => {
  const imageUrl = item.imageUrls?.[0];

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
        transition: 'box-shadow 0.15s, border-color 0.15s',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          borderColor: '#bdbdbd',
        },
      }}
    >
      {/* Image Section */}
      <Box
        sx={{
          height: 160,
          bgcolor: T.bg,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <RestaurantMenuIcon sx={{ fontSize: 40, color: '#d1d5db' }} />
        )}

        {/* Availability badge — top-left */}
        {!item.isAvailable && (
          <Chip
            label="Unavailable"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              height: 20,
              fontSize: '0.68rem',
              fontWeight: 600,
              bgcolor: 'rgba(235,0,0,0.85)',
              color: '#ffffff',
              border: 'none',
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        )}

        {/* Prep time badge — bottom-left */}
        {item.preparationTime != null && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
              bgcolor: 'rgba(0,0,0,0.65)',
              color: '#ffffff',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.68rem',
              lineHeight: 1,
            }}
          >
            <ScheduleIcon sx={{ fontSize: 12, color: '#ffffff' }} />
            <Typography
              component="span"
              sx={{ fontSize: '0.68rem', color: '#ffffff', lineHeight: 1, fontWeight: 500 }}
            >
              {item.preparationTime} min
            </Typography>
          </Box>
        )}

        {/* Veg / non-veg indicator — top-right */}
        {item.isVegetarian != null && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 14,
              height: 14,
              border: `1.5px solid ${item.isVegetarian ? T.success : T.error}`,
              borderRadius: 0.5,
              bgcolor: T.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: item.isVegetarian ? T.success : T.error,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        {/* Item name */}
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: T.textPri,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.name}
        </Typography>

        {/* Price */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: T.primary,
            mt: 0.5,
          }}
        >
          {formatCurrency(item.basePrice)}
        </Typography>

        {/* Category chip */}
        {categoryName && (
          <Box sx={{ mt: 0.75 }}>
            <Chip
              label={categoryName}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.68rem',
                fontWeight: 500,
                bgcolor: T.primaryBg,
                color: T.primary,
                border: `1px solid ${T.primaryBorder}`,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          </Box>
        )}

        {/* Description */}
        {item.description && (
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: T.textSec,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mt: 0.75,
              flex: 1,
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {item.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.68rem',
                  fontWeight: 400,
                  bgcolor: T.bg,
                  color: T.textMuted,
                  border: `1px solid ${T.border}`,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Actions Section */}
      <Box
        sx={{
          borderTop: `1px solid ${T.border}`,
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {/* Toggle availability */}
        <Tooltip
          title={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
          arrow
        >
          <IconButton
            size="small"
            onClick={() => onToggleAvailability?.(item.id)}
            sx={{
              borderRadius: 1.5,
              color: T.textMuted,
              '&:hover': {
                color: item.isAvailable ? T.error : T.success,
                bgcolor: item.isAvailable
                  ? 'rgba(235,0,0,0.06)'
                  : 'rgba(0,138,0,0.06)',
              },
            }}
          >
            {item.isAvailable ? (
              <VisibilityOffIcon sx={{ fontSize: 16 }} />
            ) : (
              <VisibilityIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Edit */}
        <Tooltip title="Edit item" arrow>
          <IconButton
            size="small"
            onClick={() => onEdit?.(item)}
            sx={{
              borderRadius: 1.5,
              color: T.textMuted,
              '&:hover': {
                color: T.textPri,
                bgcolor: 'rgba(28,28,30,0.06)',
              },
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {/* Delete */}
        <Tooltip title="Delete item" arrow>
          <IconButton
            size="small"
            onClick={() => onDelete?.(item)}
            sx={{
              borderRadius: 1.5,
              color: T.textMuted,
              '&:hover': {
                color: T.error,
                bgcolor: 'rgba(235,0,0,0.06)',
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default CatalogItemCard;

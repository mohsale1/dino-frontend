import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  CardMedia,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Schedule,
  Inventory,
} from '@mui/icons-material';
import { formatCurrency } from '../../../utils/data';
import type { CatalogItem } from '../types';

export interface CatalogItemCardAdminProps {
  item: CatalogItem;
  categoryName?: string;
  onToggleAvailability?: (itemId: string) => void;
  onImageUpload?: (itemId: string, file: File) => void;
  onEdit?: (item: CatalogItem) => void;
  onDelete?: (itemId: string) => void;
  showActions?: boolean;
  showImageUpload?: boolean;
}

export const CatalogItemCardAdmin: React.FC<CatalogItemCardAdminProps> = ({
  item,
  categoryName,
  onToggleAvailability,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        opacity: item.isAvailable ? 1 : 0.6,
        transition: 'all 0.2s',
        overflow: 'hidden',
        '&:hover': {
          borderColor: '#bdbdbd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Image Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          height: 160,
          backgroundColor: '#f5f5f5',
        }}
      >
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <CardMedia
            component="img"
            image={item.imageUrls[0]}
            alt={item.name}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inventory sx={{ fontSize: 40, color: '#bdbdbd' }} />
          </Box>
        )}

        {!item.isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            <Chip label="Unavailable" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
          </Box>
        )}

        {item.preparationTime && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Schedule sx={{ fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {item.preparationTime} min
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ mb: 0.5 }}>
          {item.isVegetarian !== undefined && (
            <Box
              sx={{
                width: 14,
                height: 14,
                border: `2px solid ${item.isVegetarian ? '#4caf50' : '#f44336'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: item.isVegetarian ? '50%' : 0,
                  backgroundColor: item.isVegetarian ? '#4caf50' : '#f44336',
                }}
              />
            </Box>
          )}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.3,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.name}
          </Typography>
        </Stack>

        <Typography variant="h6" color="text.primary" fontWeight={600} sx={{ mb: 1 }}>
          {formatCurrency(item.basePrice)}
        </Typography>

        {categoryName && (
          <Box sx={{ mb: 1 }}>
            <Chip label={categoryName} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
          </Box>
        )}

        {item.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              fontSize: '0.8rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {item.description}
          </Typography>
        )}

        <Divider sx={{ mb: 1.5 }} />

        {showActions && (
          <Stack direction="row" spacing={0.5}>
            {onToggleAvailability && (
              <Tooltip title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}>
                <IconButton
                  size="small"
                  onClick={() => onToggleAvailability(item.id)}
                  sx={{ border: '1px solid #e0e0e0' }}
                >
                  {item.isAvailable ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit(item)}
                  sx={{ border: '1px solid #e0e0e0' }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete(item.id)}
                  sx={{ border: '1px solid #e0e0e0' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default CatalogItemCardAdmin;
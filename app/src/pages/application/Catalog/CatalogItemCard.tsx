import React, { useRef } from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  AccessTime as AccessTimeIcon,
  CameraAlt as CameraAltIcon,
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
  item, categoryName, onEdit, onDelete, onToggleAvailability, onImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrl = item.imageUrls?.[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(item.id, file);
    e.target.value = '';
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.15s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* Image area */}
      <Box
        onClick={() => fileInputRef.current?.click()}
        sx={{
          position: 'relative',
          height: 150,
          bgcolor: '#f8fafc',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover .img-overlay': { opacity: 1 },
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={item.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
            <ImageIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
              Click to add image
            </Typography>
          </Box>
        )}

        {/* Hover overlay */}
        <Box
          className="img-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(15,23,42,0.52)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
        >
          <CameraAltIcon sx={{ fontSize: 22, color: '#fff' }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#fff', fontWeight: 600, letterSpacing: '0.02em' }}>
            Change Image
          </Typography>
        </Box>

        {/* Veg indicator — top left */}
        {item.isVegetarian && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 20,
              height: 20,
              borderRadius: 0.5,
              bgcolor: '#fff',
              border: '1.5px solid #16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#16a34a' }} />
          </Box>
        )}

        {/* Availability toggle pill — top right */}
        <Box
          onClick={(e) => { e.stopPropagation(); onToggleAvailability(item.id); }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.4,
            px: 1,
            py: 0.3,
            borderRadius: 999,
            bgcolor: item.isAvailable ? '#dcfce7' : '#fee2e2',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            '&:hover': { opacity: 0.85 },
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: item.isAvailable ? '#15803d' : '#dc2626',
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: item.isAvailable ? '#15803d' : '#dc2626',
              lineHeight: 1,
            }}
          >
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </Typography>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {/* Category chip */}
        {categoryName && (
          <Chip
            label={categoryName}
            size="small"
            sx={{
              alignSelf: 'flex-start',
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        )}

        {/* Item name */}
        <Typography
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            fontSize: '0.9rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.name}
        </Typography>

        {/* Description */}
        {item.description && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* Prep time */}
        {item.preparationTime && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
              {item.preparationTime} min
            </Typography>
          </Box>
        )}

        {/* Bottom row: price + actions */}
        <Box
          sx={{
            mt: 'auto',
            pt: 0.75,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            {formatPrice(item.basePrice)}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <Tooltip title="Edit item" arrow>
              <IconButton
                size="small"
                onClick={() => onEdit(item)}
                sx={{
                  color: '#94a3b8',
                  borderRadius: 1.5,
                  '&:hover': { color: '#0f172a', bgcolor: alpha('#0f172a', 0.06) },
                }}
              >
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete item" arrow>
              <IconButton
                size="small"
                onClick={() => onDelete(item)}
                sx={{
                  color: '#94a3b8',
                  borderRadius: 1.5,
                  '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) },
                }}
              >
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CatalogItemCard;

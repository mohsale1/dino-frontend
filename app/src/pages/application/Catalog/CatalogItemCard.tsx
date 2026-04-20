import React, { useRef } from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
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
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.15s, transform 0.15s',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
      }}
    >
      {/* Image area */}
      <Box
        onClick={() => fileInputRef.current?.click()}
        sx={{
          position: 'relative',
          height: 160,
          bgcolor: '#f8fafc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '&:hover .upload-overlay': { opacity: 1 },
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={item.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <ImageIcon sx={{ fontSize: 36, color: '#cbd5e1' }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Click to upload</Typography>
          </Box>
        )}

        {/* Upload overlay */}
        <Box
          className="upload-overlay"
          sx={{
            position: 'absolute', inset: 0,
            bgcolor: 'rgba(15,23,42,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.15s',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <ImageIcon sx={{ fontSize: 24, color: '#fff' }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>Change Image</Typography>
          </Box>
        </Box>

        {/* Availability badge */}
        <Box
          onClick={e => { e.stopPropagation(); onToggleAvailability(item.id); }}
          sx={{
            position: 'absolute', top: 8, right: 8,
            display: 'flex', alignItems: 'center', gap: 0.4,
            px: 1, py: 0.3,
            borderRadius: 10,
            bgcolor: item.isAvailable ? alpha('#10b981', 0.9) : alpha('#ef4444', 0.9),
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            '&:hover': { opacity: 0.85 },
          }}
        >
          {item.isAvailable
            ? <CheckCircleIcon sx={{ fontSize: 11, color: '#fff' }} />
            : <CancelIcon sx={{ fontSize: 11, color: '#fff' }} />
          }
          <Typography sx={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </Typography>
        </Box>

        {/* Veg indicator */}
        {item.isVegetarian && (
          <Box sx={{
            position: 'absolute', top: 8, left: 8,
            width: 20, height: 20, borderRadius: 0.5,
            bgcolor: '#fff', border: '1.5px solid #16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#16a34a' }} />
          </Box>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {/* Category chip */}
        {categoryName && (
          <Chip
            label={categoryName}
            size="small"
            sx={{ alignSelf: 'flex-start', height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', '& .MuiChip-label': { px: 0.75 } }}
          />
        )}

        {/* Name */}
        <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.name}
        </Typography>

        {/* Description */}
        {item.description && (
          <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </Typography>
        )}

        {/* Prep time */}
        {item.preparationTime && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
              {item.preparationTime} min
            </Typography>
          </Box>
        )}

        {/* Price + Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 0.5 }}>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.02em' }}>
            {formatPrice(item.basePrice)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <Tooltip title="Edit item" arrow>
              <IconButton size="small" onClick={() => onEdit(item)}
                sx={{ color: '#94a3b8', borderRadius: 1.5, '&:hover': { color: '#0f172a', bgcolor: alpha('#0f172a', 0.06) } }}>
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete item" arrow>
              <IconButton size="small" onClick={() => onDelete(item)}
                sx={{ color: '#94a3b8', borderRadius: 1.5, '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) } }}>
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
import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { CatalogItem } from '../types';
import { formatCurrency } from '../../../utils/data';

export interface CatalogItemCardProps {
  item: CatalogItem;
  categoryName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export const CatalogItemCard: React.FC<CatalogItemCardProps> = ({
  item,
  categoryName,
  onClick,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        opacity: item.isAvailable ? 1 : 0.6,
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        } : {},
      }}
      onClick={onClick}
    >
      {!!item.imageUrl && (
        <CardMedia
          component="img"
          height="160"
          image={item.imageUrl}
          alt={item.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box mb={1}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={700}>
            {formatCurrency(item.basePrice)}
          </Typography>
        </Box>

        {categoryName && (
          <Chip
            label={categoryName}
            size="small"
            variant="outlined"
            sx={{ mb: 1 }}
          />
        )}

        {item.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>
        )}

        {!item.isAvailable && (
          <Box mt={2}>
            <Chip label="Unavailable" size="small" color="default" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CatalogItemCard;

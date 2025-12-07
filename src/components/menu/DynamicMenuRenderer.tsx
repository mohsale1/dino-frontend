import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Chip,
  alpha,
  Stack,
  Button,
} from '@mui/material';
import {
  Restaurant,
  LocalFireDepartment,
  Whatshot,
  NewReleases,
  Add,
} from '@mui/icons-material';
import { MenuTemplateConfig } from '../../config/menuTemplates';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg?: boolean;
  image?: string;
  rating?: number;
  isPopular?: boolean;
  isNew?: boolean;
  spicyLevel?: number;
}

interface DynamicMenuRendererProps {
  items: MenuItem[];
  template: MenuTemplateConfig;
  onItemClick?: (item: MenuItem) => void;
}

const DynamicMenuRenderer: React.FC<DynamicMenuRendererProps> = ({
  items,
  template,
  onItemClick,
}) => {
  const { colors, typography, card, item: itemConfig } = template;

  const VegNonVegIcon = ({ isVeg }: { isVeg?: boolean }) => (
    <Box
      sx={{
        width: 14,
        height: 14,
        border: `2px solid ${isVeg ? '#4CAF50' : '#F44336'}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: isVeg ? '50%' : 0,
          backgroundColor: isVeg ? '#4CAF50' : '#F44336',
        }}
      />
    </Box>
  );

  const renderMenuItem = (menuItem: MenuItem) => (
    <Card
      key={menuItem.id}
      onClick={() => onItemClick?.(menuItem)}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        mb: 1.5,
        borderRadius: card.borderRadius / 4,
        backgroundColor: colors.cardBackground,
        border: `1px solid ${alpha(colors.primary, 0.1)}`,
        boxShadow: card.showShadow ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        overflow: 'hidden',
        cursor: onItemClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* Left side - Image */}
      {card.showImage && menuItem.image ? (
        <Box
          sx={{
            position: 'relative',
            width: 100,
            minWidth: 100,
            height: 100,
            flexShrink: 0,
          }}
        >
          <CardMedia
            component="img"
            image={menuItem.image}
            alt={menuItem.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          
          {/* Badges on image */}
          {itemConfig.showBadges && (menuItem.isNew || menuItem.isPopular) && (
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                left: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {menuItem.isNew && (
                <Chip
                  icon={<NewReleases sx={{ fontSize: 10 }} />}
                  label="New"
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    '& .MuiChip-label': { px: 0.5 },
                  }}
                />
              )}
              {menuItem.isPopular && (
                <Chip
                  icon={<Whatshot sx={{ fontSize: 10 }} />}
                  label="Popular"
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    '& .MuiChip-label': { px: 0.5 },
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            width: 100,
            minWidth: 100,
            height: 100,
            backgroundColor: alpha(colors.primary, 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Restaurant sx={{ fontSize: 40, color: alpha(colors.primary, 0.3) }} />
        </Box>
      )}

      {/* Right side - Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 1.5,
          minWidth: 0,
        }}
      >
        {/* Header - Name and Veg/Non-Veg */}
        <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 0.5 }}>
          <VegNonVegIcon isVeg={menuItem.isVeg} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: typography.headerFont,
              fontSize: '0.9rem',
              fontWeight: 600,
              color: colors.textPrimary,
              lineHeight: 1.3,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {menuItem.name}
          </Typography>
        </Stack>

        {/* Description */}
        {itemConfig.showDescription && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: typography.bodyFont,
              fontSize: '0.75rem',
              color: colors.textSecondary,
              mb: 1,
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {menuItem.description}
          </Typography>
        )}

        {/* Spicy Level */}
        {menuItem.spicyLevel && menuItem.spicyLevel > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
            {[...Array(Math.min(menuItem.spicyLevel, 3))].map((_, i) => (
              <LocalFireDepartment
                key={i}
                sx={{
                  fontSize: 12,
                  color: menuItem.spicyLevel === 1 ? '#FFA726' : menuItem.spicyLevel === 2 ? '#FF7043' : '#F44336',
                }}
              />
            ))}
          </Box>
        )}

        {/* Footer - Price and Add Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 'auto',
          }}
        >
          {itemConfig.showPrice && (
            <Typography
              variant="h6"
              sx={{
                fontFamily: typography.headerFont,
                fontSize: '1rem',
                fontWeight: 700,
                color: colors.primary,
              }}
            >
              ₹{menuItem.price}
            </Typography>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<Add sx={{ fontSize: 16 }} />}
            sx={{
              minWidth: 70,
              height: 28,
              fontSize: '0.7rem',
              fontWeight: 600,
              borderColor: colors.primary,
              color: colors.primary,
              textTransform: 'none',
              borderRadius: 1.5,
              px: 1.5,
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.08),
                borderColor: colors.primary,
              },
            }}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Card>
  );

  // Debug: Log items
  return (
    <Box
      sx={{
        backgroundColor: colors.background,
      }}
    >
      {items.length > 0 ? (
        items.map(renderMenuItem)
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            backgroundColor: colors.cardBackground,
            borderRadius: card.borderRadius / 4,
            border: `1px dashed ${alpha(colors.primary, 0.2)}`,
          }}
        >
          <Restaurant sx={{ fontSize: 48, color: colors.textSecondary, mb: 1.5, opacity: 0.5 }} />
          <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.85rem' }}>
            No menu items available
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DynamicMenuRenderer;
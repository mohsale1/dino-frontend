import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Divider,
  useTheme,
  alpha,
  CardMedia
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Schedule,
  Upload,
  Restaurant
} from '@mui/icons-material';
import { useMenuFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

interface MenuItemCardProps {
  item: any;
  getCategoryName: (categoryId: string) => string;
  formatCurrency: (amount: number) => string;
  onToggleAvailability: (itemId: string) => void;
  onQuickImageUpload: (itemId: string, file: File) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (itemId: string) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  getCategoryName,
  formatCurrency,
  onToggleAvailability,
  onQuickImageUpload,
  onEditItem,
  onDeleteItem
}) => {
  const theme = useTheme();
  const menuFlags = useMenuFlags();

  const VegNonVegIcon = ({ isVeg }: { isVeg: boolean }) => (
    <Box
      sx={{
        width: 16,
        height: 16,
        border: `2px solid ${isVeg ? '#4CAF50' : '#F44336'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: isVeg ? '50%' : 0,
          backgroundColor: isVeg ? '#4CAF50' : '#F44336',
        }}
      />
    </Box>
  );

  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        border: '1px solid', 
        borderColor: 'divider',
        borderRadius: 1,
        opacity: (item.available ?? item.isAvailable) ? 1 : 0.7,
        transition: 'all 0.3s ease-in-out',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': { 
          borderColor: 'primary.main',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: item.isVeg ? '#4CAF50' : '#F44336',
        }
      }}
    >
      {/* Image Section - Top Half */}
      <Box sx={{ 
        position: 'relative', 
        overflow: 'hidden',
        height: { xs: 120, sm: 140 }, // More compact height
        backgroundColor: 'grey.50'
      }}>
        {(item.image || (item.image_urls && item.image_urls.length > 0)) ? (
          <CardMedia
            component="img"
            image={item.image || item.image_urls?.[0]}
            alt={item.name}
            sx={{ 
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              backgroundColor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Restaurant sx={{ fontSize: { xs: 40, sm: 48 }, color: 'grey.400' }} />
          </Box>
        )}

        {/* Status Badges */}
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          left: 8, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.5,
        }}>
          {item.featured && (
            <Chip 
              label="Featured" 
              size="small" 
              color="primary" 
              sx={{ 
                fontSize: '0.65rem',
                fontWeight: 600,
                height: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            />
          )}
          {!(item.available ?? item.isAvailable) && (
            <Chip 
              label="Unavailable" 
              size="small" 
              variant="filled"
              sx={{ 
                fontSize: '0.65rem',
                fontWeight: 600,
                height: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                backgroundColor: '#9E9E9E',
                color: 'white',
              }}
            />
          )}
        </Box>

        {/* Quick Actions */}
        <FlagGate flag="menu.showQuickImageUpload">
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}>
            <Tooltip title="Upload Image">
              <IconButton 
                size="small" 
                component="label"
                sx={{ 
                  backgroundColor: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { 
                    backgroundColor: theme.palette.background.paper,
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <Upload fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onQuickImageUpload(item.id, file);
                    }
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </FlagGate>

        {/* Preparation Time */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: alpha(theme.palette.common.black, 0.8),
            color: 'white',
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Schedule sx={{ fontSize: 12 }} />
          <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.7rem' }}>
            {item.preparationTime} min
          </Typography>
        </Box>
      </Box>

      {/* Content Section - Bottom Half */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        p: { xs: 1.25, sm: 1.5 },
        backgroundColor: 'background.paper'
      }}>
        {/* Header with Veg/Non-Veg and Name */}
        <Box sx={{ mb: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 0.5 }}>
            <VegNonVegIcon isVeg={item.isVeg} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '0.95rem', sm: '1rem' },
                lineHeight: 1.2,
                flex: 1,
                color: 'text.primary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.name}
            </Typography>
          </Stack>

          {/* Price */}
          <Typography 
            variant="h6" 
            color="primary.main" 
            fontWeight="700"
            sx={{ mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            {formatCurrency(item.price)}
          </Typography>
        </Box>

        {/* Category */}
        <Box sx={{ mb: 1 }}>
          <Chip 
            label={getCategoryName(item.category)} 
            size="small" 
            variant="outlined"
            color="primary"
            sx={{ 
              fontSize: '0.65rem',
              fontWeight: 500,
              height: 20,
            }}
          />
        </Box>
        
        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 1,
            lineHeight: 1.4,
            fontSize: '0.8rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {item.description}
        </Typography>

        <Divider sx={{ mb: 1 }} />
        
        {/* Actions */}
        <Box sx={{ 
          mt: 'auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Stack direction="row" spacing={1}>
            <FlagGate flag="menu.showMenuItemAvailability">
              <Tooltip title={(item.available ?? item.isAvailable) ? 'Mark Unavailable' : 'Mark Available'}>
                <IconButton 
                  size="small" 
                  onClick={() => onToggleAvailability(item.id)}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.grey[100], 0.8),
                    '&:hover': { 
                      backgroundColor: (item.available ?? item.isAvailable) ? 
                        alpha(theme.palette.error.main, 0.1) : 
                        alpha(theme.palette.success.main, 0.1),
                      color: (item.available ?? item.isAvailable) ? 'error.main' : 'success.main'
                    }
                  }}
                >
                  {(item.available ?? item.isAvailable) ? 
                    <VisibilityOff fontSize="small" /> : 
                    <Visibility fontSize="small" />
                  }
                </IconButton>
              </Tooltip>
            </FlagGate>
            <FlagGate flag="menu.showEditMenuItem">
              <Tooltip title="Edit Item">
                <IconButton 
                  size="small" 
                  onClick={() => onEditItem(item)}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.grey[100], 0.8),
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    }
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </FlagGate>
            <FlagGate flag="menu.showDeleteMenuItem">
              <Tooltip title="Delete Item">
                <IconButton 
                  size="small" 
                  onClick={() => onDeleteItem(item.id)}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.grey[100], 0.8),
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: 'error.main'
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </FlagGate>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default MenuItemCard;
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  alpha,
} from '@mui/material';
import {
  Star,
  LocationOn,
  Schedule,
  LocalOffer,
} from '@mui/icons-material';
import { Venue } from '../../../types/api';
import RestaurantInfoBadge from './RestaurantInfoBadge';

interface RestaurantHeroProps {
  restaurant: Venue | null;
}

const RestaurantHero: React.FC<RestaurantHeroProps> = ({ restaurant }) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
        color: 'white',
        pt: { xs: 3, sm: 3.5 },
        pb: { xs: 3.5, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Box>
          {/* Restaurant Name */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              letterSpacing: '-0.5px',
              mb: 1,
            }}
          >
            {restaurant?.name || 'Restaurant'}
          </Typography>

          {/* Description */}
          <Typography
            variant="h6"
            sx={{
              mb: 2.5,
              opacity: 0.95,
              fontWeight: 400,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              maxWidth: 700,
              lineHeight: 1.6,
            }}
          >
            {restaurant?.description || 'Delicious food awaits you'}
          </Typography>

          {/* Info Badges */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ 
              mb: 2,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {/* Rating */}
            <Box
              sx={{
                backgroundColor: alpha('#FFC107', 0.15),
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Star sx={{ fontSize: 18, color: '#FFC107' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {restaurant?.rating?.toFixed(1) || '4.5'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
                ({restaurant?.total_reviews || 0}+)
              </Typography>
            </Box>

            {/* Location */}
            <Box
              sx={{
                backgroundColor: alpha('#FFFFFF', 0.1),
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <LocationOn sx={{ fontSize: 18 }} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {restaurant?.location.city || 'Location'}
              </Typography>
            </Box>

            {/* Delivery Time */}
            <Box
              sx={{
                backgroundColor: alpha('#4CAF50', 0.15),
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Schedule sx={{ fontSize: 18, color: '#4CAF50' }} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                25-30 min
              </Typography>
            </Box>
          </Stack>

          {/* Cuisine Types */}
          {restaurant?.cuisine_types && restaurant.cuisine_types.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.75 }}>
              {restaurant.cuisine_types.slice(0, 4).map((cuisine, index) => (
                <Chip
                  key={index}
                  label={cuisine}
                  size="small"
                  icon={<LocalOffer sx={{ fontSize: 14 }} />}
                  sx={{
                    backgroundColor: alpha('#FFFFFF', 0.15),
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    height: 28,
                    fontSize: '0.75rem',
                    '& .MuiChip-icon': {
                      color: 'white',
                      marginLeft: '8px',
                    },
                    '&:hover': {
                      backgroundColor: alpha('#FFFFFF', 0.25),
                    },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default RestaurantHero;
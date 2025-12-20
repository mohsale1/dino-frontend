import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import {
  Star,
  LocationOn,
  Schedule,
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
        backgroundColor: '#1E3A5F',
        color: 'white',
        pt: { xs: 2.5, sm: 3 },
        pb: { xs: 3, sm: 3.5 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            {restaurant?.name || 'Restaurant'}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              opacity: 0.9,
              fontWeight: 400,
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              maxWidth: 700,
              lineHeight: 1.5,
            }}
          >
            {restaurant?.description || 'Delicious food awaits you'}
          </Typography>

          {/* Info Badges */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ mb: 1.5, gap: 1 }}
          >
            {/* Rating */}
            <RestaurantInfoBadge
              icon={<Star sx={{ fontSize: 16, color: '#FFC107' }} />}
              label={restaurant?.rating?.toFixed(1) || '4.5'}
              sublabel={`(${restaurant?.total_reviews || 0}+)`}
            />

            {/* Location */}
            <RestaurantInfoBadge
              icon={<LocationOn sx={{ fontSize: 16 }} />}
              label={restaurant?.location.city || 'Location'}
            />

            {/* Delivery Time */}
            <RestaurantInfoBadge
              icon={<Schedule sx={{ fontSize: 16 }} />}
              label="25-30 min"
            />
          </Stack>

          {/* Cuisine Types */}
          {restaurant?.cuisine_types && restaurant.cuisine_types.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.75 }}>
              {restaurant.cuisine_types.map((cuisine, index) => (
                <Chip
                  key={index}
                  label={cuisine}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontWeight: 500,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    height: 24,
                    fontSize: '0.7rem',
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
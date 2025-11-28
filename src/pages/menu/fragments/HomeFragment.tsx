import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Avatar,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Star,
  LocationOn,
  Schedule,
  LocalOffer,
  Whatshot,
} from '@mui/icons-material';
import FoodAnimationBackground from '../../../components/menu/FoodAnimationBackground';
import { CategoryType } from '../../../hooks/useMenuData';
import { Venue } from '../../../types/api';

interface HomeFragmentProps {
  restaurant: Venue | null;
  categories: CategoryType[];
  onCategoryClick: (categoryId: string) => void;
}

const HomeFragment: React.FC<HomeFragmentProps> = ({
  restaurant,
  categories,
  onCategoryClick,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ pb: 10 }}>
      {/* Hero Section with Food Animation */}
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          pt: { xs: 4, sm: 5 },
          pb: { xs: 6, sm: 8 },
          overflow: 'hidden',
        }}
      >
        {/* Food Animation Background */}
        <FoodAnimationBackground />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Restaurant Info */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {restaurant?.name || 'Restaurant'}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 2,
                opacity: 0.95,
                fontWeight: 400,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              }}
            >
              {restaurant?.description || 'Delicious food awaits you'}
            </Typography>

            {/* Restaurant Meta Info */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 3 }}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ fontSize: 20 }} />
                <Typography variant="body1" fontWeight="600">
                  {restaurant?.rating?.toFixed(1) || '4.5'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  ({restaurant?.total_reviews || 0}+ reviews)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {restaurant?.location.city || 'Location'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  25-30 min
                </Typography>
              </Box>
            </Stack>

            {/* Cuisine Types */}
            {restaurant?.cuisine_types && restaurant.cuisine_types.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                flexWrap="wrap"
                sx={{ mb: 3, gap: 1 }}
              >
                {restaurant.cuisine_types.map((cuisine, index) => (
                  <Chip
                    key={index}
                    label={cuisine}
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      color: 'white',
                      fontWeight: 500,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                    }}
                  />
                ))}
              </Stack>
            )}


          </Box>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
              color: 'text.primary',
            }}
          >
            Browse by Category
          </Typography>

          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={3} key={category.id}>
                <Card
                  onClick={() => onCategoryClick(category.id)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: 'center',
                      p: { xs: 2, sm: 3 },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 60, sm: 72 },
                        height: { xs: 60, sm: 72 },
                        mx: 'auto',
                        mb: 1.5,
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {category.icon}
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.95rem', sm: '1.1rem' },
                        mb: 0.5,
                        color: 'text.primary',
                      }}
                    >
                      {category.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      {category.itemCount || 0} items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Popular Offers Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
              color: 'text.primary',
            }}
          >
            Special Offers
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  p: 2.5,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocalOffer sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      20% OFF
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.95 }}>
                      On orders above ₹500
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  p: 2.5,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Whatshot sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      Hot Deals
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.95 }}>
                      Check out today's specials
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomeFragment;
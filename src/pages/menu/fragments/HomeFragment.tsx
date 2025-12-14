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
    <Box 
      sx={{ 
        pb: 10,
        width: '100%',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      {/* Hero Section with Food Animation */}
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          pt: { xs: 3, sm: 4, md: 5 },
          pb: { xs: 4, sm: 5, md: 1.5 },
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Food Animation Background */}
        <FoodAnimationBackground />

        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            px: { xs: 1, sm: 3 },
          }}
        >
          {/* Restaurant Info */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: { xs: 1, sm: 1.5 },
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                lineHeight: 1.2,
              }}
            >
              {restaurant?.name || 'Restaurant'}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: { xs: 2, sm: 1.5 },
                opacity: 0.95,
                fontWeight: 400,
                fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' },
                lineHeight: 1.5,
                px: { xs: 1, sm: 1 },
              }}
            >
              {restaurant?.description || 'Delicious food awaits you'}
            </Typography>

            {/* Restaurant Meta Info */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 2, md: 1.5 }}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: { xs: 2, sm: 3 } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ fontSize: { xs: 18, sm: 20 } }} />
                <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {restaurant?.rating?.toFixed(1) || '4.5'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.8rem' } }}>
                  ({restaurant?.total_reviews || 0}+ reviews)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn sx={{ fontSize: { xs: 16, sm: 18 } }} />
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.8rem' } }}>
                  {restaurant?.location.city || 'Location'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: { xs: 16, sm: 18 } }} />
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.8rem' } }}>
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
                sx={{ 
                  gap: 1,
                  px: { xs: 1, sm: 0 },
                }}
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
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      height: { xs: 24, sm: 28 },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Container>
      </Box>

      {/* Categories Section - Properly spaced below hero */}
      <Box sx={{ backgroundColor: theme.palette.background.default, pt: { xs: 3, sm: 4 } }}>
        <Container 
          maxWidth="lg" 
          sx={{ 
            px: { xs: 1, sm: 3 },
          }}
        >
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: { xs: 2, sm: 3 },
                textAlign: 'center',
                color: 'text.primary',
                fontSize: { xs: '1.25rem', sm: '1.25rem' },
              }}
            >
              Browse by Category
            </Typography>

            <Grid 
              container 
              spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
              sx={{
                width: '100%',
                margin: 0,
              }}
            >
              {categories.map((category) => (
                <Grid 
                  item 
                  xs={6} 
                  sm={4} 
                  md={3} 
                  key={category.id}
                  sx={{
                    paddingLeft: { xs: '12px !important', sm: '16px !important' },
                    paddingTop: { xs: '12px !important', sm: '16px !important' },
                  }}
                >
                  <Card
                    onClick={() => onCategoryClick(category.id)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: { xs: 2, sm: 3 },
                      transition: 'all 0.3s ease',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%',
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
                        p: { xs: 1.5, sm: 2, md: 1.5 },
                        '&:last-child': {
                          pb: { xs: 1.5, sm: 2, md: 1.5 },
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: { xs: 50, sm: 60, md: 72 },
                          height: { xs: 50, sm: 60, md: 72 },
                          mx: 'auto',
                          mb: { xs: 1, sm: 1.5 },
                          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
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
                          fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' },
                          mb: 0.5,
                          color: 'text.primary',
                          lineHeight: 1.3,
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                          display: 'block',
                        }}
                      >
                        {category.itemCount || 0} items
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomeFragment;
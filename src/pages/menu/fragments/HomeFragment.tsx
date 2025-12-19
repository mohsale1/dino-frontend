import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
  Button,
} from '@mui/material';
import {
  Star,
  LocationOn,
  Schedule,
  ArrowForward,
} from '@mui/icons-material';
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
        pb: { xs: 10, sm: 12 },
        width: '100%',
        backgroundColor: '#F8F9FA',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: '#1E3A5F',
          color: 'white',
          pt: { xs: 3, sm: 4 },
          pb: { xs: 4, sm: 5 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              }}
            >
              {restaurant?.name || 'Restaurant'}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 1.5,
                opacity: 0.9,
                fontWeight: 400,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                maxwidth: 580,
              }}
            >
              {restaurant?.description || 'Delicious food awaits you'}
            </Typography>

            {/* Info Cards */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ mb: 1.5 }}
            >
              {/* Rating */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Star sx={{ fontSize: 12, color: '#FFC107' }} />
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                  {restaurant?.rating?.toFixed(1) || '4.5'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                  ({restaurant?.total_reviews || 0}+)
                </Typography>
              </Box>

              {/* Location */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <LocationOn sx={{ fontSize: 12 }} />
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                  {restaurant?.location.city || 'Location'}
                </Typography>
              </Box>

              {/* Delivery Time */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Schedule sx={{ fontSize: 12 }} />
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                  25-30 min
                </Typography>
              </Box>
            </Stack>

            {/* Cuisine Types */}
            {restaurant?.cuisine_types && restaurant.cuisine_types.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
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
                      height: 18,
                      fontSize: '0.7rem',
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, mt: 3 }}>
        {/* Section Header */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1E3A5F',
              fontSize: { xs: '1.15rem', sm: '1.35rem' },
              mb: 0.5,
            }}
          >
            Browse Categories
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            Explore our menu by category
          </Typography>
        </Box>

        {/* Categories Grid */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} key={category.id}>
              <Card
                onClick={() => onCategoryClick(category.id)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  backgroundColor: 'white',
                  border: '1px solid #E0E0E0',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#1E3A5F',
                    boxShadow: '0 2px 8px rgba(30, 58, 95, 0.12)',
                    '& .category-name': {
                      color: '#1E3A5F',
                    },
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                  {/* Category Icon */}
                  <Box
                    sx={{
                      width: { xs: 50, sm: 60 },
                      height: { xs: 50, sm: 60 },
                      mx: 'auto',
                      mb: 1,
                      backgroundColor: '#F0F4F8',
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #E0E0E0',
                    }}
                  >
                    <Typography variant="h5" sx={{ color: '#1E3A5F', fontWeight: 700 }}>
                      {category.name.charAt(0)}
                    </Typography>
                  </Box>

                  {/* Category Name */}
                  <Typography
                    variant="h6"
                    className="category-name"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      mb: 0.25,
                      color: '#2C3E50',
                    }}
                  >
                    {category.name}
                  </Typography>

                  {/* Item Count */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6C757D',
                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    }}
                  >
                    {category.itemCount || 0} items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box
          sx={{
            mt: 3,
            mb: 1.5,
            p: { xs: 2.5, sm: 3 },
            backgroundColor: 'white',
            border: '1px solid #E0E0E0',
            borderRadius: 1,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1E3A5F',
              mb: 0.75,
              fontSize: { xs: '1rem', sm: '1.15rem' },
            }}
          >
            Ready to Order?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            Browse our full menu and add items to your cart
          </Typography>
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => onCategoryClick(categories[0]?.id || '')}
            sx={{
              backgroundColor: '#1E3A5F',
              color: 'white',
              px: 1.5,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.7rem',
              '&:hover': {
                backgroundColor: '#2C5282',
              },
            }}
          >
            View Menu
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomeFragment;

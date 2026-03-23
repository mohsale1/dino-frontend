import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  TableBar as TableIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface HomeFragmentProps {
  menuData: any;
  onViewMenu: () => void;
}

const HomeFragment: React.FC<HomeFragmentProps> = ({ menuData, onViewMenu }) => {
  const { organization, table, categories, items } = menuData;

  const featuredItems = items.filter((item: any) => item.is_available).slice(0, 3);
  const totalItems = items.filter((item: any) => item.is_available).length;

  return (
    <Box>
      {/* Welcome Header */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          bgcolor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)',
            borderBottom: '1px solid #e5e7eb',
            p: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RestaurantIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700} color="#1a1a1a" sx={{ mb: 0.5 }}>
                {organization.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 16 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Verified Restaurant
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            {organization.description || 'Welcome! Browse our menu and place your order directly from your table.'}
          </Typography>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={onViewMenu}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#1a1a1a',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              py: 1.5,
              fontSize: '1rem',
              borderRadius: 1.5,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: '#2d2d2d',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            View Full Menu ({totalItems} Items)
          </Button>
        </Box>

        {/* Table Information */}
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <TableIcon sx={{ color: '#6b7280', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600} color="#1a1a1a">
              Your Table Information
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
                  Table Number
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#1a1a1a">
                  {table.table_number}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
                  Capacity
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#1a1a1a">
                  {table.capacity}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Welcome Banner */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          height: 140,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        }}
      >
        {/* Decorative Food Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <CardContent sx={{ p: 3, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RestaurantIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
                Fresh & Delicious
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
                Crafted with love, served with care. Enjoy our handpicked menu selections.
              </Typography>
            </Box>
          </Box>
        </CardContent>

        {/* Decorative Corner Element */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
          }}
        />
      </Card>

      {/* Categories */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          bgcolor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a" gutterBottom>
            Menu Categories
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {categories.length} categories available
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: '#f3f4f6',
                borderRadius: 3,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#d1d5db',
                borderRadius: 3,
                '&:hover': {
                  bgcolor: '#9ca3af',
                },
              },
            }}
          >
            {categories.map((category: any) => (
              <Chip
                key={category.id}
                label={category.name}
                onClick={onViewMenu}
                clickable
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  px: 2,
                  py: 2.5,
                  height: 'auto',
                  bgcolor: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  '&:hover': {
                    bgcolor: '#f3f4f6',
                    borderColor: '#d1d5db',
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <Card
          elevation={0}
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StarIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a">
                Chef's Recommendations
              </Typography>
            </Box>

            <Stack spacing={2.5} divider={<Divider />}>
              {featuredItems.map((item: any) => (
                <Box key={item.id}>
                  <Box display="flex" gap={2}>
                    {/* Item Image Placeholder */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1.5,
                        bgcolor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography variant="h3" fontWeight={800} sx={{ color: '#e5e7eb' }}>
                        {item.name.charAt(0)}
                      </Typography>

                      {/* Veg/Non-Veg Indicator */}
                      {item.is_vegetarian !== null && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            width: 18,
                            height: 18,
                            border: `2px solid ${item.is_vegetarian ? '#10b981' : '#ef4444'}`,
                            borderRadius: 0.5,
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: item.is_vegetarian ? '#10b981' : '#ef4444',
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Item Details */}
                    <Box flex={1} minWidth={0}>
                      <Typography variant="subtitle2" fontWeight={700} color="#1a1a1a" sx={{ mb: 0.5 }}>
                        {item.name}
                      </Typography>

                      {item.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                          }}
                        >
                          {item.description}
                        </Typography>
                      )}

                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography variant="h6" fontWeight={700} color="#1a1a1a">
                          â‚¹{item.price.toFixed(2)}
                        </Typography>
                        <Chip
                          icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
                          label="15-20 min"
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            bgcolor: '#f3f4f6',
                            color: '#6b7280',
                            border: '1px solid #e5e7eb',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              onClick={onViewMenu}
              endIcon={<ArrowForwardIcon />}
              sx={{
                mt: 3,
                fontWeight: 600,
                textTransform: 'none',
                py: 1.25,
                fontSize: '0.95rem',
                borderRadius: 1.5,
                borderColor: '#e5e7eb',
                color: '#1a1a1a',
                '&:hover': {
                  borderColor: '#d1d5db',
                  bgcolor: '#f9fafb',
                },
                transition: 'all 0.2s ease',
              }}
            >
              View All {totalItems} Items
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default HomeFragment;
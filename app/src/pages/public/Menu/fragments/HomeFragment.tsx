import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  TableRestaurant as TableRestaurantIcon,
  Person as PersonIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

interface HomeFragmentProps {
  menuData: any;
  onViewMenu: () => void;
}

const DOT_PATTERN_SVG = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")`;

const ITEM_COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

const HomeFragment: React.FC<HomeFragmentProps> = ({ menuData, onViewMenu }) => {
  const { organization, table, categories, items } = menuData;

  const featuredItems = items.filter((item: any) => item.is_available).slice(0, 3);
  const totalItems = items.filter((item: any) => item.is_available).length;

  const getItemColor = (index: number) => ITEM_COLORS[index % ITEM_COLORS.length];

  return (
    <Box sx={{ px: 2, pt: 2, pb: 3 }}>

      {/* ── 1. HERO SECTION ── */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: '1px solid #e8e8e8',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        }}
      >
        {/* Dot pattern overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: DOT_PATTERN_SVG,
            backgroundRepeat: 'repeat',
            pointerEvents: 'none',
          }}
        />

        {/* Decorative circle */}
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(249, 115, 22, 0.08)',
            pointerEvents: 'none',
          }}
        />

        <CardContent sx={{ p: '24px !important', position: 'relative' }}>
          {/* Icon + name + badge */}
          <Box display="flex" alignItems="flex-start" gap={2} mb={1.5}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <RestaurantIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography
                variant="h5"
                fontWeight={700}
                color="white"
                sx={{ lineHeight: 1.2, mb: 0.75, wordBreak: 'break-word' }}
              >
                {organization.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#4ade80',
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: 0.3 }}
                >
                  Verified Restaurant
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, mb: 2.5 }}
          >
            {organization.description ||
              'Welcome! Browse our menu and place your order directly from your table.'}
          </Typography>

          {/* CTA */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={onViewMenu}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#f97316',
              color: 'white',
              fontWeight: 700,
              textTransform: 'none',
              py: 1.5,
              fontSize: '1rem',
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(249, 115, 22, 0.35)',
              '&:hover': {
                bgcolor: '#ea6c0a',
                boxShadow: '0 6px 20px rgba(249, 115, 22, 0.45)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Browse Menu
          </Button>
        </CardContent>
      </Card>

      {/* ── 2. TABLE INFO STRIP ── */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: '1px solid #e8e8e8',
          bgcolor: '#ffffff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            px: 2,
            py: 2,
          }}
        >
          {/* Table Number */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <TableRestaurantIcon sx={{ color: '#6b7280', fontSize: 18 }} />
            <Typography
              variant="h4"
              fontWeight={800}
              color="#1a1a1a"
              sx={{ lineHeight: 1 }}
            >
              {table.table_number}
            </Typography>
            <Typography variant="caption" color="#6b7280" fontWeight={500}>
              Table Number
            </Typography>
          </Box>

          {/* Divider */}
          <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: '#e8e8e8' }} />

          {/* Capacity */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <PersonIcon sx={{ color: '#6b7280', fontSize: 18 }} />
            <Box display="flex" alignItems="baseline" gap={0.5}>
              <Typography
                variant="h4"
                fontWeight={800}
                color="#1a1a1a"
                sx={{ lineHeight: 1 }}
              >
                {table.capacity}
              </Typography>
              <Typography variant="caption" color="#6b7280" fontWeight={500}>
                seats
              </Typography>
            </Box>
            <Typography variant="caption" color="#6b7280" fontWeight={500}>
              Capacity
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── 3. CATEGORIES SECTION ── */}
      {categories.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
            border: '1px solid #e8e8e8',
            bgcolor: '#ffffff',
          }}
        >
          <CardContent sx={{ p: '16px !important' }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a">
                Menu Categories
              </Typography>
              <Chip
                label={categories.length}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: '#1a1a1a',
                  color: 'white',
                  borderRadius: '999px',
                }}
              />
            </Box>

            {/* Horizontal scrollable pills */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 0.5,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {categories.map((category: any) => (
                <Box
                  key={category.id}
                  onClick={onViewMenu}
                  sx={{
                    flexShrink: 0,
                    px: 2,
                    py: 0.875,
                    borderRadius: '999px',
                    border: '1px solid #e8e8e8',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      bgcolor: '#1a1a1a',
                      borderColor: '#1a1a1a',
                      '& .cat-label': { color: 'white' },
                    },
                    '&:active': {
                      bgcolor: '#1a1a1a',
                      borderColor: '#1a1a1a',
                      transform: 'scale(0.97)',
                    },
                  }}
                >
                  <Typography
                    className="cat-label"
                    variant="body2"
                    fontWeight={600}
                    color="#1a1a1a"
                    sx={{ whiteSpace: 'nowrap', transition: 'color 0.18s ease' }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── 4. FEATURED ITEMS ── */}
      {featuredItems.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
            border: '1px solid #e8e8e8',
            bgcolor: '#ffffff',
          }}
        >
          <CardContent sx={{ p: '16px !important' }}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <StarIcon sx={{ color: '#f97316', fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a">
                Chef's Picks
              </Typography>
            </Box>

            {/* Item list */}
            <Stack divider={<Divider sx={{ borderColor: '#f3f4f6' }} />}>
              {featuredItems.map((item: any, index: number) => {
                const hasImage =
                  item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0;
                const accentColor = getItemColor(index);

                return (
                  <Box key={item.id} sx={{ py: 1.75, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    {/* Image / Placeholder */}
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 1.5,
                        flexShrink: 0,
                        overflow: 'hidden',
                        border: '1px solid #e8e8e8',
                        position: 'relative',
                        bgcolor: hasImage ? 'transparent' : `${accentColor}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {hasImage ? (
                        <Box
                          component="img"
                          src={item.image_urls[0]}
                          alt={item.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{ color: accentColor, lineHeight: 1 }}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </Typography>
                      )}
                    </Box>

                    {/* Details */}
                    <Box flex={1} minWidth={0}>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="#1a1a1a"
                          sx={{ lineHeight: 1.3, flex: 1, minWidth: 0 }}
                        >
                          {item.name}
                        </Typography>

                        {/* Veg / Non-veg dot */}
                        {item.is_vegetarian !== null && item.is_vegetarian !== undefined && (
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              border: `2px solid ${item.is_vegetarian ? '#16a34a' : '#dc2626'}`,
                              borderRadius: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              mt: 0.25,
                            }}
                          >
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: item.is_vegetarian ? '#16a34a' : '#dc2626',
                              }}
                            />
                          </Box>
                        )}
                      </Box>

                      {item.description && (
                        <Typography
                          variant="caption"
                          color="#6b7280"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                            mt: 0.4,
                            mb: 0.75,
                          }}
                        >
                          {item.description}
                        </Typography>
                      )}

                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="#1a1a1a"
                        sx={{ mt: item.description ? 0 : 0.75 }}
                      >
                        ₹{item.price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            {/* View all button */}
            <Button
              variant="outlined"
              fullWidth
              onClick={onViewMenu}
              endIcon={<ArrowForwardIcon />}
              sx={{
                mt: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                py: 1.25,
                fontSize: '0.9rem',
                borderRadius: 1.5,
                borderColor: '#e8e8e8',
                color: '#1a1a1a',
                '&:hover': {
                  borderColor: '#1a1a1a',
                  bgcolor: 'transparent',
                },
                transition: 'all 0.18s ease',
              }}
            >
              View All {totalItems} Items
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── 5. HOW IT WORKS ── */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: '1px solid #e8e8e8',
          bgcolor: '#ffffff',
        }}
      >
        <CardContent sx={{ p: '16px !important' }}>
          <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a" mb={2}>
            How It Works
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            {/* Dashed connector line */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 'calc(16.66% + 0px)',
                right: 'calc(16.66% + 0px)',
                height: 1,
                borderTop: '2px dashed #e8e8e8',
                zIndex: 0,
              }}
            />

            {[
              { icon: <RestaurantIcon sx={{ fontSize: 16, color: 'white' }} />, label: 'Browse Menu' },
              { icon: <StarIcon sx={{ fontSize: 16, color: 'white' }} />, label: 'Add Items' },
              { icon: <ReceiptIcon sx={{ fontSize: 16, color: 'white' }} />, label: 'Place Order' },
            ].map((step, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Numbered circle */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: '#f97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                  }}
                >
                  {step.icon}
                </Box>

                {/* Step number badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: 'calc(50% - 22px)',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                    {i + 1}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="#1a1a1a"
                  textAlign="center"
                  sx={{ lineHeight: 1.3 }}
                >
                  {step.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
};

export default HomeFragment;
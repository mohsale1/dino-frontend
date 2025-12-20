import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  alpha,
  Fade,
} from '@mui/material';
import {
  Search,
  Star,
  LocationOn,
} from '@mui/icons-material';
import { Venue } from '../../../types/api';

interface CompactHeroProps {
  restaurant: Venue | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  vegFilter: 'all' | 'veg' | 'non-veg';
  onVegFilterChange: (filter: 'all' | 'veg' | 'non-veg') => void;
}

const animatedTexts = [
  'Best Food in Town',
  'Fresh Ingredients',
  'Quick Delivery',
  'Best Prices',
  'Delicious Meals',
];

const CompactHero: React.FC<CompactHeroProps> = ({
  restaurant,
  searchQuery,
  onSearchChange,
  vegFilter,
  onVegFilterChange,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowText(false);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
        setShowText(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
        color: 'white',
        py: { xs: 4, sm: 5 },
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '45vh', sm: '50vh' },
        display: 'flex',
        alignItems: 'center',
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
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '60%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        {/* Restaurant Info */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              mb: 1,
              letterSpacing: '-0.5px',
            }}
          >
            {restaurant?.name || 'Restaurant'}
          </Typography>
          
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Star sx={{ fontSize: 18, color: '#FFC107' }} />
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {restaurant?.rating?.toFixed(1) || '4.5'}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
                ({restaurant?.total_reviews || 0}+)
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationOn sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {restaurant?.location.city || 'Location'}
              </Typography>
            </Stack>
          </Stack>

          {/* Animated Text */}
          <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
            <Fade in={showText} timeout={500}>
              <Typography
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  fontWeight: 700,
                  color: '#FFC107',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                ✨ {animatedTexts[currentTextIndex]}
              </Typography>
            </Fade>
          </Box>
        </Box>

        {/* Search Bar with Vertical Toggle */}
        <Stack direction="row" spacing={1} alignItems="stretch">
          {/* Search Field */}
          <TextField
            fullWidth
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#6C757D', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 2,
                height: 120,
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: alpha('#1E3A5F', 0.2),
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1E3A5F',
                },
              },
            }}
          />

          {/* Vertical Veg/Non-Veg Toggle */}
          <Stack
            spacing={0}
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              overflow: 'hidden',
              width: 50,
            }}
          >
            <IconButton
              onClick={() => onVegFilterChange('all')}
              sx={{
                borderRadius: 0,
                height: 40,
                backgroundColor: vegFilter === 'all' ? '#1E3A5F' : 'transparent',
                color: vegFilter === 'all' ? 'white' : '#6C757D',
                '&:hover': {
                  backgroundColor: vegFilter === 'all' ? '#2C5282' : alpha('#1E3A5F', 0.1),
                },
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>ALL</Typography>
            </IconButton>
            <Box sx={{ height: 1, backgroundColor: '#E0E0E0' }} />
            <IconButton
              onClick={() => onVegFilterChange('veg')}
              sx={{
                borderRadius: 0,
                height: 40,
                backgroundColor: vegFilter === 'veg' ? '#4CAF50' : 'transparent',
                color: vegFilter === 'veg' ? 'white' : '#6C757D',
                '&:hover': {
                  backgroundColor: vegFilter === 'veg' ? '#45A049' : alpha('#4CAF50', 0.1),
                },
              }}
            >
              <Typography sx={{ fontSize: '1.2rem' }}>🟢</Typography>
            </IconButton>
            <Box sx={{ height: 1, backgroundColor: '#E0E0E0' }} />
            <IconButton
              onClick={() => onVegFilterChange('non-veg')}
              sx={{
                borderRadius: 0,
                height: 40,
                backgroundColor: vegFilter === 'non-veg' ? '#F44336' : 'transparent',
                color: vegFilter === 'non-veg' ? 'white' : '#6C757D',
                '&:hover': {
                  backgroundColor: vegFilter === 'non-veg' ? '#E53935' : alpha('#F44336', 0.1),
                },
              }}
            >
              <Typography sx={{ fontSize: '1.2rem' }}>🔴</Typography>
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default CompactHero;
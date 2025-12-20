import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Switch,
  alpha,
  Zoom,
} from '@mui/material';
import {
  Search,
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
  { text: 'Best Food in Town', emoji: '🍽️' },
  { text: 'Fresh Ingredients', emoji: '🌿' },
  { text: 'Quick Delivery', emoji: '⚡' },
  { text: 'Authentic Flavors', emoji: '✨' },
  { text: 'Made with Love', emoji: '❤️' },
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
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleVegToggle = () => {
    // Toggle between 'veg' and 'all'
    if (vegFilter === 'veg') {
      onVegFilterChange('all');
    } else {
      onVegFilterChange('veg');
    }
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
        color: 'white',
        py: { xs: 4, sm: 5 },
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
        {/* Top Left: Cafe Details and Address */}
        <Box sx={{ mb: 4, pb: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              mb: 2,
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
            }}
          >
            {restaurant?.name || 'Restaurant'}
          </Typography>

          {/* Address */}
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
            <LocationOn sx={{ fontSize: 20, mt: 0.25, flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                fontWeight: 500,
                opacity: 0.95,
                lineHeight: 1.5,
              }}
            >
              {restaurant?.location?.address || 
               `${restaurant?.location?.city || 'City'}, ${restaurant?.location?.state || 'State'}`}
            </Typography>
          </Stack>
        </Box>

        {/* Search Bar with Veg Toggle */}
        <Stack 
          direction="row" 
          spacing={1.5} 
          alignItems="stretch"
          sx={{ mb: 3 }}
        >
          {/* Search Field */}
          <TextField
            fullWidth
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#6C757D', fontSize: 22 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: alpha('#1E3A5F', 0.2),
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1E3A5F',
                  borderWidth: 2,
                },
              },
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.95rem', sm: '1rem' },
              },
            }}
          />

          {/* Vertical Veg Toggle Switch */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 60,
            }}
          >
            <Switch
              checked={vegFilter === 'veg'}
              onChange={handleVegToggle}
              icon={
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      border: '2px solid #6C757D',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#6C757D',
                      }}
                    />
                  </Box>
                </Box>
              }
              checkedIcon={
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      border: '2px solid #4CAF50',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50',
                      }}
                    />
                  </Box>
                </Box>
              }
              sx={{
                width: 62,
                height: 38,
                padding: 0,
                transform: 'rotate(90deg)',
                '& .MuiSwitch-switchBase': {
                  padding: 0,
                  margin: '5px',
                  transitionDuration: '300ms',
                  '&.Mui-checked': {
                    transform: 'translateX(24px)',
                    color: '#fff',
                    '& + .MuiSwitch-track': {
                      backgroundColor: '#4CAF50',
                      opacity: 1,
                      border: 0,
                    },
                  },
                },
                '& .MuiSwitch-thumb': {
                  boxSizing: 'border-box',
                  width: 28,
                  height: 28,
                },
                '& .MuiSwitch-track': {
                  borderRadius: 19,
                  backgroundColor: '#E0E0E0',
                  opacity: 1,
                },
              }}
            />
          </Box>
        </Stack>

        {/* Big Animated Text Section */}
        <Box
          sx={{
            minHeight: { xs: 80, sm: 100 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Zoom in={showText} timeout={600}>
            <Box
              sx={{
                textAlign: 'center',
                position: 'absolute',
                width: '100%',
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFF176 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                  letterSpacing: '-1px',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {animatedTexts[currentTextIndex].emoji}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2.25rem', md: '2.75rem' },
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #E3F2FD 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                {animatedTexts[currentTextIndex].text}
              </Typography>
            </Box>
          </Zoom>
        </Box>
      </Container>
    </Box>
  );
};

export default CompactHero;
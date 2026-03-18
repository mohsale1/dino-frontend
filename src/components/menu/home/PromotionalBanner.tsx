import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  LocalOffer,
  Celebration,
} from '@mui/icons-material';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  icon?: React.ReactNode;
}

interface PromotionalBannerProps {
  onDismiss?: () => void;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ onDismiss }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Sample promotional banners - replace with actual data
  const banners: Banner[] = [
    {
      id: '1',
      title: '🎉 50% OFF on First Order',
      subtitle: 'Use code: FIRST50',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: 'white',
    },
    {
      id: '2',
      title: '🍕 Free Delivery on Orders Above ₹299',
      subtitle: 'Limited time offer',
      backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: 'white',
    },
    {
      id: '3',
      title: '⭐ Flat ₹100 OFF',
      subtitle: 'On orders above ₹499 • Code: SAVE100',
      backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: 'white',
    },
  ];

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <Box
      sx={{
        background: currentBanner.backgroundColor,
        py: { xs: 2, sm: 2.5 },
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Previous Button - Desktop Only */}
          {!isMobile && banners.length > 1 && (
            <IconButton
              onClick={handlePrevious}
              size="small"
              sx={{
                color: currentBanner.textColor,
                backgroundColor: alpha('#000', 0.2),
                '&:hover': {
                  backgroundColor: alpha('#000', 0.3),
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}

          {/* Banner Content */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: currentBanner.textColor,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                mb: 0.25,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {currentBanner.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: currentBanner.textColor,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 600,
                opacity: 0.95,
              }}
            >
              {currentBanner.subtitle}
            </Typography>
          </Box>

          {/* Next Button - Desktop Only */}
          {!isMobile && banners.length > 1 && (
            <IconButton
              onClick={handleNext}
              size="small"
              sx={{
                color: currentBanner.textColor,
                backgroundColor: alpha('#000', 0.2),
                '&:hover': {
                  backgroundColor: alpha('#000', 0.3),
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          )}

          {/* Close Button */}
          <IconButton
            onClick={handleDismiss}
            size="small"
            sx={{
              color: currentBanner.textColor,
              backgroundColor: alpha('#000', 0.2),
              '&:hover': {
                backgroundColor: alpha('#000', 0.3),
              },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <Stack
            direction="row"
            spacing={0.75}
            justifyContent="center"
            sx={{ mt: 1.5 }}
          >
            {banners.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: index === currentIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: currentBanner.textColor,
                  opacity: index === currentIndex ? 1 : 0.4,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    opacity: 0.7,
                  },
                }}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default PromotionalBanner;
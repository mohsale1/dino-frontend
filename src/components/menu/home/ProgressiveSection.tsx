import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  alpha,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  NewReleases,
  Restaurant,
} from '@mui/icons-material';
import { MenuItemType } from '../../../hooks/useMenuData';
import DecisionCard from './DecisionCard';

interface ProgressiveSectionProps {
  title: string;
  subtitle?: string;
  items: MenuItemType[];
  icon?: 'trending' | 'new' | 'chef';
  onAddToCart?: (item: MenuItemType) => void;
  onRemoveFromCart?: (item: MenuItemType) => void;
  getItemQuantityInCart?: (itemId: string) => number;
  getMenuItemImage?: (item: MenuItemType) => string;
  variant?: 'carousel' | 'grid';
}

const ProgressiveSection: React.FC<ProgressiveSectionProps> = ({
  title,
  subtitle,
  items,
  icon = 'trending',
  onAddToCart,
  onRemoveFromCart,
  getItemQuantityInCart,
  getMenuItemImage,
  variant = 'carousel',
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return null;
  }

  const getIcon = () => {
    switch (icon) {
      case 'trending':
        return <TrendingUp sx={{ fontSize: 24, color: 'white' }} />;
      case 'new':
        return <NewReleases sx={{ fontSize: 24, color: 'white' }} />;
      case 'chef':
        return <Restaurant sx={{ fontSize: 24, color: 'white' }} />;
      default:
        return <TrendingUp sx={{ fontSize: 24, color: 'white' }} />;
    }
  };

  const getGradient = () => {
    switch (icon) {
      case 'trending':
        return 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)';
      case 'new':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'chef':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      default:
        return 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)';
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const newPosition =
      direction === 'left'
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    setScrollPosition(newPosition);
  };

  return (
    <Box sx={{ py: { xs: 3, sm: 4 }, backgroundColor: '#F8F9FA' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Section Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: getGradient(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getIcon()}
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#1E3A5F',
                  fontSize: { xs: '1.15rem', sm: '1.4rem' },
                  letterSpacing: '-0.5px',
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                    fontWeight: 500,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Navigation Buttons - Desktop Only */}
          {variant === 'carousel' && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <IconButton
                onClick={() => handleScroll('left')}
                disabled={scrollPosition <= 0}
                sx={{
                  backgroundColor: 'white',
                  border: '2px solid #E0E0E0',
                  '&:hover': {
                    backgroundColor: '#F8F9FA',
                    borderColor: '#1E3A5F',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#F8F9FA',
                    borderColor: '#E0E0E0',
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() => handleScroll('right')}
                sx={{
                  backgroundColor: 'white',
                  border: '2px solid #E0E0E0',
                  '&:hover': {
                    backgroundColor: '#F8F9FA',
                    borderColor: '#1E3A5F',
                  },
                }}
              >
                <ChevronRight />
              </IconButton>
            </Stack>
          )}
        </Stack>

        {/* Items Container */}
        {variant === 'carousel' ? (
          <Box
            ref={scrollContainerRef}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#E0E0E0',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#1E3A5F',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: '#2C5282',
                },
              },
            }}
          >
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  minWidth: { xs: 280, sm: 320 },
                  maxWidth: { xs: 280, sm: 320 },
                }}
              >
                <DecisionCard
                  item={item}
                  onAddToCart={onAddToCart}
                  onRemoveFromCart={onRemoveFromCart}
                  getItemQuantityInCart={getItemQuantityInCart}
                  getMenuItemImage={getMenuItemImage}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => (
              <DecisionCard
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
                getItemQuantityInCart={getItemQuantityInCart}
                getMenuItemImage={getMenuItemImage}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default ProgressiveSection;
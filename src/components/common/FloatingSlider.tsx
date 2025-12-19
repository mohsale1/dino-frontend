import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  CircularProgress,
  keyframes,
} from '@mui/material';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';

interface FloatingSliderProps {
  icon: React.ReactNode;
  primaryText: string;
  secondaryText: string;
  actionText: string;
  totalAmount?: number;
  loading?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  bottomPosition?: number | { xs: number; sm: number };
  onConfirm: () => void;
  show?: boolean;
}

// Animation for >> icon
const slideAnimation = keyframes`
  0% {
    transform: translateX(0);
    opacity: 0.5;
  }
  50% {
    transform: translateX(8px);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 0.5;
  }
`;

const FloatingSlider: React.FC<FloatingSliderProps> = ({
  icon,
  primaryText,
  secondaryText,
  actionText,
  totalAmount,
  loading = false,
  disabled = false,
  backgroundColor = '#28A745',
  borderColor = '#28A745',
  bottomPosition = 0,
  onConfirm,
  show = true,
}) => {
  const [slidePosition, setSlidePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const maxSlide = cardRef.current ? cardRef.current.offsetWidth : 0;
  const slideThreshold = maxSlide * 0.8; // 80% slide to trigger action

  const handleAction = () => {
    if (!disabled && !loading) {
      onConfirm();
      setSlidePosition(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || loading) return;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !cardRef.current || disabled || loading) return;

    const touch = e.touches[0];
    const cardRect = cardRef.current.getBoundingClientRect();
    const newPosition = touch.clientX - cardRect.left;

    if (newPosition >= 0 && newPosition <= maxSlide) {
      setSlidePosition(newPosition);
    }
  };

  const handleTouchEnd = () => {
    if (disabled || loading) return;
    setIsDragging(false);

    if (slidePosition >= slideThreshold) {
      handleAction();
    } else {
      setSlidePosition(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || loading) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !cardRef.current || disabled || loading) return;

    const cardRect = cardRef.current.getBoundingClientRect();
    const newPosition = e.clientX - cardRect.left;

    if (newPosition >= 0 && newPosition <= maxSlide) {
      setSlidePosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    if (disabled || loading) return;
    setIsDragging(false);

    if (slidePosition >= slideThreshold) {
      handleAction();
    } else {
      setSlidePosition(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, slidePosition]);

  // Calculate >> icon position based on slide (moves right as user drags)
  // Icon moves with the drag, staying within the handle area initially, then following the drag
  const handleWidth = 80; // Width of the left handle
  const iconTranslateX = slidePosition > 0 ? Math.min(slidePosition - handleWidth / 2, maxSlide - handleWidth) : 0;

  if (!show) return null;

  return (
    <Card
      ref={cardRef}
      sx={{
        position: 'fixed',
        bottom: bottomPosition,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: 'white',
        borderTop: `2px solid ${borderColor}`,
        borderBottom: 'none',
        boxShadow: 'none',
        overflow: 'hidden',
        borderRadius: 0,
        margin: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Box sx={{ position: 'relative', height: 70 }}>
        {/* Slider Fill - Expands as user drags */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: slidePosition,
            backgroundColor: backgroundColor,
            zIndex: 0,
          }}
        />

        {/* Content Layer */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            px: 0,
            zIndex: 1,
          }}
        >
          <Stack 
            direction="row" 
            spacing={0}
            alignItems="center" 
            sx={{ width: '100%', height: '100%' }}
          >
            {/* Left - Slider Handle with >> Animation */}
            <Box
              sx={{
                width: { xs: 70, sm: 80 },
                height: '100%',
                backgroundColor: backgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {loading ? (
                <CircularProgress size={28} sx={{ color: 'white' }} />
              ) : (
                <KeyboardDoubleArrowRight
                  sx={{
                    color: 'white',
                    fontSize: { xs: 32, sm: 36 },
                    animation: !isDragging ? `${slideAnimation} 1.5s ease-in-out infinite` : 'none',
                    transform: `translateX(${iconTranslateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                  }}
                />
              )}
            </Box>

            {/* Right - Content Info */}
            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center" 
              sx={{ 
                flex: 1, 
                px: 2.5,
                height: '100%',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                <Box
                  sx={{
                    color: slidePosition > 150 ? 'white' : backgroundColor,
                    transition: 'color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {icon}
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: slidePosition > 150 ? 'rgba(255,255,255,0.9)' : '#6C757D',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {secondaryText}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: slidePosition > 150 ? 'white' : backgroundColor,
                      fontSize: '1.15rem',
                      lineHeight: 1.2,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {totalAmount !== undefined ? `₹${totalAmount.toFixed(2)}` : primaryText}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: slidePosition > (maxSlide * 0.5) ? 'white' : backgroundColor,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease, opacity 0.2s ease',
                  opacity: slidePosition > (maxSlide * 0.3) ? 0 : 1,
                }}
              >
                {actionText}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Draggable Overlay - Full Height */}
        <Box
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: disabled || loading ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
            userSelect: 'none',
            zIndex: 2,
          }}
        />
      </Box>
    </Card>
  );
};

export default FloatingSlider;

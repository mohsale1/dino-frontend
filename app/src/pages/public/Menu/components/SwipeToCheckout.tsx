import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

interface SwipeToCheckoutProps {
  onSwipeComplete: () => void;
  itemCount: number;
  total: number;
}

const SwipeToCheckout: React.FC<SwipeToCheckoutProps> = ({
  onSwipeComplete,
  itemCount,
  total,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const maxPositionRef = useRef(0);

  const SLIDER_WIDTH = 120;
  const PADDING = 8;

  useEffect(() => {
    if (containerRef.current) {
      maxPositionRef.current = containerRef.current.offsetWidth - SLIDER_WIDTH - PADDING * 2;
    }
  }, []);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX - position;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const newPosition = clientX - startXRef.current;
    const clampedPosition = Math.max(0, Math.min(newPosition, maxPositionRef.current));
    setPosition(clampedPosition);

    if (clampedPosition >= maxPositionRef.current * 0.9) {
      setIsCompleted(true);
      setIsDragging(false);
      setTimeout(() => {
        onSwipeComplete();
      }, 300);
    }
  };

  const handleEnd = () => {
    if (!isCompleted) {
      setIsDragging(false);
      setTimeout(() => {
        setPosition(0);
      }, 10);
    } else {
      setIsDragging(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const progress = maxPositionRef.current > 0
    ? (position / maxPositionRef.current) * 100
    : 0;

  const textFaded = progress > 45;

  return (
    /* Outer container: NO touchAction here so page scrolling is never blocked */
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        height: 68,
        bgcolor: '#ffffff',
        overflow: 'hidden',
        borderTop: '1px solid #e8e8e8',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        userSelect: 'none',
      }}
    >
      {/* Orange progress fill */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress}%`,
          bgcolor: '#f97316',
          transition: isDragging ? 'none' : 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Center text: item count + total */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          gap: 0.25,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{
            color: textFaded ? 'rgba(255,255,255,0.85)' : '#6b7280',
            transition: 'color 0.2s ease',
            lineHeight: 1.2,
          }}
        >
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          sx={{
            color: textFaded ? '#ffffff' : '#1a1a1a',
            transition: 'color 0.2s ease',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          ₹{total.toFixed(2)}
        </Typography>
      </Box>

      {/* Slider handle — touchAction: 'none' is ONLY here */}
      <Box
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        sx={{
          position: 'absolute',
          top: PADDING,
          left: position + PADDING,
          width: SLIDER_WIDTH,
          height: 68 - PADDING * 2,
          bgcolor: '#1a1a1a',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
          touchAction: 'none',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ color: '#ffffff', fontSize: '0.875rem', lineHeight: 1 }}
        >
          Swipe
        </Typography>
        <ArrowForwardIcon sx={{ fontSize: 18, color: '#ffffff' }} />
      </Box>
    </Box>
  );
};

export default SwipeToCheckout;
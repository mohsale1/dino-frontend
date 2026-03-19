import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, alpha } from '@mui/material';
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

  useEffect(() => {
    if (containerRef.current && sliderRef.current) {
      maxPositionRef.current = containerRef.current.offsetWidth - sliderRef.current.offsetWidth - 8;
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

    // Check if swiped to the end
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
      // Animate back to start
      setIsDragging(false);
      // Small delay to ensure transition applies
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
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const progress = (position / maxPositionRef.current) * 100;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        height: 70,
        bgcolor: 'white',
        borderRadius: 0,
        overflow: 'hidden',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Progress Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress}%`,
          bgcolor: '#1a1a1a',
          transition: isDragging ? 'none' : 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Text Content */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box textAlign="center">
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{
              color: progress > 50 ? 'rgba(255,255,255,0.8)' : '#6b7280',
              display: 'block',
              mb: 0.5,
              transition: 'color 0.2s ease',
            }}
          >
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </Typography>
          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{
              color: progress > 50 ? 'white' : '#1a1a1a',
              transition: 'color 0.2s ease',
            }}
          >
            ₹{total.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Slider Button */}
      <Box
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        sx={{
          position: 'absolute',
          top: 8,
          left: position + 8,
          width: 140,
          height: 54,
          bgcolor: '#1a1a1a',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          border: '2px solid #1a1a1a',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'white',
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
            Swipe
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: 22 }} />
        </Box>
      </Box>

      {/* Hint Text */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -24,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          Swipe right to checkout →
        </Typography>
      </Box>
    </Box>
  );
};

export default SwipeToCheckout;
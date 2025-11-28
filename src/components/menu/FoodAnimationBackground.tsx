import React from 'react';
import { Box, keyframes } from '@mui/material';

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
`;

const floatSlow = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(-5deg);
  }
`;

const floatReverse = keyframes`
  0%, 100% {
    transform: translateY(-10px) rotate(0deg);
  }
  50% {
    transform: translateY(10px) rotate(3deg);
  }
`;

interface FoodItem {
  emoji: string;
  top: string;
  left: string;
  size: number;
  animation: string;
  duration: number;
  delay: number;
}

const foodItems: FoodItem[] = [
  { emoji: '🍕', top: '15%', left: '10%', size: 60, animation: 'float', duration: 3, delay: 0 },
  { emoji: '🍔', top: '25%', left: '85%', size: 55, animation: 'floatSlow', duration: 4, delay: 0.5 },
  { emoji: '🍜', top: '45%', left: '15%', size: 50, animation: 'floatReverse', duration: 3.5, delay: 1 },
  { emoji: '🍰', top: '60%', left: '80%', size: 45, animation: 'float', duration: 4.5, delay: 1.5 },
  { emoji: '🥗', top: '70%', left: '20%', size: 48, animation: 'floatSlow', duration: 3.8, delay: 0.8 },
  { emoji: '🍱', top: '35%', left: '75%', size: 52, animation: 'floatReverse', duration: 4.2, delay: 0.3 },
  { emoji: '🥤', top: '80%', left: '70%', size: 42, animation: 'float', duration: 3.2, delay: 1.2 },
  { emoji: '🍛', top: '20%', left: '45%', size: 58, animation: 'floatSlow', duration: 4, delay: 0.6 },
  { emoji: '🌮', top: '55%', left: '50%', size: 46, animation: 'floatReverse', duration: 3.6, delay: 1.8 },
  { emoji: '🍣', top: '10%', left: '65%', size: 44, animation: 'float', duration: 3.9, delay: 0.4 },
];

const FoodAnimationBackground: React.FC = () => {
  const getAnimation = (animationType: string) => {
    switch (animationType) {
      case 'float':
        return float;
      case 'floatSlow':
        return floatSlow;
      case 'floatReverse':
        return floatReverse;
      default:
        return float;
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {foodItems.map((item, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            fontSize: `${item.size}px`,
            opacity: 0.15,
            animation: `${getAnimation(item.animation)} ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
            filter: 'blur(1px)',
            userSelect: 'none',
          }}
        >
          {item.emoji}
        </Box>
      ))}
    </Box>
  );
};

export default FoodAnimationBackground;
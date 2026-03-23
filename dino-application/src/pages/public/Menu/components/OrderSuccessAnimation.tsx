import React, { useEffect, useState } from 'react';
import { Box, Typography, alpha, Fade, Zoom, Slide } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';

interface OrderSuccessAnimationProps {
  orderNumber: string;
  onComplete: () => void;
}

const OrderSuccessAnimation: React.FC<OrderSuccessAnimationProps> = ({
  orderNumber,
  onComplete,
}) => {
  const [showCheck, setShowCheck] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowCheck(true), 300);
    const timer2 = setTimeout(() => setShowText(true), 800);
    const timer3 = setTimeout(() => setShowDetails(true), 1200);
    const timer4 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Animated Background Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: alpha('#10b981', 0.05),
          animation: 'float 3s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: alpha('#0f172a', 0.03),
          animation: 'float 4s ease-in-out infinite',
        }}
      />

      {/* Success Icon */}
      <Zoom in={showCheck} timeout={500}>
        <Box
          sx={{
            position: 'relative',
            mb: 3,
          }}
        >
          {/* Ripple Effect */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: alpha('#10b981', 0.2),
              animation: 'ripple 1.5s ease-out infinite',
              '@keyframes ripple': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(0.8)',
                  opacity: 1,
                },
                '100%': {
                  transform: 'translate(-50%, -50%) scale(2)',
                  opacity: 0,
                },
              },
            }}
          />

          {/* Check Circle */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 60,
                color: 'white',
                animation: 'checkmark 0.5s ease-in-out',
                '@keyframes checkmark': {
                  '0%': {
                    transform: 'scale(0) rotate(-45deg)',
                    opacity: 0,
                  },
                  '50%': {
                    transform: 'scale(1.2) rotate(0deg)',
                  },
                  '100%': {
                    transform: 'scale(1) rotate(0deg)',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Zoom>

      {/* Success Text */}
      <Fade in={showText} timeout={600}>
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            fontWeight={800}
            color="#0f172a"
            gutterBottom
            sx={{
              animation: 'slideUp 0.5s ease-out',
              '@keyframes slideUp': {
                '0%': {
                  transform: 'translateY(20px)',
                  opacity: 0,
                },
                '100%': {
                  transform: 'translateY(0)',
                  opacity: 1,
                },
              },
            }}
          >
            Order Placed!
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Your order has been confirmed
          </Typography>
        </Box>
      </Fade>

      {/* Order Details */}
      <Slide direction="up" in={showDetails} timeout={500}>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            p: 3,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            minWidth: 280,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha('#0f172a', 0.06),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <RestaurantIcon sx={{ color: '#0f172a', fontSize: 24 }} />
          </Box>

          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Order Number
          </Typography>
          <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
            {orderNumber}
          </Typography>

          <Box
            sx={{
              pt: 2,
              borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Your order is being prepared
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Estimated time: 15-20 minutes
            </Typography>
          </Box>
        </Box>
      </Slide>

      {/* Confetti Effect */}
      {showCheck && (
        <>
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: '30%',
                left: `${20 + Math.random() * 60}%`,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: ['#10b981', '#0f172a', '#f59e0b'][Math.floor(Math.random() * 3)],
                animation: `confetti ${1 + Math.random()}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.3}s`,
                '@keyframes confetti': {
                  '0%': {
                    transform: 'translateY(0) rotate(0deg)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: `translateY(${200 + Math.random() * 200}px) rotate(${Math.random() * 360}deg)`,
                    opacity: 0,
                  },
                },
              }}
            />
          ))}
        </>
      )}
    </Box>
  );
};

export default OrderSuccessAnimation;
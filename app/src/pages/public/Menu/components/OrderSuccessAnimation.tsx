import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface OrderSuccessAnimationProps {
  orderNumber: string;
  onComplete: () => void;
}

const OrderSuccessAnimation: React.FC<OrderSuccessAnimationProps> = ({ orderNumber, onComplete }) => {
  const [showCheck, setShowCheck] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowCheck(true), 200);
    const t2 = setTimeout(() => setShowText(true), 700);
    const t3 = setTimeout(() => setShowDetails(true), 1100);
    const t4 = setTimeout(() => onComplete(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        textAlign: 'center',
      }}
    >
      {/* Ripple + check */}
      <Box sx={{ position: 'relative', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Ripple rings */}
        {showCheck && (
          <>
            <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.3)', animation: 'ripple1 1.5s ease-out infinite', '@keyframes ripple1': { '0%': { transform: 'scale(0.8)', opacity: 1 }, '100%': { transform: 'scale(1.6)', opacity: 0 } } }} />
            <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.2)', animation: 'ripple2 1.5s ease-out 0.4s infinite', '@keyframes ripple2': { '0%': { transform: 'scale(0.8)', opacity: 1 }, '100%': { transform: 'scale(1.8)', opacity: 0 } } }} />
          </>
        )}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: '#f0fdf4',
            border: '2px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: showCheck ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 44, color: '#10b981' }} />
        </Box>
      </Box>

      {/* Text */}
      <Box
        sx={{
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.4s ease',
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' }, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
          Order Placed!
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
          Your order has been received and is being processed
        </Typography>
      </Box>

      {/* Order number card */}
      <Box
        sx={{
          opacity: showDetails ? 1 : 0,
          transform: showDetails ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.4s ease',
          mt: 2,
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 2.5,
          px: 3,
          py: 2,
          minWidth: 200,
        }}
      >
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', mb: 0.5 }}>
          Order Number
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: '#f97316' }}>
          #{orderNumber}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
          Check the Orders tab to track your order
        </Typography>
      </Box>

      {/* Confetti dots */}
      {showCheck && Array.from({ length: 16 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'fixed',
            width: 8,
            height: 8,
            borderRadius: i % 3 === 0 ? '50%' : '2px',
            bgcolor: ['#f97316', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][i % 5],
            top: `${10 + Math.random() * 30}%`,
            left: `${5 + (i / 16) * 90}%`,
            animation: `confetti-${i} 1.2s ease-out forwards`,
            [`@keyframes confetti-${i}`]: {
              '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: 1 },
              '100%': { transform: `translateY(${60 + Math.random() * 80}px) rotate(${180 + Math.random() * 180}deg)`, opacity: 0 },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default OrderSuccessAnimation;
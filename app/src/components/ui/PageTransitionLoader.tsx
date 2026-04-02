import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import DinoLogo from './DinoLogo';

// ─── Hook ────────────────────────────────────────────────────────────────────

export const usePageTransition = () => {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);
  const prevPath = useRef(location.pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      setTransitioning(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setTransitioning(false), 600);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return { transitioning, setTransitioning };
};

// ─── Component ───────────────────────────────────────────────────────────────

interface PageTransitionLoaderProps {
  visible: boolean;
  message?: string;
  /** Primary accent color derived from the user's role (e.g. rc.primary). Defaults to #42A5F5. */
  color?: string;
}

export const PageTransitionLoader: React.FC<PageTransitionLoaderProps> = ({
  visible,
  message = 'Loading...',
  color = '#42A5F5',
}) => {
  const [mounted, setMounted] = useState(visible);
  const [opacity, setOpacity] = useState(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => setOpacity(1));
      return undefined;
    }
    setOpacity(0);
    const timer = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!mounted) return null;

  // Derive a subtle glow from the accent color
  const glowColor = `${color}33`; // ~20% opacity
  const trackColor = `${color}26`; // ~15% opacity

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0d1b2e',
        opacity,
        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      {/* Top progress bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: trackColor,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            bgcolor: color,
            borderRadius: '0 2px 2px 0',
            boxShadow: `0 0 12px ${color}cc`,
            animation: 'dinoProgress 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            '@keyframes dinoProgress': {
              '0%':   { width: '0%',  marginLeft: '0%' },
              '50%':  { width: '75%', marginLeft: '10%' },
              '100%': { width: '0%',  marginLeft: '100%' },
            },
          }}
        />
      </Box>

      {/* Subtle grid background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* Glow orb behind logo */}
      <Box
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          pointerEvents: 'none',
          animation: 'dinoGlow 2.4s ease-in-out infinite',
          '@keyframes dinoGlow': {
            '0%, 100%': { transform: 'scale(1)',    opacity: 0.7 },
            '50%':      { transform: 'scale(1.15)', opacity: 1   },
          },
        }}
      />

      {/* Logo + dots + label */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Box
          sx={{
            animation: 'dinoBounce 1.8s ease-in-out infinite',
            '@keyframes dinoBounce': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%':      { transform: 'translateY(-8px)' },
            },
          }}
        >
          <DinoLogo size={72} animated={false} />
        </Box>

        {/* Dot loader */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: color,
                animation: `dinoDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                '@keyframes dinoDot': {
                  '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
                  '40%':           { transform: 'scale(1)',   opacity: 1   },
                },
              }}
            />
          ))}
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            fontWeight: 500,
            mt: -1,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export default PageTransitionLoader;
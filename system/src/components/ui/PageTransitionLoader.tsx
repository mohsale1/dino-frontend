import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import DinoLogo from './DinoLogo';

// ─── Design tokens ────────────────────────────────────────────────────────────
const ACCENT      = '#00A6CA';
const ACCENT_DIM  = 'rgba(0,166,202,0.15)';
const ACCENT_MED  = 'rgba(0,166,202,0.35)';

// ─── Hook ─────────────────────────────────────────────────────────────────────

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
      timerRef.current = setTimeout(() => setTransitioning(false), 500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return { transitioning, setTransitioning };
};

// ─── Shared fade mount logic ───────────────────────────────────────────────────

const useFadeMount = (visible: boolean, exitDuration = 380) => {
  const [mounted, setMounted] = useState(visible);
  const [opacity, setOpacity] = useState(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => setOpacity(1));
      return undefined;
    }
    setOpacity(0);
    const t = setTimeout(() => setMounted(false), exitDuration);
    return () => clearTimeout(t);
  }, [visible, exitDuration]);

  return { mounted, opacity };
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. FULL-PAGE LOADER  (light background — used on auth check / app boot)
// ─────────────────────────────────────────────────────────────────────────────

interface PageTransitionLoaderProps {
  visible: boolean;
  message?: string;
}

export const PageTransitionLoader: React.FC<PageTransitionLoaderProps> = ({
  visible,
  message = 'Loading...',
}) => {
  const { mounted, opacity } = useFadeMount(visible, 380);

  if (!mounted) return null;

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
        bgcolor: '#f8fafc',
        opacity,
        transition: 'opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: visible ? 'all' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Subtle dot-grid texture */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(0,166,202,0.07) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      {/* Soft ambient glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,166,202,0.06) 0%, transparent 70%)`,
          pointerEvents: 'none',
          animation: 'fpGlow 3s ease-in-out infinite',
          '@keyframes fpGlow': {
            '0%, 100%': { transform: 'scale(0.9)',  opacity: 0.6 },
            '50%':      { transform: 'scale(1.1)',  opacity: 1   },
          },
        }}
      />

      {/* Top accent bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: 'rgba(0,166,202,0.08)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            bgcolor: ACCENT,
            boxShadow: `0 0 8px ${ACCENT_MED}`,
            animation: 'fpBar 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            '@keyframes fpBar': {
              '0%':   { width: '0%',  marginLeft: '0%'   },
              '50%':  { width: '65%', marginLeft: '18%'  },
              '100%': { width: '0%',  marginLeft: '100%' },
            },
          }}
        />
      </Box>

      {/* Core group */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Ring + logo */}
        <Box sx={{ position: 'relative', width: 96, height: 96 }}>

          {/* Outer spinning ring */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: ACCENT,
              borderRightColor: ACCENT_DIM,
              animation: 'fpSpinO 1.1s linear infinite',
              '@keyframes fpSpinO': {
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />

          {/* Inner counter-rotating ring */}
          <Box
            sx={{
              position: 'absolute',
              inset: 10,
              borderRadius: '50%',
              border: '1.5px solid transparent',
              borderBottomColor: ACCENT,
              borderLeftColor: ACCENT_DIM,
              animation: 'fpSpinI 0.75s linear infinite reverse',
              '@keyframes fpSpinI': {
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />

          {/* Subtle ring shadow */}
          <Box
            sx={{
              position: 'absolute',
              inset: 4,
              borderRadius: '50%',
              boxShadow: `0 0 0 1px ${ACCENT_DIM}`,
              animation: 'fpRingPulse 2.4s ease-in-out infinite',
              '@keyframes fpRingPulse': {
                '0%, 100%': { opacity: 0.4 },
                '50%':      { opacity: 1   },
              },
            }}
          />

          {/* Logo */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fpLogoPulse 2.4s ease-in-out infinite',
              '@keyframes fpLogoPulse': {
                '0%, 100%': { transform: 'scale(0.94)', opacity: 0.8 },
                '50%':      { transform: 'scale(1.04)', opacity: 1   },
              },
            }}
          >
            <DinoLogo size={40} animated={false} />
          </Box>
        </Box>

        {/* Dot pulse */}
        <Box sx={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: ACCENT,
                animation: `fpDot 1.3s ease-in-out ${i * 0.2}s infinite`,
                '@keyframes fpDot': {
                  '0%, 80%, 100%': { transform: 'scale(0.4)', opacity: 0.2 },
                  '40%':           { transform: 'scale(1)',   opacity: 1   },
                },
              }}
            />
          ))}
        </Box>

        {/* Label */}
        <Typography
          sx={{
            color: '#94a3b8',
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            mt: '-6px',
            animation: 'fpLabel 2s ease-in-out infinite',
            '@keyframes fpLabel': {
              '0%, 100%': { opacity: 0.5 },
              '50%':      { opacity: 1   },
            },
          }}
        >
          {message}
        </Typography>
      </Box>

      {/* Bottom wordmark */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.35,
        }}
      >
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: ACCENT }} />
        <Typography
          sx={{
            color: '#64748b',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Dino System
        </Typography>
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: ACCENT }} />
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MODULE TRANSITION LOADER  (non-intrusive — used between in-app routes)
// ─────────────────────────────────────────────────────────────────────────────

interface ModuleTransitionLoaderProps {
  visible: boolean;
}

export const ModuleTransitionLoader: React.FC<ModuleTransitionLoaderProps> = ({ visible }) => {
  const { mounted, opacity } = useFadeMount(visible, 240);

  if (!mounted) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: visible ? 'all' : 'none',
        opacity,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Top sweeping bar — anchored to the content area */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: 'rgba(0,166,202,0.08)',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            height: '100%',
            bgcolor: ACCENT,
            boxShadow: `0 0 6px ${ACCENT_MED}`,
            animation: 'mtBar 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            '@keyframes mtBar': {
              '0%':   { width: '0%',  marginLeft: '0%'   },
              '60%':  { width: '60%', marginLeft: '20%'  },
              '100%': { width: '0%',  marginLeft: '100%' },
            },
          }}
        />
      </Box>

      {/* Light frosted overlay over content only */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(248,250,252,0.6)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
        }}
      />

      {/* Centered spinner pill */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          bgcolor: '#ffffff',
          border: '1px solid rgba(0,166,202,0.14)',
          borderRadius: '100px',
          px: '18px',
          py: '10px',
          boxShadow: '0 4px 20px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04)',
        }}
      >
        {/* Dual-ring spinner */}
        <Box sx={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: ACCENT,
              borderRightColor: ACCENT_DIM,
              animation: 'mtSpinO 0.85s linear infinite',
              '@keyframes mtSpinO': { to: { transform: 'rotate(360deg)' } },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 4,
              borderRadius: '50%',
              border: '1.5px solid transparent',
              borderBottomColor: ACCENT,
              animation: 'mtSpinI 0.6s linear infinite reverse',
              '@keyframes mtSpinI': { to: { transform: 'rotate(360deg)' } },
            }}
          />
        </Box>

        <Typography
          sx={{
            color: '#475569',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}
        >
          Loading
        </Typography>

        <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: ACCENT,
                animation: `mtDot 1.1s ease-in-out ${i * 0.16}s infinite`,
                '@keyframes mtDot': {
                  '0%, 80%, 100%': { opacity: 0.2, transform: 'scale(0.6)' },
                  '40%':           { opacity: 1,   transform: 'scale(1)'   },
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PageTransitionLoader;

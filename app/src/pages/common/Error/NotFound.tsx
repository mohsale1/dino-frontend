import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { APP_CONFIG } from '../../../constants/app';

// ─── Star field canvas ────────────────────────────────────────────────────────
const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 140 }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     Math.random() * 1.3 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.3 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = frame * 0.01;
      stars.forEach(s => {
        const tw = s.alpha * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${tw})`;
        ctx.fill();
      });
      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
};


// ─── Planet ───────────────────────────────────────────────────────────────────
const Planet: React.FC = () => (
  <Box sx={{ position: 'absolute', bottom: '6%', right: '5%', opacity: 0.85 }}>
    <svg width="80" height="80" viewBox="0 0 90 90">
      <defs>
        <radialGradient id="nf_planet" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="36" fill="url(#nf_planet)" />
      <ellipse cx="45" cy="45" rx="54" ry="11" fill="none" stroke="rgba(165,180,252,0.45)" strokeWidth="5" />
      <circle cx="32" cy="36" r="6" fill="rgba(255,255,255,0.06)" />
    </svg>
  </Box>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleHome = () => navigate(isAuthenticated ? '/admin/dashboard' : '/', { replace: true });
  const handleBack = () => window.history.length > 1 ? navigate(-1) : handleHome();

  const quickLinks = isAuthenticated
    ? [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Catalog',   path: '/admin/catalog'   },
        { label: 'Orders',    path: '/admin/orders'    },
        { label: 'Locations', path: '/admin/locations' },
      ]
    : [
        { label: 'Home',     path: '/'         },
        { label: 'Login',    path: '/login'    },
        { label: 'Register', path: '/register' },
      ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ── TOP: space scene ── */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: '#0d1b2e',
          flex: '0 0 55%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StarField />


        {/* Moon */}
        <Box sx={{ position: 'absolute', top: '10%', left: '6%' }}>
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="rgba(203,213,225,0.16)" />
            <circle cx="12" cy="14" r="3"  fill="rgba(203,213,225,0.1)" />
            <circle cx="22" cy="22" r="2"  fill="rgba(203,213,225,0.08)" />
          </svg>
        </Box>

        <Planet />

        {/* Bouncing 404 */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: '0.1em', md: '0.05em' },
          }}
        >
          {['4', '0', '4'].map((char, i) => (
            <Typography
              key={i}
              component="span"
              sx={{
                fontSize: { xs: '5rem', sm: '7rem', md: '9rem' },
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: { xs: '1.5px rgba(96,165,250,0.4)', md: '2px rgba(96,165,250,0.4)' },
                display: 'inline-block',
                animation: `charBounce 0.6s ease-in-out ${i * 0.12}s infinite alternate`,
                '@keyframes charBounce': {
                  '0%':   { transform: 'translateY(0px)' },
                  '100%': { transform: 'translateY(-18px)' },
                },
              }}
            >
              {char}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* ── BOTTOM: content ── */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, md: 6 },
          textAlign: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(25,118,210,0.18), transparent)',
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.35rem', md: '1.6rem' },
            color: '#1C1C1E',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Lost in space
        </Typography>

        <Typography
          sx={{
            fontSize: '0.875rem',
            color: '#64748b',
            mt: 1,
            maxWidth: 380,
            lineHeight: 1.7,
          }}
        >
          This page drifted off into the void. The URL may be wrong or the page no longer exists.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} mt={3}>
          <Button
            variant="contained"
            startIcon={<Home sx={{ fontSize: 17 }} />}
            onClick={handleHome}
            disableElevation
            sx={{
              minWidth: 140,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 1.5,
              py: 0.875,
              px: 2.5,
              fontSize: '0.875rem',
              bgcolor: '#1976D2',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
            }}
          >
            {isAuthenticated ? 'Dashboard' : 'Go Home'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBack sx={{ fontSize: 17 }} />}
            onClick={handleBack}
            sx={{
              minWidth: 140,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1.5,
              py: 0.875,
              px: 2.5,
              fontSize: '0.875rem',
              borderColor: '#e0e0e0',
              color: '#64748b',
              boxShadow: 'none',
              '&:hover': { borderColor: '#1976D2', color: '#1976D2', bgcolor: 'transparent', boxShadow: 'none' },
            }}
          >
            Go Back
          </Button>
        </Stack>

        {/* Quick links */}
        <Box
          mt={3}
          pt={2.5}
          sx={{ borderTop: '1px solid #f1f5f9', width: '100%', maxWidth: 400 }}
        >
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Quick links
          </Typography>
          <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" mt={1} useFlexGap>
            {quickLinks.map(({ label, path }) => (
              <Button
                key={path}
                size="small"
                onClick={() => navigate(path)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  color: '#64748b',
                  borderRadius: 1.5,
                  px: 1.25,
                  py: 0.4,
                  '&:hover': { color: '#1976D2', bgcolor: 'rgba(25,118,210,0.06)' },
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>
        </Box>

        <Typography sx={{ fontSize: '0.72rem', color: '#cbd5e1', mt: 2.5 }}>
          {APP_CONFIG.copyright()}
        </Typography>
      </Box>
    </Box>
  );
};

export default NotFoundPage;

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  alpha,
  keyframes,
} from '@mui/material';
import {
  ArrowForward,
  PlayArrow,
  TrendingUp,
  Speed,
  Security,
  QrCode2,
  Dashboard as DashboardIcon,
  Store,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/common/Auth';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG      = '#0b1120';   // near-black navy
const BLUE    = '#1976D2';   // primary blue
const BLUE_LT = '#42A5F5';   // lighter blue for accents
const WHITE   = '#ffffff';

// ─── Keyframes ────────────────────────────────────────────────────────────────

// Single slow-drifting glow — the only background animation
const glow = keyframes`
  0%,100% { transform: translate(0px, 0px)   scale(1);    opacity: 1; }
  50%      { transform: translate(40px,-30px) scale(1.06); opacity: 0.85; }
`;

// Entrance animations
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0);    }
`;

// Subtle status dot pulse
const dotPulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0   ${alpha(BLUE_LT, 0.5)}; }
  50%      { box-shadow: 0 0 0 5px ${alpha(BLUE_LT, 0)};   }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURE_CARDS = [
  { Icon: QrCode2,       title: 'QR Ordering',       desc: 'Contactless catalog access',  delay: '0.45s' },
  { Icon: DashboardIcon, title: 'Live Dashboard',     desc: 'Real-time analytics',         delay: '0.6s'  },
  { Icon: Store,         title: 'Catalog Management', desc: 'Easy updates & control',      delay: '0.75s' },
];

const PILLS = [
  { Icon: TrendingUp, label: '3x Faster'  },
  { Icon: Speed,      label: 'Real-time'  },
  { Icon: Security,   label: 'Secure'     },
];

// ─── Component ────────────────────────────────────────────────────────────────
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box
      id="hero"
      sx={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        pt: { xs: '64px', md: '70px' },
        boxSizing: 'border-box',
        backgroundColor: BG,
      }}
    >

      {/* ── BACKGROUND ───────────────────────────────────────────────────── */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>

        {/* Dot grid — professional texture */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${alpha(WHITE, 0.06)} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Single blue glow — top-right, slow drift */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: { xs: '480px', md: '700px' },
            height: { xs: '480px', md: '700px' },
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%,
              ${alpha(BLUE, 0.22)} 0%,
              ${alpha(BLUE, 0.08)} 45%,
              transparent         70%)`,
            filter: 'blur(80px)',
            animation: `${glow} 16s ease-in-out infinite`,
          }}
        />

        {/* Subtle secondary glow — bottom-left, counter-drift */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-8%',
            width: { xs: '360px', md: '520px' },
            height: { xs: '360px', md: '520px' },
            borderRadius: '50%',
            background: `radial-gradient(circle,
              ${alpha(BLUE, 0.1)} 0%,
              transparent        65%)`,
            filter: 'blur(70px)',
            animation: `${glow} 20s ease-in-out infinite reverse`,
            animationDelay: '4s',
          }}
        />

        {/* Thin horizontal rule — adds structure */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg,
              transparent          0%,
              ${alpha(BLUE, 0.12)} 30%,
              ${alpha(BLUE, 0.12)} 70%,
              transparent          100%)`,
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Box>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2.5, sm: 3, md: 3 },
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} alignItems="center">

          {/* ── LEFT COLUMN ── */}
          <Grid item xs={12} md={6}>
            <Stack
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{
                alignItems: { xs: 'center', md: 'flex-start' },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >


              {/* Headline */}
              <Box sx={{ animation: `${fadeUp} 0.6s ease-out 0.22s both` }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.875rem', sm: '2.75rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    color: WHITE,
                  }}
                >
                  Transform Your{' '}
                  <Box
                    component="span"
                    sx={{
                      color: BLUE_LT,
                      position: 'relative',
                      // Underline accent
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-4px',
                        left: 0,
                        right: 0,
                        height: '3px',
                        borderRadius: '2px',
                        background: `linear-gradient(90deg, ${BLUE} 0%, ${BLUE_LT} 100%)`,
                      },
                    }}
                  >
                    Business
                  </Box>
                  {' '}Operations
                </Typography>
              </Box>

              {/* Body copy */}
              <Typography
                sx={{
                  fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                  fontWeight: 400,
                  color: alpha(WHITE, 0.58),
                  lineHeight: 1.75,
                  maxWidth: 500,
                  animation: `${fadeUp} 0.6s ease-out 0.34s both`,
                }}
              >
                Streamline operations with digital catalogs, QR ordering, and real-time management for cafes, restaurants, bars, and service businesses.
              </Typography>

              {/* Stat pills */}
              <Stack
                direction="row"
                spacing={1.25}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  animation: `${fadeUp} 0.6s ease-out 0.46s both`,
                }}
              >
                {PILLS.map(({ Icon, label }) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.625,
                      borderRadius: '6px',
                      backgroundColor: alpha(WHITE, 0.05),
                      border: `1px solid ${alpha(WHITE, 0.1)}`,
                    }}
                  >
                    <Icon sx={{ fontSize: 14, color: alpha(WHITE, 0.45) }} />
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: alpha(WHITE, 0.65),
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* CTA buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{
                  width: '100%',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  animation: `${fadeUp} 0.6s ease-out 0.58s both`,
                }}
              >
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                    onClick={() => navigate('/admin/dashboard')}
                    sx={{
                      px: { xs: 4, sm: 4.5 },
                      py: { xs: 1.25, sm: 1.5 },
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      textTransform: 'none',
                      backgroundColor: BLUE,
                      color: WHITE,
                      boxShadow: `0 4px 16px ${alpha(BLUE, 0.4)}`,
                      '&:hover': {
                        backgroundColor: '#1565C0',
                        boxShadow: `0 6px 24px ${alpha(BLUE, 0.5)}`,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                      onClick={() => navigate('/register')}
                      sx={{
                        px: { xs: 4, sm: 4.5 },
                        py: { xs: 1.25, sm: 1.5 },
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        textTransform: 'none',
                        backgroundColor: BLUE,
                        color: WHITE,
                        boxShadow: `0 4px 16px ${alpha(BLUE, 0.4)}`,
                        '&:hover': {
                          backgroundColor: '#1565C0',
                          boxShadow: `0 6px 24px ${alpha(BLUE, 0.5)}`,
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Get Started
                    </Button>

                    <Button
                      variant="text"
                      size="large"
                      startIcon={<PlayArrow sx={{ fontSize: 18 }} />}
                      onClick={() =>
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                      }
                      sx={{
                        px: { xs: 4, sm: 4.5 },
                        py: { xs: 1.25, sm: 1.5 },
                        fontSize: '1rem',
                        fontWeight: 500,
                        borderRadius: '8px',
                        textTransform: 'none',
                        color: alpha(WHITE, 0.7),
                        border: `1px solid ${alpha(WHITE, 0.12)}`,
                        '&:hover': {
                          backgroundColor: alpha(WHITE, 0.05),
                          color: WHITE,
                          borderColor: alpha(WHITE, 0.25),
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      See How It Works
                    </Button>
                  </>
                )}
              </Stack>


            </Stack>
          </Grid>

          {/* ── RIGHT COLUMN — Feature cards (desktop only) ── */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 440,
                animation: `${fadeRight} 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both`,
              }}
            >
              <Stack spacing={1.5}>
                {FEATURE_CARDS.map(({ Icon, title, desc, delay }) => (
                  <Box
                    key={title}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2.5,
                      py: 2,
                      borderRadius: '12px',
                      backgroundColor: alpha(WHITE, 0.04),
                      border: `1px solid ${alpha(WHITE, 0.08)}`,
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.25s ease',
                      animation: `${fadeUp} 0.6s ease-out ${delay} both`,
                      '&:hover': {
                        backgroundColor: alpha(WHITE, 0.07),
                        borderColor: alpha(BLUE_LT, 0.3),
                        transform: 'translateX(6px)',
                      },
                    }}
                  >
                    {/* Icon container */}
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(BLUE, 0.15),
                        border: `1px solid ${alpha(BLUE_LT, 0.2)}`,
                      }}
                    >
                      <Icon sx={{ fontSize: 24, color: BLUE_LT }} />
                    </Box>

                    {/* Text */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: WHITE,
                          lineHeight: 1.3,
                          mb: 0.25,
                        }}
                      >
                        {title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          color: alpha(WHITE, 0.45),
                          lineHeight: 1.4,
                        }}
                      >
                        {desc}
                      </Typography>
                    </Box>

                    {/* Live indicator */}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: BLUE_LT,
                        flexShrink: 0,
                        animation: `${dotPulse} 2.5s ease-in-out ${delay} infinite`,
                      }}
                    />
                  </Box>
                ))}


              </Stack>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
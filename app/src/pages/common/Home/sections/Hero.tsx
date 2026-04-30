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
  ShoppingCart,
  TableRestaurant,
  CheckCircle,
  Schedule,
  FiberManualRecord,
  BarChart as BarChartIcon,
  People,
  Notifications,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/common/Auth';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG      = '#0b1120';
const BLUE    = '#1976D2';
const BLUE_LT = '#42A5F5';
const WHITE   = '#ffffff';
const GREEN   = '#4CAF50';
const ORANGE  = '#FFA726';
const CARD_BG = '#0d1b2e';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const glow = keyframes`
  0%,100% { transform: translate(0px, 0px)   scale(1);    opacity: 1; }
  50%      { transform: translate(40px,-30px) scale(1.06); opacity: 0.85; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0);    }
`;

const dotPulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0   ${alpha(BLUE_LT, 0.5)}; }
  50%      { box-shadow: 0 0 0 5px ${alpha(BLUE_LT, 0)};   }
`;

const greenPulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0   ${alpha(GREEN, 0.6)}; opacity: 1; }
  50%      { box-shadow: 0 0 0 6px ${alpha(GREEN, 0)};   opacity: 0.75; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const barGrow = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;

const slideInNotif = keyframes`
  from { opacity: 0; transform: translateX(24px) translateY(-8px); }
  to   { opacity: 1; transform: translateX(0)    translateY(0);    }
`;

// ─── Static data ──────────────────────────────────────────────────────────────
const TRUST_PILLS = [
  { Icon: Speed,      label: 'Real-time Analytics' },
  { Icon: QrCode2,    label: 'No App Needed'       },
  { Icon: Security,   label: 'Secure & Reliable'   },
];

// Bar chart heights (% of max, 0–100)
const BAR_DATA = [42, 68, 55, 80, 63, 91, 74];
const BAR_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const ORDERS = [
  { id: '#1042', table: 'Table 4',  items: 3, amount: '$28.50', status: 'ready',   color: GREEN   },
  { id: '#1041', table: 'Table 7',  items: 5, amount: '$54.00', status: 'cooking', color: ORANGE  },
  { id: '#1040', table: 'Table 2',  items: 2, amount: '$19.00', status: 'new',     color: BLUE_LT },
];

const SIDEBAR_ICONS = [
  { Icon: DashboardIcon, active: true  },
  { Icon: ShoppingCart,  active: false },
  { Icon: BarChartIcon,  active: false },
  { Icon: People,        active: false },
  { Icon: Store,         active: false },
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
        minHeight: 560,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        pt: { xs: '64px', md: '70px' },
        boxSizing: 'border-box',
        backgroundColor: BG,
      }}
    >
      {/* ── BACKGROUND ── */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Dot grid */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${alpha(WHITE, 0.055)} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Primary glow — top-right */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%', right: '-10%',
            width: { xs: '480px', md: '700px' },
            height: { xs: '480px', md: '700px' },
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%,
              ${alpha(BLUE, 0.24)} 0%,
              ${alpha(BLUE, 0.08)} 45%,
              transparent 70%)`,
            filter: 'blur(80px)',
            animation: `${glow} 16s ease-in-out infinite`,
          }}
        />
        {/* Secondary glow — bottom-left */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%', left: '-8%',
            width: { xs: '360px', md: '520px' },
            height: { xs: '360px', md: '520px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(BLUE, 0.1)} 0%, transparent 65%)`,
            filter: 'blur(70px)',
            animation: `${glow} 20s ease-in-out infinite reverse`,
            animationDelay: '4s',
          }}
        />
        {/* Horizontal rule */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%', left: 0, right: 0,
            height: '1px',
            background: `linear-gradient(90deg,
              transparent 0%,
              ${alpha(BLUE, 0.12)} 30%,
              ${alpha(BLUE, 0.12)} 70%,
              transparent 100%)`,
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Box>

      {/* ── CONTENT ── */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          py: { xs: 3, sm: 4, md: 2 },
          px: { xs: 2.5, sm: 3, md: 3 },
          width: '100%',
        }}
      >
        <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} alignItems="center">

          {/* ── LEFT COLUMN ── */}
          <Grid item xs={12} md={6}>
            <Stack
              spacing={{ xs: 2, sm: 2.5, md: 2.5 }}
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
                    fontSize: { xs: '1.875rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    color: WHITE,
                  }}
                >
                  Run Your Business{' '}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      background: `linear-gradient(135deg, ${BLUE_LT} 0%, #90CAF9 50%, ${BLUE_LT} 100%)`,
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${shimmer} 4s linear infinite`,
                    }}
                  >
                    Smarter
                  </Box>
                  {', Not Harder'}
                </Typography>
              </Box>

              {/* Body copy */}
              <Typography
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                  fontWeight: 400,
                  color: alpha(WHITE, 0.6),
                  lineHeight: 1.65,
                  maxWidth: 500,
                  animation: `${fadeUp} 0.6s ease-out 0.34s both`,
                }}
              >
                Let customers order via QR code, browse your digital catalog, and give your team real-time analytics — all without a single app download.
              </Typography>

              {/* Trust pills */}
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  animation: `${fadeUp} 0.6s ease-out 0.46s both`,
                }}
              >
                {TRUST_PILLS.map(({ Icon, label }) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5, py: 0.625,
                      borderRadius: '8px',
                      backgroundColor: alpha(WHITE, 0.05),
                      border: `1px solid ${alpha(WHITE, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(BLUE, 0.12),
                        borderColor: alpha(BLUE_LT, 0.3),
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 13, color: BLUE_LT }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: alpha(WHITE, 0.7), whiteSpace: 'nowrap' }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* CTA buttons */}
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 1.5 }}
                sx={{
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  animation: `${fadeUp} 0.6s ease-out 0.58s both`,
                  flexWrap: 'nowrap',
                }}
              >
                {user ? (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward sx={{ fontSize: { xs: 15, sm: 18 } }} />}
                    onClick={() => navigate('/admin/dashboard')}
                    sx={{
                      px: { xs: 2.5, sm: 3.5 },
                      py: { xs: 1, sm: 1.25 },
                      fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                      fontWeight: 600,
                      borderRadius: '10px',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      background: `linear-gradient(135deg, ${BLUE} 0%, #1565C0 100%)`,
                      color: WHITE,
                      boxShadow: `0 4px 20px ${alpha(BLUE, 0.45)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, #1E88E5 0%, ${BLUE} 100%)`,
                        boxShadow: `0 6px 28px ${alpha(BLUE, 0.55)}`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.22s ease',
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward sx={{ fontSize: { xs: 15, sm: 18 } }} />}
                      onClick={() => navigate('/register')}
                      sx={{
                        px: { xs: 2.5, sm: 3.5 },
                        py: { xs: 1, sm: 1.25 },
                        fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                        fontWeight: 600,
                        borderRadius: '10px',
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        background: `linear-gradient(135deg, ${BLUE} 0%, #1565C0 100%)`,
                        color: WHITE,
                        boxShadow: `0 4px 20px ${alpha(BLUE, 0.45)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, #1E88E5 0%, ${BLUE} 100%)`,
                          boxShadow: `0 6px 28px ${alpha(BLUE, 0.55)}`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.22s ease',
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="text"
                      startIcon={<PlayArrow sx={{ fontSize: { xs: 15, sm: 18 } }} />}
                      onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                      sx={{
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.25 },
                        fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                        fontWeight: 500,
                        borderRadius: '10px',
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        color: alpha(WHITE, 0.7),
                        border: `1px solid ${alpha(WHITE, 0.12)}`,
                        '&:hover': {
                          backgroundColor: alpha(WHITE, 0.05),
                          color: WHITE,
                          borderColor: alpha(WHITE, 0.28),
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      How It Works
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Grid>

          {/* ── RIGHT COLUMN — Full dashboard mockup (desktop only) ── */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 480,
                position: 'relative',
                animation: `${fadeRight} 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both`,
              }}
            >

              {/* ── BROWSER FRAME ── */}
              <Box
                sx={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: `1px solid ${alpha(BLUE_LT, 0.18)}`,
                  boxShadow: `
                    0 0 0 1px ${alpha(WHITE, 0.04)},
                    0 32px 80px ${alpha('#000', 0.65)},
                    0 0 100px ${alpha(BLUE, 0.15)}
                  `,
                  background: CARD_BG,
                }}
              >

                {/* Browser chrome bar */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    background: `linear-gradient(90deg, ${alpha('#0a1628', 0.98)} 0%, ${alpha('#0d1e38', 0.98)} 100%)`,
                    borderBottom: `1px solid ${alpha(WHITE, 0.06)}`,
                  }}
                >
                  {/* Window dots */}
                  <Stack direction="row" spacing={0.625} alignItems="center" sx={{ flexShrink: 0 }}>
                    {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                      <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c, opacity: 0.9 }} />
                    ))}
                  </Stack>

                  {/* URL bar */}
                  <Box
                    sx={{
                      flex: 1,
                      mx: 1,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '6px',
                      backgroundColor: alpha(WHITE, 0.05),
                      border: `1px solid ${alpha(WHITE, 0.08)}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: GREEN, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.6875rem', color: alpha(WHITE, 0.4), fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                      app.dino-order.com/dashboard
                    </Typography>
                  </Box>

                  {/* Notification bell */}
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Notifications sx={{ fontSize: 16, color: alpha(WHITE, 0.35) }} />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -2, right: -2,
                        width: 7, height: 7,
                        borderRadius: '50%',
                        backgroundColor: '#EF5350',
                        border: `1px solid ${CARD_BG}`,
                      }}
                    />
                  </Box>
                </Box>

                {/* App body */}
                <Box sx={{ display: 'flex', height: 280 }}>

                  {/* ── SIDEBAR ── */}
                  <Box
                    sx={{
                      width: 48,
                      flexShrink: 0,
                      background: `linear-gradient(180deg, ${alpha('#0a1628', 0.95)} 0%, ${alpha('#0b1a30', 0.95)} 100%)`,
                      borderRight: `1px solid ${alpha(WHITE, 0.05)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pt: 1.5,
                      gap: 0.5,
                    }}
                  >
                    {/* Logo dot */}
                    <Box
                      sx={{
                        width: 28, height: 28,
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LT} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: WHITE }}>D</Typography>
                    </Box>

                    {SIDEBAR_ICONS.map(({ Icon, active }, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 34, height: 34,
                          borderRadius: '9px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: active ? alpha(BLUE, 0.25) : 'transparent',
                          border: active ? `1px solid ${alpha(BLUE_LT, 0.35)}` : '1px solid transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Icon sx={{ fontSize: 16, color: active ? BLUE_LT : alpha(WHITE, 0.28) }} />
                      </Box>
                    ))}
                  </Box>

                  {/* ── MAIN CONTENT ── */}
                  <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* Top bar */}
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${alpha(WHITE, 0.05)}`,
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: WHITE, letterSpacing: '-0.01em' }}>
                        Overview
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 6, height: 6,
                            borderRadius: '50%',
                            backgroundColor: GREEN,
                            animation: `${greenPulse} 2s ease-in-out infinite`,
                          }}
                        />
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: '#66BB6A' }}>LIVE</Typography>
                      </Box>
                    </Box>

                    {/* Scrollable content area */}
                    <Box sx={{ flex: 1, overflow: 'hidden', px: 1.5, py: 1.25, display: 'flex', flexDirection: 'column', gap: 1.25 }}>

                      {/* ── KPI CHIPS ROW ── */}
                      <Stack direction="row" spacing={0.75}>
                        {[
                          { label: 'Orders',  value: '47',     color: BLUE_LT },
                          { label: 'Revenue', value: '$1,240', color: GREEN   },
                          { label: 'Tables',  value: '8/12',   color: ORANGE  },
                          { label: 'Items',   value: '124',    color: '#CE93D8' },
                        ].map(({ label, value, color }) => (
                          <Box
                            key={label}
                            sx={{
                              flex: 1,
                              px: 0.75, py: 0.875,
                              borderRadius: '8px',
                              backgroundColor: alpha(color, 0.1),
                              border: `1px solid ${alpha(color, 0.2)}`,
                              textAlign: 'center',
                            }}
                          >
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color, lineHeight: 1.1 }}>
                              {value}
                            </Typography>
                            <Typography sx={{ fontSize: '0.5625rem', color: alpha(WHITE, 0.4), mt: 0.25, lineHeight: 1 }}>
                              {label}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>

                      {/* ── BAR CHART ── */}
                      <Box
                        sx={{
                          borderRadius: '10px',
                          backgroundColor: alpha(WHITE, 0.03),
                          border: `1px solid ${alpha(WHITE, 0.06)}`,
                          px: 1.5, pt: 1.25, pb: 1,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: alpha(WHITE, 0.6), letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Weekly Orders
                          </Typography>
                          <Typography sx={{ fontSize: '0.5625rem', color: alpha(BLUE_LT, 0.7) }}>
                            +18% vs last week
                          </Typography>
                        </Stack>

                        {/* Bars */}
                        <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: 52 }}>
                          {BAR_DATA.map((h, i) => (
                            <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, height: '100%', justifyContent: 'flex-end' }}>
                              <Box
                                sx={{
                                  width: '100%',
                                  height: `${h}%`,
                                  borderRadius: '3px 3px 2px 2px',
                                  background: i === 5
                                    ? `linear-gradient(180deg, ${BLUE_LT} 0%, ${BLUE} 100%)`
                                    : alpha(BLUE_LT, 0.25),
                                  transformOrigin: 'bottom',
                                  animation: `${barGrow} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.5 + i * 0.07}s both`,
                                  boxShadow: i === 5 ? `0 0 8px ${alpha(BLUE_LT, 0.5)}` : 'none',
                                }}
                              />
                              <Typography sx={{ fontSize: '0.5rem', color: alpha(WHITE, i === 5 ? 0.7 : 0.3), lineHeight: 1 }}>
                                {BAR_DAYS[i]}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      {/* ── RECENT ORDERS ── */}
                      <Box>
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: alpha(WHITE, 0.5), letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.75 }}>
                          Recent Orders
                        </Typography>
                        <Stack spacing={0.625}>
                          {ORDERS.map(({ id, table, items, amount, status, color }, i) => (
                            <Box
                              key={id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.25, py: 0.875,
                                borderRadius: '8px',
                                backgroundColor: alpha(WHITE, 0.03),
                                border: `1px solid ${alpha(WHITE, 0.05)}`,
                                animation: `${fadeUp} 0.4s ease-out ${0.8 + i * 0.1}s both`,
                              }}
                            >
                              {/* Status dot */}
                              <FiberManualRecord sx={{ fontSize: 8, color, flexShrink: 0 }} />

                              {/* Order info */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: WHITE, lineHeight: 1 }}>
                                    {id}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.5625rem', color: alpha(WHITE, 0.4), lineHeight: 1 }}>
                                    {table}
                                  </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: '0.5625rem', color: alpha(WHITE, 0.35), mt: 0.25, lineHeight: 1 }}>
                                  {items} items
                                </Typography>
                              </Box>

                              {/* Amount */}
                              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: WHITE, flexShrink: 0 }}>
                                {amount}
                              </Typography>

                              {/* Status badge */}
                              <Box
                                sx={{
                                  px: 0.75, py: 0.25,
                                  borderRadius: '4px',
                                  backgroundColor: alpha(color, 0.15),
                                  border: `1px solid ${alpha(color, 0.3)}`,
                                  flexShrink: 0,
                                }}
                              >
                                <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                                  {status}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                    </Box>

                    {/* Bottom status bar */}
                    <Box
                      sx={{
                        px: 2, py: 0.875,
                        borderTop: `1px solid ${alpha(WHITE, 0.05)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                        background: alpha('#0a1628', 0.6),
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <QrCode2 sx={{ fontSize: 12, color: BLUE_LT }} />
                        <Typography sx={{ fontSize: '0.5625rem', color: alpha(WHITE, 0.45) }}>
                          12 QR tables active
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TableRestaurant sx={{ fontSize: 11, color: alpha(WHITE, 0.3) }} />
                        <Typography sx={{ fontSize: '0.5625rem', color: alpha(WHITE, 0.35) }}>
                          8 / 12 occupied
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* ── FLOATING NOTIFICATION CARD ── */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -18,
                  right: -20,
                  width: 190,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${alpha('#0d1e38', 0.97)} 0%, ${alpha('#0a1628', 0.97)} 100%)`,
                  border: `1px solid ${alpha(GREEN, 0.35)}`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: `0 12px 32px ${alpha('#000', 0.5)}, 0 0 20px ${alpha(GREEN, 0.12)}`,
                  px: 1.75, py: 1.5,
                  animation: `${slideInNotif} 0.7s cubic-bezier(0.22, 1, 0.36, 1) 1.2s both`,
                }}
              >
                <Stack direction="row" alignItems="flex-start" spacing={1.25}>
                  <Box
                    sx={{
                      width: 30, height: 30,
                      borderRadius: '8px',
                      backgroundColor: alpha(GREEN, 0.15),
                      border: `1px solid ${alpha(GREEN, 0.3)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 16, color: GREEN }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: WHITE, lineHeight: 1.2, mb: 0.25 }}>
                      New Order Received
                    </Typography>
                    <Typography sx={{ fontSize: '0.5625rem', color: alpha(WHITE, 0.45), lineHeight: 1.4 }}>
                      Table 9 — 4 items · $42.00
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
                      <Schedule sx={{ fontSize: 9, color: alpha(WHITE, 0.3) }} />
                      <Typography sx={{ fontSize: '0.5rem', color: alpha(WHITE, 0.3) }}>Just now</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* ── FLOATING QR BADGE ── */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -16,
                  left: -16,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${alpha(BLUE, 0.95)} 0%, ${alpha('#1565C0', 0.95)} 100%)`,
                  border: `1px solid ${alpha(BLUE_LT, 0.4)}`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: `0 8px 24px ${alpha(BLUE, 0.45)}`,
                  px: 1.5, py: 1.25,
                  animation: `${slideInNotif} 0.7s cubic-bezier(0.22, 1, 0.36, 1) 1.4s both`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <QrCode2 sx={{ fontSize: 20, color: WHITE }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: WHITE, lineHeight: 1.2 }}>
                      QR Ready
                    </Typography>
                    <Typography sx={{ fontSize: '0.5625rem', color: alpha(WHITE, 0.7), lineHeight: 1.3 }}>
                      Scan to order
                    </Typography>
                  </Box>
                </Stack>
              </Box>

            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
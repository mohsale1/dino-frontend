import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Restaurant,
  ShoppingCart,
  People,
  MenuBook,
  Business,
  ThumbUp,
  CloudDone,
} from '@mui/icons-material';
import AnimatedCounter from '../../../../components/ui/AnimatedCounter';
import { homePageService, HomePageStat } from '../../../../services/api/homePage';
import { DEFAULT_STATS } from '../../../../config/constants';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG      = '#0b1120';
const BLUE    = '#1976D2';
const BLUE_LT = '#42A5F5';
const WHITE   = '#ffffff';

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, any> = {
  restaurant:    Restaurant,
  shopping_cart: ShoppingCart,
  people:        People,
  menu_book:     MenuBook,
  business:      Business,
  thumb_up:      ThumbUp,
  cloud_done:    CloudDone,
};

// ─── Keyframes ────────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const livePulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0   ${alpha(BLUE_LT, 0.5)}; }
  50%      { box-shadow: 0 0 0 5px ${alpha(BLUE_LT, 0)};   }
`;

// ─── Component ────────────────────────────────────────────────────────────────
const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<HomePageStat[]>([...DEFAULT_STATS]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await homePageService.getStats();
        if (data && data.length > 0) {
          const mergedStats = data.map((apiStat: any, index: number) => {
            const iconComponent =
              typeof apiStat.icon === 'string'
                ? ICON_MAP[apiStat.icon] || DEFAULT_STATS[index]?.icon
                : apiStat.icon;
            return { ...DEFAULT_STATS[index], ...apiStat, icon: iconComponent };
          });
          setStats(mergedStats);
        } else {
          setStats([...DEFAULT_STATS]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats([...DEFAULT_STATS]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        backgroundColor: BG,
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: { xs: '64px', md: '70px' },
      }}
    >
      {/* ── BACKGROUND ── */}

      {/* Dot grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${alpha(WHITE, 0.05)} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      {/* Blue glow — top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-8%',
          width: { xs: '320px', md: '500px' },
          height: { xs: '320px', md: '500px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(BLUE, 0.18)} 0%, transparent 65%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle glow — bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-6%',
          width: { xs: '260px', md: '400px' },
          height: { xs: '260px', md: '400px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(BLUE_LT, 0.1)} 0%, transparent 65%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top border accent */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${alpha(BLUE_LT, 0.4)} 40%, ${alpha(BLUE_LT, 0.4)} 60%, transparent)`,
        }}
      />

      {/* ── CONTENT ── */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>

        {/* Section header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 4, md: 6 },
            animation: `${fadeInUp} 0.6s ease-out both`,
          }}
        >

          {/* Heading */}
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              fontWeight: 800,
              color: WHITE,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              mb: 1.5,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '3px',
                borderRadius: '2px',
                background: `linear-gradient(90deg, transparent, ${BLUE_LT}, transparent)`,
              },
            }}
          >
            By the Numbers
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: { xs: '0.9375rem', md: '1rem' },
              color: alpha(WHITE, 0.5),
              fontWeight: 400,
              lineHeight: 1.7,
              mt: 2,
            }}
          >
            Real-time data from our platform
          </Typography>
        </Box>

        {/* Stats grid */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Box
                sx={{
                  height: '100%',
                  px: { xs: 2, sm: 2.5, md: 3 },
                  py: { xs: 2.5, sm: 3, md: 3.5 },
                  borderRadius: '12px',
                  backgroundColor: alpha(WHITE, 0.04),
                  border: `1px solid ${alpha(WHITE, 0.08)}`,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  animation: `${fadeInUp} 0.6s ease-out ${0.1 + index * 0.1}s both`,
                  '&:hover': {
                    backgroundColor: alpha(WHITE, 0.07),
                    borderColor: alpha(BLUE_LT, 0.3),
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 40px ${alpha('#000000', 0.3)}`,
                    '& .stat-icon': {
                      backgroundColor: alpha(BLUE, 0.25),
                      borderColor: alpha(BLUE_LT, 0.4),
                    },
                  },
                }}
              >
                {/* Top accent line — always visible, blue */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    borderRadius: '0 0 2px 2px',
                    background: `linear-gradient(90deg, transparent, ${BLUE_LT}, transparent)`,
                    opacity: 0.5,
                  }}
                />

                {/* Icon */}
                <Box
                  className="stat-icon"
                  sx={{
                    width: { xs: 44, sm: 48, md: 52 },
                    height: { xs: 44, sm: 48, md: 52 },
                    borderRadius: '10px',
                    backgroundColor: alpha(BLUE, 0.12),
                    border: `1px solid ${alpha(BLUE_LT, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: { xs: 2, md: 2.5 },
                    transition: 'all 0.25s ease',
                  }}
                >
                  {stat.icon && (
                    <stat.icon sx={{ fontSize: { xs: 22, sm: 24, md: 26 }, color: BLUE_LT }} />
                  )}
                </Box>

                {/* Counter */}
                <AnimatedCounter
                  end={stat.number}
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                  duration={2000}
                  delay={index * 200}
                  variant="h3"
                  color={WHITE}
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    mb: 0.75,
                  }}
                />

                {/* Label */}
                <Typography
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    color: alpha(WHITE, 0.5),
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Live data footnote */}
        {stats.some((s) => s.number > 0) && (
          <Box
            sx={{
              mt: { xs: 4, md: 5 },
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              animation: `${fadeInUp} 0.6s ease-out 0.6s both`,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: BLUE_LT,
                animation: `${livePulse} 2.5s ease-in-out infinite`,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: alpha(WHITE, 0.35),
                fontWeight: 400,
              }}
            >
              Live data updated in real-time
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default StatsSection;
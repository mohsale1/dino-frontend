import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Restaurant,
  LocalDining,
  Store,
  ContentCut,
  ArrowForward,
} from '@mui/icons-material';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG      = '#0b1120';
const BLUE    = '#1976D2';
const BLUE_LT = '#42A5F5';
const WHITE   = '#ffffff';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

// ─── Use-case data ────────────────────────────────────────────────────────────
interface UseCase {
  icon: React.ElementType;
  title: string;
  description: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: Restaurant,
    title: 'Restaurants & Cafes',
    description:
      'Full table management, QR menus, kitchen order routing, and real-time revenue tracking for dine-in and takeaway.',
  },
  {
    icon: LocalDining,
    title: 'Cloud Kitchens',
    description:
      'Manage multiple virtual brands from one kitchen. Separate catalogs, unified order management, and delivery-ready workflows.',
  },
  {
    icon: Store,
    title: 'Retail Stores',
    description:
      'Digital product catalogs with inventory awareness. Let customers browse and order from their phone while in-store.',
  },
  {
    icon: ContentCut,
    title: 'Salons & Services',
    description:
      'Service menus, appointment-style ordering, and staff assignment. Perfect for any service-based business.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const UseCasesSection: React.FC = () => {
  return (
    <Box
      id="use-cases"
      sx={{
        py: { xs: 8, sm: 10, md: 12 },
        backgroundColor: BG,
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: { xs: '64px', md: '70px' },
      }}
    >
      {/* ── BACKGROUND LAYER ── */}

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
          top: '-15%',
          right: '-8%',
          width: { xs: '300px', md: '520px' },
          height: { xs: '300px', md: '520px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(BLUE, 0.2)} 0%, transparent 65%)`,
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* Blue glow — bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-6%',
          width: { xs: '260px', md: '440px' },
          height: { xs: '260px', md: '440px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(BLUE_LT, 0.12)} 0%, transparent 65%)`,
          filter: 'blur(70px)',
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
            mb: { xs: 5, md: 7 },
            animation: `${fadeInUp} 0.6s ease-out both`,
          }}
        >



          {/* Heading */}
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.875rem', sm: '2.375rem', md: '2.875rem' },
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
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '48px',
                height: '3px',
                borderRadius: '2px',
                background: `linear-gradient(90deg, transparent, ${BLUE_LT}, transparent)`,
              },
            }}
          >
            Perfect For Every Business
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: { xs: '0.9375rem', md: '1.0625rem' },
              color: alpha(WHITE, 0.5),
              fontWeight: 400,
              lineHeight: 1.75,
              mt: 2.5,
              maxWidth: '520px',
              mx: 'auto',
            }}
          >
            Whether you run a single outlet or a multi-brand operation, Dino adapts to the way you work.
          </Typography>
        </Box>

        {/* Cards grid */}
        <Grid container spacing={{ xs: 2.5, sm: 3, md: 3.5 }}>
          {USE_CASES.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    height: '100%',
                    p: { xs: 3, sm: 3.5, md: 4 },
                    borderRadius: '16px',
                    backgroundColor: alpha(WHITE, 0.04),
                    border: `1px solid ${alpha(WHITE, 0.08)}`,
                    backdropFilter: 'blur(12px)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'default',
                    transition: 'all 0.28s ease',
                    animation: `${fadeInUp} 0.6s ease-out ${0.1 + index * 0.12}s both`,
                    '&:hover': {
                      backgroundColor: alpha(WHITE, 0.07),
                      borderColor: alpha(BLUE_LT, 0.32),
                      transform: 'translateY(-5px)',
                      boxShadow: `0 20px 48px ${alpha('#000000', 0.35)}`,
                      '& .uc-icon-wrap': {
                        backgroundColor: alpha(BLUE, 0.28),
                        borderColor: alpha(BLUE_LT, 0.45),
                        boxShadow: `0 0 20px ${alpha(BLUE, 0.3)}`,
                      },
                      '& .uc-arrow': {
                        opacity: 1,
                        transform: 'translateX(0)',
                        color: BLUE_LT,
                      },
                      '& .uc-shimmer': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {/* Card top accent line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: '15%',
                      right: '15%',
                      height: '2px',
                      borderRadius: '0 0 2px 2px',
                      background: `linear-gradient(90deg, transparent, ${alpha(BLUE_LT, 0.5)}, transparent)`,
                      opacity: 0.6,
                    }}
                  />

                  {/* Shimmer overlay on hover */}
                  <Box
                    className="uc-shimmer"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      background: `linear-gradient(105deg, transparent 40%, ${alpha(BLUE_LT, 0.04)} 50%, transparent 60%)`,
                      backgroundSize: '200% auto',
                      animation: `${shimmer} 3s linear infinite`,
                      pointerEvents: 'none',
                    }}
                  />

                  <Stack direction="column" spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Icon + arrow row */}
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      {/* Icon circle */}
                      <Box
                        className="uc-icon-wrap"
                        sx={{
                          width: { xs: 52, md: 58 },
                          height: { xs: 52, md: 58 },
                          borderRadius: '50%',
                          backgroundColor: alpha(BLUE, 0.14),
                          border: `1px solid ${alpha(BLUE_LT, 0.22)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.28s ease',
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: { xs: 26, md: 28 },
                            color: BLUE_LT,
                          }}
                        />
                      </Box>

                      {/* Arrow indicator */}
                      <Box
                        className="uc-arrow"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: alpha(BLUE, 0.1),
                          border: `1px solid ${alpha(BLUE_LT, 0.15)}`,
                          opacity: 0.45,
                          transform: 'translateX(-4px)',
                          transition: 'all 0.28s ease',
                          color: alpha(WHITE, 0.5),
                          flexShrink: 0,
                          mt: 0.5,
                        }}
                      >
                        <ArrowForward sx={{ fontSize: 15 }} />
                      </Box>
                    </Stack>

                    {/* Text */}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: '1.0625rem', md: '1.125rem' },
                          fontWeight: 700,
                          color: WHITE,
                          letterSpacing: '-0.01em',
                          lineHeight: 1.3,
                          mb: 1,
                        }}
                      >
                        {useCase.title}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', md: '0.9375rem' },
                          color: alpha(WHITE, 0.52),
                          fontWeight: 400,
                          lineHeight: 1.75,
                        }}
                      >
                        {useCase.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default UseCasesSection;
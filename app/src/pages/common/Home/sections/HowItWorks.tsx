import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  alpha,
  keyframes,
} from '@mui/material';
import { Settings, QrCode2, Dashboard, ArrowForward } from '@mui/icons-material';

const BLUE    = '#1976D2';
const BLUE_LT = '#42A5F5';
const DARK_BG = '#0b1120';

const STEPS = [
  {
    number: '01',
    title: 'Set Up Your Catalog',
    description:
      'Create your digital catalog in minutes. Add products, set prices, upload photos, and organize by category. Your catalog is live instantly.',
    icon: Settings,
  },
  {
    number: '02',
    title: 'Share Your QR Code',
    description:
      'Print or display your unique QR code at tables, counters, or anywhere customers are. They scan it and instantly see your catalog.',
    icon: QrCode2,
  },
  {
    number: '03',
    title: 'Manage Orders Live',
    description:
      'Receive orders in real-time on your dashboard. Update statuses, track revenue, and keep your team in sync — all from one screen.',
    icon: Dashboard,
  },
];

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const wordDrop = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const HEADING_WORDS = ['Up', 'and', 'Running', 'in', 'Minutes'];
const WORD_DELAYS   = [0.1, 0.22, 0.36, 0.52, 0.66];

const HowItWorksSection: React.FC = () => {
  return (
    <Box
      id="how-it-works"
      sx={{
        py: { xs: 4, sm: 5, md: 6 },
        backgroundColor: DARK_BG,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        scrollMarginTop: { xs: '64px', md: '70px' },
      }}
    >
      {/* Top border accent */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(66,165,245,0.4) 40%, rgba(66,165,245,0.4) 60%, transparent)',
      }} />

      {/* Blue glow blob — top right */}
      <Box sx={{
        position: 'absolute', top: '-8%', right: '-6%',
        width: { xs: '300px', md: '480px' }, height: { xs: '300px', md: '480px' },
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(BLUE, 0.18)} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Blue glow blob — bottom left */}
      <Box sx={{
        position: 'absolute', bottom: '-8%', left: '-6%',
        width: { xs: '260px', md: '400px' }, height: { xs: '260px', md: '400px' },
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(BLUE_LT, 0.12)} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, sm: 3, md: 3 }, position: 'relative', zIndex: 1 }}>

        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 }, animation: `${fadeInUp} 0.7s ease-out both` }}>


          {/* Heading */}
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline',
            gap: { xs: '0.3em', sm: '0.4em' }, mb: 1.5, position: 'relative',
            '&::after': {
              content: '""', position: 'absolute', bottom: -10, left: '50%',
              transform: 'translateX(-50%)', width: '48px', height: '3px', borderRadius: '2px',
              background: `linear-gradient(90deg, transparent, ${BLUE_LT}, transparent)`,
            },
          }}>
            {HEADING_WORDS.map((word, i) => (
              <Typography
                key={word + i}
                component="span"
                sx={{
                  display: 'inline-block',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.875rem' },
                  fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em',
                  color: word === 'Running' || word === 'Minutes' ? BLUE_LT : '#ffffff',
                  opacity: 0,
                  animation: `${wordDrop} 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${WORD_DELAYS[i]}s forwards`,
                }}
              >
                {word}
              </Typography>
            ))}
          </Box>

          {/* Subtitle */}
          <Typography sx={{
            color: 'rgba(255,255,255,0.5)', maxWidth: 560, mx: 'auto', mt: 1.5,
            fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
            fontWeight: 400, lineHeight: 1.7, px: { xs: 1, sm: 0 },
          }}>
            Three simple steps to transform how your customers browse and order — no technical skills required.
          </Typography>
        </Box>

        {/* ── MOBILE: vertical timeline list ── */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column' }}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === STEPS.length - 1;
            return (
              <Box
                key={step.number}
                sx={{ display: 'flex', gap: 2, animation: `${fadeInUp} 0.6s ease-out ${0.1 + index * 0.15}s both` }}
              >
                {/* Left: icon badge + connector line */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LT} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${alpha(BLUE, 0.3)}`, flexShrink: 0,
                  }}>
                    <Icon sx={{ fontSize: 22, color: '#ffffff' }} />
                  </Box>
                  {!isLast && (
                    <Box sx={{
                      width: 2, flex: 1, minHeight: 28, my: 0.75,
                      background: `linear-gradient(180deg, ${alpha(BLUE, 0.35)}, ${alpha(BLUE_LT, 0.12)})`,
                      borderRadius: 1,
                    }} />
                  )}
                </Box>

                {/* Right: text */}
                <Box sx={{ pb: isLast ? 0 : 3.5, pt: 0.75 }}>
                  <Typography sx={{
                    fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.1em',
                    color: BLUE_LT, textTransform: 'uppercase', mb: 0.4,
                  }}>
                    Step {step.number}
                  </Typography>
                  <Typography sx={{
                    fontWeight: 700, fontSize: '1rem', color: '#ffffff',
                    mb: 0.5, lineHeight: 1.3,
                  }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{
                    color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', lineHeight: 1.65, fontWeight: 400,
                  }}>
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── TABLET / DESKTOP: horizontal cards ── */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'row', alignItems: 'stretch', gap: { sm: 2, md: 2.5 } }}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === STEPS.length - 1;
            return (
              <React.Fragment key={step.number}>

                {/* Step Card */}
                <Box sx={{
                  flex: 1, minWidth: 0, position: 'relative',
                  borderRadius: { sm: '14px', md: '20px' },
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
                  p: { sm: 2, md: 2.5 },
                  display: 'flex', flexDirection: 'column', gap: { sm: 1.5, md: 2.5 },
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease',
                  animation: `${fadeInUp} 0.7s ease-out ${0.15 + index * 0.15}s both`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    background: 'rgba(255,255,255,0.07)',
                    borderColor: 'rgba(66,165,245,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  },
                  '&::before': {
                    content: '""', position: 'absolute', top: 0, left: '16px', right: '16px',
                    height: '2px', borderRadius: '0 0 2px 2px',
                    background: 'rgba(66,165,245,0.4)',
                  },
                }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Typography sx={{
                      fontSize: { sm: '2.25rem', md: '3.5rem' }, fontWeight: 900, lineHeight: 1,
                      letterSpacing: '-0.04em',
                      background: `linear-gradient(135deg, ${alpha(BLUE, 0.18)} 0%, ${alpha(BLUE_LT, 0.1)} 100%)`,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text', userSelect: 'none',
                    }}>
                      {step.number}
                    </Typography>
                    <Box sx={{
                      width: { sm: 44, md: 56 }, height: { sm: 44, md: 56 },
                      borderRadius: { sm: '10px', md: '14px' },
                      background: 'rgba(25,118,210,0.14)',
                      border: '1px solid rgba(66,165,245,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon sx={{ fontSize: { sm: 22, md: 28 }, color: BLUE_LT }} />
                    </Box>
                  </Stack>

                  <Box>
                    <Typography variant="h6" sx={{
                      fontWeight: 700, fontSize: { sm: '0.9375rem', md: '1.125rem' },
                      color: '#ffffff', mb: 0.75, letterSpacing: '-0.01em', lineHeight: 1.3,
                    }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{
                      color: 'rgba(255,255,255,0.55)', fontSize: { sm: '0.8125rem', md: '0.9375rem' },
                      lineHeight: 1.6, fontWeight: 400,
                    }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Box>

                {/* Arrow connector */}
                {!isLast && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    animation: `${fadeInUp} 0.7s ease-out ${0.15 + index * 0.15 + 0.1}s both`,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <Box sx={{
                        width: { sm: 20, md: 28 }, height: '2px',
                        background: `linear-gradient(90deg, ${alpha(BLUE, 0.25)}, ${alpha(BLUE_LT, 0.4)})`,
                        borderRadius: '1px',
                      }} />
                      <ArrowForward sx={{ fontSize: { sm: 16, md: 20 }, color: alpha(BLUE, 0.45) }} />
                    </Box>
                  </Box>
                )}

              </React.Fragment>
            );
          })}
        </Box>

      </Container>
    </Box>
  );
};

export default HowItWorksSection;
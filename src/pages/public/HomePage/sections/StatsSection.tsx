import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import { COMPANY_STATS } from '../../../../data/info';
import AnimatedCounter from '../../../../components/ui/AnimatedCounter';

const StatsSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.05)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              letterSpacing: 1.5,
              mb: 1.5,
              display: 'block',
            }}
          >
            TRUSTED BY THOUSANDS
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            Numbers That Speak
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
              fontWeight: 400,
              px: { xs: 2, sm: 0 },
            }}
          >
            Join the growing community of restaurants transforming their business
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {COMPANY_STATS.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  textAlign: 'center',
                  height: '100%',
                  background: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: { xs: 2, md: 3 },
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${alpha(stat.color, 0.15)}`,
                    borderColor: stat.color,
                    '&::before': {
                      opacity: 1,
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.5)} 100%)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: { xs: 48, sm: 56, md: 64 },
                    height: { xs: 48, sm: 56, md: 64 },
                    borderRadius: '50%',
                    backgroundColor: alpha(stat.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: { xs: 2, md: 2.5 },
                    color: stat.color,
                  }}
                >
                  {React.createElement(stat.icon, { sx: { fontSize: { xs: 24, sm: 28, md: 32 } } })}
                </Box>

                {/* Counter */}
                <AnimatedCounter
                  end={stat.number}
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                  duration={2000}
                  delay={index * 200}
                  variant="h3"
                  color={stat.color}
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  }}
                />

                {/* Label */}
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    mt: 1,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsSection;
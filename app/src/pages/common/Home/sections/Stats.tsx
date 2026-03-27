import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
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

// Icon mapping for API string names to Material-UI components
const ICON_MAP: Record<string, any> = {
  restaurant: Restaurant,
  shopping_cart: ShoppingCart,
  people: People,
  menu_book: MenuBook,
  business: Business,
  thumb_up: ThumbUp,
  cloud_done: CloudDone,
};

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const StatsSection: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<HomePageStat[]>([...DEFAULT_STATS]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await homePageService.getStats();
        
        // If API returns data, convert icon strings to components
        if (data && data.length > 0) {
          const mergedStats = data.map((apiStat: any, index: number) => {
            // Convert icon string to component
            const iconComponent = typeof apiStat.icon === 'string' 
              ? ICON_MAP[apiStat.icon] || DEFAULT_STATS[index]?.icon
              : apiStat.icon;
            
            return {
              ...DEFAULT_STATS[index],
              ...apiStat,
              icon: iconComponent,
            };
          });
          setStats(mergedStats);
        } else {
          // Show 0 values if API returns empty array
          setStats([...DEFAULT_STATS]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Show 0 values if API fails - no fake data
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
        pt: { xs: 10, sm: 12, md: 16 },
        pb: { xs: 10, sm: 12, md: 16 },
        background: '#0f172a',
        position: 'relative',
        scrollMarginTop: { xs: '100px', sm: '110px', md: '120px' },
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${alpha('#ffffff', 0.05)} 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${alpha('#ffffff', 0.03)} 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${alpha('#ffffff', 0.02)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha('#ffffff', 0.02)} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: `2px solid ${alpha('#ffffff', 0.1)}`,
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: `2px solid ${alpha('#ffffff', 0.08)}`,
          animation: `${float} 8s ease-in-out infinite`,
          animationDelay: '2s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 8, md: 10 },
            animation: `${fadeInUp} 0.8s ease-out`,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              fontWeight: 800,
              mb: 2.5,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                background: `linear-gradient(90deg, transparent, #ffffff, transparent)`,
                borderRadius: 2,
              },
            }}
          >
            Platform Statistics
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: alpha('#ffffff', 0.8),
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
              fontWeight: 400,
              px: { xs: 2, sm: 0 },
              mt: 3,
              lineHeight: 1.7,
            }}
          >
            Real-time metrics from our platform
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={{ xs: 3, sm: 3, md: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 3.5, md: 4 },
                  textAlign: 'center',
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha('#ffffff', 0.08)} 0%, ${alpha('#ffffff', 0.04)} 100%)`,
                  border: `1px solid ${alpha('#ffffff', 0.1)}`,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `${fadeInUp} 0.8s ease-out ${0.2 + index * 0.1}s both`,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${alpha('#000000', 0.3)}`,
                    background: `linear-gradient(135deg, ${alpha('#ffffff', 0.12)} 0%, ${alpha('#ffffff', 0.06)} 100%)`,
                    borderColor: alpha('#ffffff', 0.2),
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.5)}, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: { xs: 56, sm: 64, md: 72 },
                    height: { xs: 56, sm: 64, md: 72 },
                    borderRadius: '50%',
                    backgroundColor: alpha('#ffffff', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: { xs: 2.5, md: 3 },
                    color: '#ffffff',
                    border: `2px solid ${alpha('#ffffff', 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(5deg)',
                      backgroundColor: alpha('#ffffff', 0.15),
                    },
                  }}
                >
                  {stat.icon && <stat.icon sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />}
                </Box>

                {/* Counter */}
                <AnimatedCounter
                  end={stat.number}
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                  duration={2000}
                  delay={index * 200}
                  variant="h3"
                  color="#ffffff"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    mb: 1,
                  }}
                />

                {/* Label */}
                <Typography
                  variant="body1"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                    letterSpacing: '0.5px',
                  }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Bottom Accent - Only show if we have real data */}
        {stats.some(stat => stat.number > 0) && (
          <Box
            sx={{
              mt: { xs: 8, md: 10 },
              textAlign: 'center',
              animation: `${fadeInUp} 0.8s ease-out 0.8s both`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: alpha('#ffffff', 0.6),
                fontSize: { xs: '0.875rem', md: '1rem' },
                fontWeight: 500,
                fontStyle: 'italic',
              }}
            >
              Live data from our platform
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default StatsSection;
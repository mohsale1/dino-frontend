import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import { MenuBook, QrCode, Dashboard, People } from '@mui/icons-material';
import { FeatureCard } from '../../../../components/home';

// Core features inline
const CORE_FEATURES = [
  {
    title: 'Digital Catalog',
    description: 'Beautiful, interactive digital catalogs for your products and services',
    icon: MenuBook,
    color: 'primary',
  },
  {
    title: 'Smart Ordering',
    description: 'Flexible ordering system supporting both manual and online orders',
    icon: QrCode,
    color: 'secondary',
  },
  {
    title: 'Real-time Management',
    description: 'Live order tracking and business management dashboard',
    icon: Dashboard,
    color: 'success',
  },
  {
    title: 'User-based Access',
    description: 'Role-based permissions and access control for team collaboration',
    icon: People,
    color: 'info',
  },
];

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

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const FeaturesSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 10, sm: 12, md: 16 },
        background: `linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)`,
        position: 'relative',
        width: '100%',
        scrollMarginTop: { xs: '100px', sm: '110px', md: '120px' },
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#0f172a', 0.03)} 0%, transparent 70%)`,
          animation: `${float} 8s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '-5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#0f172a', 0.04)} 0%, transparent 70%)`,
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '2s',
        }}
      />


      <Container 
        maxWidth="lg"
        disableGutters
        sx={{
          px: { xs: 2, sm: 3, md: 3 },
          pb: { xs: 3, sm: 0, md: 0 },
          position: 'relative',
          zIndex: 1,
        }}
      >
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
              color: '#0f172a',
              letterSpacing: '-0.02em',
              px: { xs: 1, sm: 0 },
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
                background: `linear-gradient(90deg, transparent, #0f172a, transparent)`,
                borderRadius: 2,
              },
            }}
          >
            Everything You Need to Succeed
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
              fontWeight: 400,
              lineHeight: 1.7,
              px: { xs: 2, sm: 0 },
              mt: 3,
            }}
          >
            Comprehensive tools designed for modern businesses to streamline operations and delight customers
          </Typography>
        </Box>

        {/* Feature Cards */}
        <Grid 
          container 
          spacing={{ xs: 3, sm: 3, md: 4 }}
        >
          {CORE_FEATURES.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={6}
              lg={3}
              key={index}
              sx={{
                animation: `${fadeInUp} 0.8s ease-out ${0.2 + index * 0.1}s both`,
              }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                delay={index * 100}
              />
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
};

export default FeaturesSection;
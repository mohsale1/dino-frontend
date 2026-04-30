import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  alpha,
  keyframes,
} from '@mui/material';
import { MenuBook, QrCode2, Dashboard, Business, People, BarChart } from '@mui/icons-material';
import { FeatureCard } from '../../../../components/home';

const CORE_FEATURES = [
  {
    title: 'Digital Catalog Management',
    description:
      'Build beautiful, interactive digital menus and product catalogs. Update items, prices, and availability in real-time without reprinting anything.',
    icon: MenuBook,
  },
  {
    title: 'QR Code Ordering',
    description:
      'Customers scan a QR code at their table or location and instantly browse your catalog. No app download required — works on any smartphone.',
    icon: QrCode2,
  },
  {
    title: 'Live Order Dashboard',
    description:
      'Monitor every order as it comes in. Track status from placed to fulfilled with real-time notifications and a clean management interface.',
    icon: Dashboard,
  },
  {
    title: 'Multi-Location Support',
    description:
      'Manage multiple branches, outlets, or service areas from one unified dashboard. Each location gets its own catalog and order stream.',
    icon: Business,
  },
  {
    title: 'Role-Based Access Control',
    description:
      'Assign staff roles with specific permissions. Managers, cashiers, and kitchen staff each see exactly what they need.',
    icon: People,
  },
  {
    title: 'Analytics & Insights',
    description:
      'Understand your business with revenue charts, peak hour analysis, best-selling items, and customer behavior reports.',
    icon: BarChart,
  },
];

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FeaturesSection: React.FC = () => {
  return (
    <Box
      id="features"
      sx={{
        py: { xs: 4, sm: 5, md: 6 },
        background: 'linear-gradient(160deg, #f8fafc 0%, #eff6ff 45%, #f0f9ff 75%, #f8fafc 100%)',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        scrollMarginTop: { xs: '64px', md: '70px' },
      }}
    >
      {/* Top border accent */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #1976D2 40%, #42A5F5 60%, transparent)',
          opacity: 0.4,
        }}
      />

      {/* Radial glow — top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '-5%',
          right: '-5%',
          width: { xs: '280px', md: '420px' },
          height: { xs: '280px', md: '420px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#1976D2', 0.07)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Radial glow — bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-5%',
          left: '-5%',
          width: { xs: '240px', md: '360px' },
          height: { xs: '240px', md: '360px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#42A5F5', 0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Dashed ring — top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '12%',
          right: '6%',
          width: { xs: '160px', md: '240px' },
          height: { xs: '160px', md: '240px' },
          borderRadius: '50%',
          border: `2px dashed ${alpha('#1976D2', 0.1)}`,
          pointerEvents: 'none',
        }}
      />

      {/* Dashed ring — bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '4%',
          width: { xs: '120px', md: '180px' },
          height: { xs: '120px', md: '180px' },
          borderRadius: '50%',
          border: `2px dashed ${alpha('#42A5F5', 0.1)}`,
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          px: { xs: 2, sm: 3, md: 3 },
          position: 'relative',
          zIndex: 1,
          pb: { xs: 1, sm: 0 },
        }}
      >
        {/* Section Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 3, md: 4 },
            animation: `${fadeInUp} 0.7s ease-out both`,
          }}
        >

          {/* Heading */}
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.625rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 800,
              mb: 1,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '48px',
                height: '3px',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, transparent, #1976D2, #42A5F5, transparent)',
              },
            }}
          >
            Everything You Need
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              color: '#64748b',
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
              fontWeight: 400,
              lineHeight: 1.7,
              px: { xs: 0.5, sm: 0 },
            }}
          >
            Comprehensive tools designed for modern businesses to streamline operations and delight customers.
          </Typography>
        </Box>

        {/* Feature Cards Grid */}
        <Grid
          container
          spacing={{ xs: 1.5, sm: 2, md: 2 }}
          alignItems="stretch"
        >
          {CORE_FEATURES.map((feature, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={feature.title}
              sx={{
                animation: `${fadeInUp} 0.7s ease-out ${0.15 + index * 0.1}s both`,
                display: 'flex',
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
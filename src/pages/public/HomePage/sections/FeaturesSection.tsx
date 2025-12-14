import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import { CORE_FEATURES } from '../../../../data/info';
import { FeatureCard } from '../Components';

const FeaturesSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 10, sm: 8, md: 10 },
        backgroundColor: 'background.default',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'visible',
        width: '100%',
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3, md: 3 },
        }}
      >
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 7 } }}>
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
            FEATURES
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              px: { xs: 1, sm: 0 },
            }}
          >
            Everything You Need to Succeed
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              px: { xs: 2, sm: 0 },
            }}
          >
            Comprehensive tools designed for modern restaurants to streamline operations and delight customers
          </Typography>
        </Box>

        {/* Feature Cards */}
        <Grid 
          container 
          spacing={{ xs: 3, sm: 2.5, md: 3 }}
          sx={{
            width: '100%',
            margin: 0,
            marginLeft: 0,
            marginRight: 0,
          }}
        >
          {CORE_FEATURES.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={index}
              sx={{
                display: 'flex',
                paddingLeft: { xs: 0, sm: '12px' },
                paddingRight: { xs: 0, sm: '12px' },
              }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                stats={feature.stats}
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

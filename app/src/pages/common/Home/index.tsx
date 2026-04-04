import React from 'react';
import { Box, Fab, Zoom, useScrollTrigger } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  TestimonialsSection,
  FAQSection,
  CTASection,
} from './sections';
import AppFooter from '../../../components/layout/AppFooter';

const HomePage: React.FC = () => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <AppFooter />

      {/* Scroll to Top Button */}
      <Zoom in={trigger}>
        <Fab
          onClick={scrollToTop}
          size="medium"
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 32 },
            right: { xs: 24, md: 32 },
            zIndex: 1000,
            backgroundColor: '#1976D2',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
            '&:hover': {
              backgroundColor: '#1565C0',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default HomePage;
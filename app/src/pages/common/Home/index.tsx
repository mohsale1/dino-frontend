import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  UseCasesSection,
  StatsSection,
  TestimonialsSection,
  FAQSection,
  CTASection,
} from './sections';
import AppFooter from '../../../components/layout/AppFooter';

const HomePage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('home-page');
    return () => { document.body.classList.remove('home-page'); };
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        overflowX: 'clip',
        overflowY: 'visible',
      }}
    >
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Use Cases Section */}
      <UseCasesSection />

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
    </Box>
  );
};

export default HomePage;

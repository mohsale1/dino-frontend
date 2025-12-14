
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import { TESTIMONIALS } from '../../../../data/info';
import { TestimonialCard } from '../Components';

const TestimonialsSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="testimonials"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: 1.5,
              mb: 1,
              display: 'block',
            }}
          >
            TESTIMONIALS
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
          >
            Loved by Restaurant Owners
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            See what our customers have to say about their experience with Dino
          </Typography>
        </Box>

        {/* Testimonial Cards */}
        <Grid container spacing={4}>
          {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <TestimonialCard
                name={testimonial.name}
                role={testimonial.role}
                restaurant={testimonial.restaurant}
                rating={testimonial.rating}
                comment={testimonial.comment}
                avatar={testimonial.avatar}
                delay={index * 100}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;


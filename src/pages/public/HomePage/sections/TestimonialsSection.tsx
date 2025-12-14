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
          maxWidth: '100%',
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
            TESTIMONIALS
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
            Loved by Restaurant Owners
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
            See what our customers have to say about their experience with Dino
          </Typography>
        </Box>

        {/* Testimonial Cards */}
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
          {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
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
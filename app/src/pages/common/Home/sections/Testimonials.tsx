import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  alpha,
  keyframes,
  CircularProgress,
} from '@mui/material';
import { FormatQuote } from '@mui/icons-material';
import { TestimonialCard } from '../../../../components/home';
import { homePageService, Testimonial } from '../../../../services/api/homePage';

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
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
`;

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const data = await homePageService.getTestimonials(3);
        
        // Use API data (backend now has default testimonials)
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          py: { xs: 10, sm: 12, md: 16 },
          background: `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render section if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <Box
      id="testimonials"
      sx={{
        py: { xs: 10, sm: 12, md: 16 },
        background: `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`,
        position: 'relative',
        width: '100%',
        scrollMarginTop: { xs: '100px', sm: '110px', md: '120px' },
        overflow: 'hidden',
      }}
    >
      {/* Decorative Quote Icons */}
      <FormatQuote
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          fontSize: { xs: 80, md: 120 },
          color: alpha('#0f172a', 0.03),
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <FormatQuote
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          fontSize: { xs: 100, md: 150 },
          color: alpha('#0f172a', 0.02),
          animation: `${float} 8s ease-in-out infinite`,
          animationDelay: '2s',
          transform: 'rotate(180deg)',
        }}
      />

      {/* Decorative Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: `2px dashed ${alpha('#0f172a', 0.08)}`,
          animation: `${pulse} 4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          border: `2px dashed ${alpha('#0f172a', 0.06)}`,
          animation: `${pulse} 5s ease-in-out infinite`,
          animationDelay: '1s',
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
            Loved by Business Owners
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
            See what our customers have to say about their experience with Dino
          </Typography>
        </Box>

        {/* Testimonial Cards */}
        <Grid 
          container 
          spacing={{ xs: 3, sm: 3, md: 4 }}
        >
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={index}
              sx={{
                animation: `${fadeInUp} 0.8s ease-out ${0.2 + index * 0.1}s both`,
              }}
            >
              <TestimonialCard
                name={testimonial.name}
                role={testimonial.role}
                restaurant={testimonial.restaurant}
                location={testimonial.location}
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
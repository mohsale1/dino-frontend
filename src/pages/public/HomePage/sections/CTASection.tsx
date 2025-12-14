import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  alpha,
  Grid,
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { COMPANY_INFO } from '../../../../data/info';

const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const contactMethods = [
    {
      icon: <Phone sx={{ fontSize: 14 }} />,
      title: 'Call Us',
      value: COMPANY_INFO.contact.phone.primary,
      action: `tel:${COMPANY_INFO.contact.phone.primary.replace(/\s/g, '')}`,
    },
    {
      icon: <Email sx={{ fontSize: 14 }} />,
      title: 'Email Us',
      value: COMPANY_INFO.contact.email.primary,
      action: `mailto:${COMPANY_INFO.contact.email.primary}`,
    },
    {
      icon: <LocationOn sx={{ fontSize: 14 }} />,
      title: 'Visit Us',
      value: COMPANY_INFO.contact.address.full,
      action: null,
    },
  ];

  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.main} 0%, 
          ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha('#fff', 0.2)} 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, ${alpha('#fff', 0.2)} 0%, transparent 50%)`,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="overline"
              sx={{
                color: alpha('#fff', 0.9),
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: 1.5,
                mb: 2,
                display: 'block',
              }}
            >
              GET STARTED TODAY
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                mb: 3,
                color: 'white',
              }}
            >
              Ready to Transform Your Restaurant?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: alpha('#fff', 0.9),
                mb: 4,
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Join hundreds of restaurants already using Dino to streamline operations and delight customers
            </Typography>

            {/* CTA Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {user ? (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/admin')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.9),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.9),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      borderWidth: 2,
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: alpha('#fff', 0.1),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Stack>
          </Grid>

          {/* Right Content - Contact Methods */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {contactMethods.map((method, index) => (
                <Box
                  key={index}
                  onClick={() => method.action && window.open(method.action, '_blank')}
                  sx={{
                    p: 3,
                    backgroundColor: alpha('#fff', 0.1),
                    borderRadius: 2,
                    border: `1px solid ${alpha('#fff', 0.2)}`,
                    cursor: method.action ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    '&:hover': method.action
                      ? {
                          backgroundColor: alpha('#fff', 0.15),
                          transform: 'translateX(8px)',
                          borderColor: alpha('#fff', 0.3),
                        }
                      : {},
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: alpha('#fff', 0.2),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {method.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: alpha('#fff', 0.8),
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {method.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'white',
                          fontWeight: 500,
                        }}
                      >
                        {method.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CTASection;


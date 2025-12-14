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
      icon: <Phone sx={{ fontSize: { xs: 20, md: 24 } }} />,
      title: 'Call Us',
      value: COMPANY_INFO.contact.phone.primary,
      action: `tel:${COMPANY_INFO.contact.phone.primary.replace(/\s/g, '')}`,
    },
    {
      icon: <Email sx={{ fontSize: { xs: 20, md: 24 } }} />,
      title: 'Email Us',
      value: COMPANY_INFO.contact.email.primary,
      action: `mailto:${COMPANY_INFO.contact.email.primary}`,
    },
    {
      icon: <LocationOn sx={{ fontSize: { xs: 20, md: 24 } }} />,
      title: 'Visit Us',
      value: COMPANY_INFO.contact.address.full,
      action: null,
    },
  ];

  return (
    <Box
      id="contact"
      sx={{
        pt: { xs: 10, sm: 12, md: 16 },
        pb: { xs: 8, sm: 10, md: 12 },
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
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="overline"
              sx={{
                color: alpha('#fff', 0.9),
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                letterSpacing: 1.5,
                mb: 1.5,
                display: 'block',
              }}
            >
              GET STARTED TODAY
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                fontWeight: 700,
                mb: 2.5,
                color: 'white',
              }}
            >
              Ready to Transform Your Restaurant?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: alpha('#fff', 0.9),
                mb: 3,
                fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
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
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: 'none',
                    minHeight: { xs: 44, sm: 48 },
                    backgroundColor: 'white',
                    color: 'primary.main',
                    boxShadow: `0 8px 24px ${alpha('#000', 0.15)}`,
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.95),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${alpha('#000', 0.25)}`,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.25, sm: 1.5 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      minHeight: { xs: 44, sm: 48 },
                      backgroundColor: 'white',
                      color: 'primary.main',
                      boxShadow: `0 8px 24px ${alpha('#000', 0.15)}`,
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.95),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 32px ${alpha('#000', 0.25)}`,
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.25, sm: 1.5 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      minHeight: { xs: 44, sm: 48 },
                      borderWidth: 2,
                      borderColor: 'white',
                      color: 'white',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: alpha('#fff', 0.15),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 20px ${alpha('#000', 0.2)}`,
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {contactMethods.map((method, index) => (
                <Box
                  key={index}
                  onClick={() => method.action && window.open(method.action, '_blank')}
                  sx={{
                    p: { xs: 1.5, md: 2 },
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
                  <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 40, md: 48 },
                        height: { xs: 40, md: 48 },
                        borderRadius: '50%',
                        backgroundColor: alpha('#fff', 0.2),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {method.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: alpha('#fff', 0.8),
                          fontWeight: 600,
                          mb: 0.5,
                          fontSize: { xs: '0.8125rem', md: '0.875rem' },
                        }}
                      >
                        {method.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'white',
                          fontWeight: 500,
                          fontSize: { xs: '0.875rem', md: '0.9375rem' },
                          wordBreak: 'break-word',
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
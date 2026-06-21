import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/common/Auth';
import { homePageService } from '../../../../services/api/homePage';
import { APP_CONFIG } from '../../../../constants/app';

// Default company info (fallback)
const DEFAULT_COMPANY_INFO = {
  name: APP_CONFIG.NAME,
  email: APP_CONFIG.CONTACT_EMAIL,
  phone: APP_CONFIG.SUPPORT_PHONE,
  address: '',
};

const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        const data = await homePageService.getContactInfo();
        setContactInfo(data);
      } catch (error) {
        
        setContactInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Build contact methods from API data or fallback
  const getContactMethods = () => {
    if (!contactInfo) {
      return [
        {
          icon: <Phone sx={{ fontSize: { xs: 20, md: 22 } }} />,
          title: 'Call Us',
          value: DEFAULT_COMPANY_INFO.phone,
          action: `tel:${DEFAULT_COMPANY_INFO.phone.replace(/\s/g, '')}`,
        },
        {
          icon: <Email sx={{ fontSize: { xs: 20, md: 22 } }} />,
          title: 'Email Us',
          value: DEFAULT_COMPANY_INFO.email,
          action: `mailto:${DEFAULT_COMPANY_INFO.email}`,
        },
        {
          icon: <LocationOn sx={{ fontSize: { xs: 20, md: 22 } }} />,
          title: 'Visit Us',
          value: DEFAULT_COMPANY_INFO.address,
          action: null,
        },
      ];
    }

    const methods = [];

    // Phone
    if (contactInfo.phone) {
      methods.push({
        icon: <Phone sx={{ fontSize: { xs: 20, md: 22 } }} />,
        title: 'Call Us',
        value: contactInfo.phone,
        action: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
      });
    }

    // Email
    if (contactInfo.email) {
      methods.push({
        icon: <Email sx={{ fontSize: { xs: 20, md: 22 } }} />,
        title: 'Email Us',
        value: contactInfo.email,
        action: `mailto:${contactInfo.email}`,
      });
    }

    // Address
    const addressParts = [];
    if (contactInfo.address) addressParts.push(contactInfo.address);
    if (contactInfo.city) addressParts.push(contactInfo.city);
    if (contactInfo.state) addressParts.push(contactInfo.state);
    if (contactInfo.postal_code) addressParts.push(contactInfo.postal_code);
    if (contactInfo.country) addressParts.push(contactInfo.country);

    if (addressParts.length > 0) {
      methods.push({
        icon: <LocationOn sx={{ fontSize: { xs: 20, md: 22 } }} />,
        title: 'Visit Us',
        value: addressParts.join(', '),
        action: null,
      });
    }

    return methods.length > 0
      ? methods
      : [
          {
            icon: <Email sx={{ fontSize: { xs: 20, md: 22 } }} />,
            title: 'Contact Us',
            value: 'Contact information not available',
            action: null,
          },
        ];
  };

  const contactMethods = getContactMethods();

  return (
    <Box
      id="cta"
      sx={{
        py: { xs: 5, sm: 6, md: 8 },
        background: 'linear-gradient(135deg, #0b1120 0%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: { xs: '64px', md: '70px' },
      }}
    >
      {/* Dot-grid texture overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }}
      />

      {/* Top-left blue glow blob */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: { xs: 320, md: 520 },
          height: { xs: 320, md: 520 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#1976D2', 0.12)} 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom-right blue glow blob */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-8%',
          width: { xs: 280, md: 460 },
          height: { xs: 280, md: 460 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#42A5F5', 0.08)} 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 3 },
        }}
      >
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left panel */}
          <Grid item xs={12} md={6}>

            {/* Heading */}
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.625rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                mb: 2,
              }}
            >
              Ready to Transform Your Business?
            </Typography>

            {/* Subtext */}
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: { xs: '1rem', md: '1.125rem' },
                fontWeight: 400,
                lineHeight: 1.7,
                mb: 3,
              }}
            >
              Join businesses already using {APP_CONFIG.NAME} to streamline operations and
              delight customers
            </Typography>

            {/* CTA Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {user ? (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/admin/dashboard')}
                  sx={{
                    px: { xs: 4, sm: 5 },
                    py: { xs: 1.5, sm: 1.75 },
                    fontSize: { xs: '1rem', sm: '1.0625rem' },
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    minHeight: { xs: 50, sm: 54 },
                    backgroundColor: '#1976D2',
                    color: '#ffffff',
                    boxShadow: '0 4px 20px rgba(25,118,210,0.4)',
                    '&:hover': {
                      backgroundColor: '#1565C0',
                      boxShadow: '0 8px 28px rgba(25,118,210,0.5)',
                      transform: 'translateY(-2px)',
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
                      px: { xs: 4, sm: 5 },
                      py: { xs: 1.5, sm: 1.75 },
                      fontSize: { xs: '1rem', sm: '1.0625rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      minHeight: { xs: 50, sm: 54 },
                      backgroundColor: '#1976D2',
                      color: '#ffffff',
                      boxShadow: '0 4px 20px rgba(25,118,210,0.4)',
                      '&:hover': {
                        backgroundColor: '#1565C0',
                        boxShadow: '0 8px 28px rgba(25,118,210,0.5)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    Start Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      px: { xs: 4, sm: 5 },
                      py: { xs: 1.5, sm: 1.75 },
                      fontSize: { xs: '1rem', sm: '1.0625rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      minHeight: { xs: 50, sm: 54 },
                      borderColor: 'rgba(255,255,255,0.35)',
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.7)',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: '#ffffff',
                        transform: 'translateY(-2px)',
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

          {/* Right panel — contact cards */}
          <Grid item xs={12} md={6}>
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 200,
                }}
              >
                <CircularProgress sx={{ color: '#42A5F5' }} />
              </Box>
            ) : (
              <Stack spacing={{ xs: 2, md: 2.5 }}>
                {contactMethods.map((method, index) => (
                  <Box
                    key={index}
                    onClick={() =>
                      method.action && window.open(method.action, '_self')
                    }
                    sx={{
                      p: { xs: 2, md: 2.5 },
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderRadius: 3,
                      border: '1px solid rgba(25,118,210,0.15)',
                      cursor: method.action ? 'pointer' : 'default',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      ...(method.action && {
                        '&:hover': {
                          backgroundColor: 'rgba(25,118,210,0.08)',
                          borderColor: 'rgba(25,118,210,0.35)',
                          transform: 'translateX(6px)',
                        },
                      }),
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={{ xs: 2, md: 2.5 }}
                      alignItems="center"
                    >
                      {/* Icon circle */}
                      <Box
                        sx={{
                          width: { xs: 48, md: 56 },
                          height: { xs: 48, md: 56 },
                          borderRadius: '50%',
                          backgroundColor: 'rgba(25,118,210,0.15)',
                          border: '1px solid rgba(25,118,210,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#42A5F5',
                          flexShrink: 0,
                        }}
                      >
                        {method.icon}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Title label */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'rgba(255,255,255,0.45)',
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: { xs: '0.8125rem', md: '0.875rem' },
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {method.title}
                        </Typography>

                        {/* Value text */}
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 500,
                            fontSize: { xs: '0.9375rem', md: '1rem' },
                            wordBreak: 'break-word',
                            lineHeight: 1.5,
                          }}
                        >
                          {method.value}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CTASection;
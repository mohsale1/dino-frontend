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

// Default company info (fallback)
const DEFAULT_COMPANY_INFO = {
  name: 'Dino',
  email: 'contact@dino-order.com',
  phone: '+1 (555) 123-4567',
  address: '123 Business St, Suite 100, City, State 12345',
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
        console.error('Error fetching contact info:', error);
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

    return methods.length > 0 ? methods : [
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
      id="contact"
      sx={{
        pt: { xs: 10, sm: 12, md: 14 },
        pb: { xs: 10, sm: 12, md: 14 },
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: { xs: '100px', sm: '110px', md: '120px' },
        borderTop: '1px solid #e2e8f0',
      }}
    >
      {/* Subtle Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.4,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${alpha('#0f172a', 0.04)} 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${alpha('#0f172a', 0.03)} 0%, transparent 50%)
          `,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="overline"
              sx={{
                color: '#0f172a',
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
                fontSize: { xs: '1.875rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                mb: 2.5,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Transform Your Business?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                mb: 3.5,
                fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Join hundreds of businesses already using Dino to streamline operations and delight customers
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
                    backgroundColor: '#0f172a',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                    '&:hover': {
                      backgroundColor: '#1e293b',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
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
                      backgroundColor: '#0f172a',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                      '&:hover': {
                        backgroundColor: '#1e293b',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
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
                      borderWidth: 1.5,
                      borderColor: '#cbd5e1',
                      color: '#475569',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: '#0f172a',
                        backgroundColor: alpha('#0f172a', 0.04),
                        color: '#0f172a',
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

          {/* Right Content - Contact Methods */}
          <Grid item xs={12} md={6}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={{ xs: 2, md: 2.5 }}>
                {contactMethods.map((method, index) => (
                <Box
                  key={index}
                  onClick={() => method.action && window.open(method.action, '_self')}
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    backgroundColor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    cursor: method.action ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    '&:hover': method.action
                      ? {
                          backgroundColor: '#ffffff',
                          transform: 'translateX(6px)',
                          borderColor: '#cbd5e1',
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                        }
                      : {},
                  }}
                >
                  <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 44, md: 52 },
                        height: { xs: 44, md: 52 },
                        borderRadius: '50%',
                        backgroundColor: alpha('#0f172a', 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f172a',
                        flexShrink: 0,
                      }}
                    >
                      {method.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: '#64748b',
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
                          color: '#0f172a',
                          fontWeight: 500,
                          fontSize: { xs: '0.9375rem', md: '1rem' },
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
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CTASection;
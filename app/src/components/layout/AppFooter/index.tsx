import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  alpha,
} from '@mui/material';
import {
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import DinoLogo from '../../ui/DinoLogo';
import { homePageService } from '../../../services/api/homePage';

// Default company info
const DEFAULT_COMPANY_INFO = {
  name: 'Dino',
  description: 'Streamline operations with digital catalogs and intelligent order management',
  socialMedia: [
    { icon: 'Twitter' },
    { icon: 'Facebook' },
    { icon: 'Instagram' },
    { icon: 'LinkedIn' },
  ],
};

interface AppFooterProps {
  variant?: 'default' | 'minimal';
}

const AppFooter: React.FC<AppFooterProps> = ({ variant = 'default' }) => {
  const currentYear = new Date().getFullYear();
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

    if (variant === 'default') {
      fetchContactInfo();
    }
  }, [variant]);

  if (variant === 'minimal') {
    return (
      <Box
        component="footer"
        sx={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          py: 3,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <DinoLogo size={20} animated={false} />
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              Â© {currentYear} {DEFAULT_COMPANY_INFO.name}. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const socialIconMap: Record<string, React.ComponentType> = {
    Twitter,
    Facebook,
    Instagram,
    LinkedIn,
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0f172a',
        color: 'white',
        py: { xs: 6, md: 8 },
        mt: 'auto',
        borderTop: '1px solid #1e293b',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <DinoLogo size={32} animated={false} />
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                {DEFAULT_COMPANY_INFO.name}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.7, color: '#cbd5e1' }}>
              {DEFAULT_COMPANY_INFO.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {DEFAULT_COMPANY_INFO.socialMedia.map((social, index) => (
                <IconButton
                  key={index}
                  size="small"
                  sx={{
                    color: '#cbd5e1',
                    backgroundColor: alpha('#ffffff', 0.05),
                    border: '1px solid #334155',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.15),
                      borderColor: '#ffffff',
                      color: '#ffffff',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {React.createElement(socialIconMap[social.icon])}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5, fontSize: '1rem', color: 'white' }}>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'Features', href: '#features' },
                { label: 'Stats', href: '#stats' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'FAQ', href: '#faq' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  color="inherit"
                  underline="none"
                  sx={{
                    opacity: 0.8,
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 1,
                      color: '#ffffff',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5, fontSize: '1rem', color: 'white' }}>
              Contact Us
            </Typography>
            {!loading && contactInfo ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {contactInfo.email && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Email sx={{ fontSize: 18, color: '#cbd5e1', mt: 0.3 }} />
                    <Link
                      href={`mailto:${contactInfo.email}`}
                      color="inherit"
                      underline="none"
                      sx={{
                        opacity: 0.8,
                        color: '#cbd5e1',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          opacity: 1,
                          color: '#ffffff',
                        },
                      }}
                    >
                      {contactInfo.email}
                    </Link>
                  </Box>
                )}
                {contactInfo.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Phone sx={{ fontSize: 18, color: '#cbd5e1', mt: 0.3 }} />
                    <Link
                      href={`tel:${contactInfo.phone}`}
                      color="inherit"
                      underline="none"
                      sx={{
                        opacity: 0.8,
                        color: '#cbd5e1',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          opacity: 1,
                          color: '#ffffff',
                        },
                      }}
                    >
                      {contactInfo.phone}
                    </Link>
                  </Box>
                )}
                {(contactInfo.address || contactInfo.city) && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <LocationOn sx={{ fontSize: 18, color: '#cbd5e1', mt: 0.3 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.8,
                        color: '#cbd5e1',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {contactInfo.address && `${contactInfo.address}, `}
                      {contactInfo.city && `${contactInfo.city}`}
                      {contactInfo.state && `, ${contactInfo.state}`}
                      {contactInfo.postal_code && ` ${contactInfo.postal_code}`}
                      {contactInfo.country && (
                        <>
                          <br />
                          {contactInfo.country}
                        </>
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" sx={{ opacity: 0.6, color: '#cbd5e1', fontSize: '0.875rem' }}>
                  {loading ? 'Loading contact information...' : 'Contact information not available'}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#334155' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7, color: '#94a3b8', fontSize: '0.875rem' }}>
            Â© {currentYear} {DEFAULT_COMPANY_INFO.name}. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, color: '#94a3b8', fontSize: '0.875rem' }}>
            Made with love for modern businesses
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AppFooter;
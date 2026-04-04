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
  ChevronRight,
} from '@mui/icons-material';
import DinoLogo from '../../ui/DinoLogo';
import { homePageService } from '../../../services/api/homePage';

const DEFAULT_COMPANY_INFO = {
  name: 'Dino',
  description:
    'Streamline your restaurant operations with digital catalogs, smart menus, and intelligent order management built for modern businesses.',
  socialMedia: [
    { icon: 'Twitter' },
    { icon: 'Facebook' },
    { icon: 'Instagram' },
    { icon: 'LinkedIn' },
  ],
};

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Stats', href: '#stats' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <DinoLogo size={20} animated={false} />
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              © {currentYear} {DEFAULT_COMPANY_INFO.name}. All rights reserved.
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
        backgroundColor: '#0b1120',
        color: 'white',
        py: { xs: 8, md: 10 },
        mt: 'auto',
        borderTop: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blue top accent line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background:
            'linear-gradient(90deg, transparent, #1976D2 30%, #42A5F5 70%, transparent)',
          opacity: 0.5,
        }}
      />

      {/* Dot-grid texture overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }}
      />

      {/* Glow blob — top-right */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(25,118,210,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Glow blob — bottom-left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66,165,245,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, sm: 3, md: 3 }, position: 'relative' }}>
        <Grid container spacing={{ xs: 5, md: 6 }}>

          {/* Column 1 — Brand */}
          <Grid item xs={12} sm={6} md={4}>
            {/* Logo + name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
              <DinoLogo size={34} animated={false} />
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: '#ffffff', lineHeight: 1 }}
              >
                {DEFAULT_COMPANY_INFO.name}
              </Typography>
            </Box>

            {/* Tagline */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'rgba(255,255,255,0.45)',
                mb: 2.5,
                pl: '50px', // align under name (logo 34 + gap ~16)
              }}
            >
              Smart Ordering Solutions
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                lineHeight: 1.75,
                mb: 3,
              }}
            >
              {DEFAULT_COMPANY_INFO.description}
            </Typography>

            {/* Social icons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {DEFAULT_COMPANY_INFO.socialMedia.map((social, index) => (
                <IconButton
                  key={index}
                  size="small"
                  sx={{
                    color: '#64748b',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid #1e293b',
                    borderRadius: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#42A5F5',
                      backgroundColor: alpha('#1976D2', 0.12),
                      borderColor: 'rgba(25,118,210,0.3)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {React.createElement(socialIconMap[social.icon])}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Column 2 — Platform links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mb: 2.5,
              }}
            >
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {NAV_LINKS.map((item) => (
                <Box
                  key={item.label}
                  component="a"
                  href={item.href}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    '& .link-arrow': {
                      opacity: 0.3,
                      transition: 'opacity 0.2s ease',
                    },
                    '&:hover': {
                      color: '#42A5F5',
                      transform: 'translateX(4px)',
                      '& .link-arrow': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <ChevronRight
                    className="link-arrow"
                    sx={{ fontSize: 14, color: 'inherit' }}
                  />
                  {item.label}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Column 3 — Contact */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mb: 2.5,
              }}
            >
              Contact
            </Typography>

            {loading ? (
              <Typography
                variant="body2"
                sx={{ color: '#334155', fontSize: '0.875rem' }}
              >
                Loading...
              </Typography>
            ) : contactInfo ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {contactInfo.email && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Email
                      sx={{ fontSize: 16, color: '#1976D2', mt: 0.25, flexShrink: 0 }}
                    />
                    <Link
                      href={`mailto:${contactInfo.email}`}
                      underline="none"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        transition: 'color 0.2s ease',
                        '&:hover': { color: '#42A5F5' },
                      }}
                    >
                      {contactInfo.email}
                    </Link>
                  </Box>
                )}
                {contactInfo.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Phone
                      sx={{ fontSize: 16, color: '#1976D2', mt: 0.25, flexShrink: 0 }}
                    />
                    <Link
                      href={`tel:${contactInfo.phone}`}
                      underline="none"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        transition: 'color 0.2s ease',
                        '&:hover': { color: '#42A5F5' },
                      }}
                    >
                      {contactInfo.phone}
                    </Link>
                  </Box>
                )}
                {(contactInfo.address || contactInfo.city) && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <LocationOn
                      sx={{ fontSize: 16, color: '#1976D2', mt: 0.25, flexShrink: 0 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
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
              <Typography
                variant="body2"
                sx={{ color: '#334155', fontSize: '0.875rem' }}
              >
                Contact information not available.
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ borderColor: '#1e293b', my: { xs: 4, md: 5 } }} />

        {/* Bottom bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#475569', fontSize: '0.8125rem' }}
          >
            © {currentYear} Dino. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
            ].map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && (
                  <Typography
                    component="span"
                    sx={{ color: '#334155', fontSize: '0.8125rem', userSelect: 'none' }}
                  >
                    ·
                  </Typography>
                )}
                <Link
                  href={item.href}
                  underline="none"
                  sx={{
                    color: '#475569',
                    fontSize: '0.8125rem',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: '#42A5F5' },
                  }}
                >
                  {item.label}
                </Link>
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AppFooter;
import React from 'react';
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
} from '@mui/icons-material';
import { 
  COMPANY_INFO, 
} from '../../../data/info';
import DinoLogo from '../../ui/DinoLogo';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <Box
        component="footer"
        sx={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
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
              © {currentYear} {COMPANY_INFO.name}. All rights reserved.
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
                {COMPANY_INFO.name}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.7, color: '#cbd5e1' }}>
              {COMPANY_INFO.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {COMPANY_INFO.socialMedia.map((social, index) => (
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
                    } 
                  }}
                >
                  {React.createElement(socialIconMap[social.icon])}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5, fontSize: '1rem', color: 'white' }}>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href="#"
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
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5, fontSize: '1rem', color: 'white' }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Documentation', 'Support', 'Blog', 'FAQ'].map((item) => (
                <Link
                  key={item}
                  href="#"
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
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5, fontSize: '1rem', color: 'white' }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <Link
                  key={item}
                  href="#"
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
                  {item}
                </Link>
              ))}
            </Box>
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
            © {currentYear} {COMPANY_INFO.name}. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, color: '#94a3b8', fontSize: '0.875rem' }}>
            Made with ❤️ for modern businesses
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
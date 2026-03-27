import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Home,
  ArrowBack,
  SearchOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';

// Subtle, professional animations
const float = keyframes`
  0%, 100% { 
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-10px); 
  }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const NotFoundPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 3 },
      }}
    >
      {/* Subtle background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${alpha('#0f172a', 0.02)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha('#0f172a', 0.02)} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />

      {/* Subtle gradient orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: { xs: 300, md: 500 },
          height: { xs: 300, md: 500 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#0f172a', 0.03)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: `${float} 20s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: { xs: 250, md: 400 },
          height: { xs: 250, md: 400 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#64748b', 0.04)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: `${float} 25s ease-in-out infinite 5s`,
        }}
      />

      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* 404 Number - Professional and Clean */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '7rem', sm: '10rem', md: '14rem' },
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              mb: 3,
              opacity: 0.95,
              animation: `${fadeInUp} 0.8s ease-out`,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: { xs: 60, md: 80 },
                height: 4,
                background: `linear-gradient(90deg, transparent, #0f172a, transparent)`,
                borderRadius: 2,
              },
            }}
          >
            404
          </Typography>

          {/* Title */}
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            fontWeight="700"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              lineHeight: 1.3,
              mb: 2,
              letterSpacing: '-0.02em',
              color: '#0f172a',
              animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
            }}
          >
            Page Not Found
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem' },
              lineHeight: 1.7,
              maxWidth: 500,
              mx: 'auto',
              mb: 5,
              color: '#64748b',
              animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
            }}
          >
            The page you're looking for doesn't exist or has been moved.
            Please check the URL or navigate back to continue.
          </Typography>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{
              animation: `${fadeInUp} 0.8s ease-out 0.8s both`,
              mb: { xs: 4, md: 6 },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleGoHome}
              size="large"
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
                px: 3,
                fontSize: '1rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#1e293b',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {isAuthenticated ? 'Dashboard' : 'Homepage'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              size="large"
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
                px: 3,
                fontSize: '1rem',
                borderWidth: 1.5,
                borderColor: alpha('#0f172a', 0.2),
                color: '#0f172a',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderWidth: 1.5,
                  borderColor: '#0f172a',
                  backgroundColor: alpha('#0f172a', 0.04),
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Go Back
            </Button>
          </Stack>

          {/* Helpful Links */}
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: `1px solid ${alpha('#0f172a', 0.08)}`,
              animation: `${fadeIn} 1s ease-out 1s both`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                mb: 2,
              }}
            >
              Need help? Try these popular pages:
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ gap: 1 }}
            >
              {isAuthenticated ? (
                <>
                  <Button
                    size="small"
                    onClick={() => navigate('/admin/dashboard')}
                    sx={{
                      textTransform: 'none',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      '&:hover': { color: '#0f172a', backgroundColor: alpha('#0f172a', 0.04) },
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    size="small"
                    onClick={() => navigate('/admin/catalog')}
                    sx={{
                      textTransform: 'none',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      '&:hover': { color: '#0f172a', backgroundColor: alpha('#0f172a', 0.04) },
                    }}
                  >
                    Catalog
                  </Button>
                  <Button
                    size="small"
                    onClick={() => navigate('/admin/orders')}
                    sx={{
                      textTransform: 'none',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      '&:hover': { color: '#0f172a', backgroundColor: alpha('#0f172a', 0.04) },
                    }}
                  >
                    Orders
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="small"
                    onClick={() => navigate('/')}
                    sx={{
                      textTransform: 'none',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      '&:hover': { color: '#0f172a', backgroundColor: alpha('#0f172a', 0.04) },
                    }}
                  >
                    Home
                  </Button>
                  <Button
                    size="small"
                    onClick={() => navigate('/login')}
                    sx={{
                      textTransform: 'none',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      '&:hover': { color: '#0f172a', backgroundColor: alpha('#0f172a', 0.04) },
                    }}
                  >
                    Login
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
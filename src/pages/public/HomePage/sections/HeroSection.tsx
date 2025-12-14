import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  PlayArrow,
  AutoAwesome,
  TrendingUp,
  Speed,
  Security,
  Restaurant,
  QrCode2,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    { icon: <TrendingUp sx={{ fontSize: 16 }} />, text: '3x Faster Orders' },
    { icon: <Speed sx={{ fontSize: 16 }} />, text: 'Real-time Updates' },
    { icon: <Security sx={{ fontSize: 16 }} />, text: 'Secure & Reliable' },
  ];

  return (
    <Box
      id="hero"
      sx={{
        position: 'relative',
        minHeight: { xs: 'auto', md: '100vh' },
        height: { xs: 'auto', md: '100vh' },
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        pt: { xs: 10, sm: 12, md: 0 },
        pb: { xs: 6, sm: 8, md: 0 },
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.05)} 0%, 
          ${alpha(theme.palette.background.default, 1)} 50%,
          ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}
    >
      {/* Professional Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.5,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)
          `,
        }}
      />

      {/* Decorative Geometric Shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          opacity: 0.2,
        }}
      >
        {/* Top Right Circle */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: { xs: '400px', md: '600px' },
            height: { xs: '400px', md: '600px' },
            borderRadius: '50%',
            border: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            },
          }}
        />

        {/* Bottom Left Circle */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: { xs: '500px', md: '700px' },
            height: { xs: '500px', md: '700px' },
            borderRadius: '50%',
            border: `3px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70%',
              height: '70%',
              borderRadius: '50%',
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
            },
          }}
        />

        {/* Floating Icons */}
        <Restaurant
          sx={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            fontSize: { xs: 50, md: 70 },
            color: theme.palette.primary.main,
            opacity: 0.25,
          }}
        />
        <QrCode2
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '12%',
            fontSize: { xs: 45, md: 60 },
            color: theme.palette.secondary.main,
            opacity: 0.25,
          }}
        />
        <DashboardIcon
          sx={{
            position: 'absolute',
            top: '60%',
            left: '15%',
            fontSize: { xs: 40, md: 55 },
            color: theme.palette.primary.main,
            opacity: 0.25,
          }}
        />
      </Box>
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2, 
          py: { xs: 0, sm: 0, md: 8 },
          px: { xs: 2, sm: 3, md: 3 },
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
              {/* Badge */}
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, width: '100%' }}>
                <Chip
                  icon={isMobile ? undefined : <AutoAwesome sx={{ fontSize: 18 }} />}
                  label={isMobile ? "500+ Restaurants" : "Trusted by 500+ Restaurants"}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    height: { xs: 30, sm: 32, md: 36 },
                    px: { xs: 1.5, sm: 1.5 },
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    '& .MuiChip-icon': {
                      color: 'primary.main',
                      marginLeft: '8px',
                    },
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1 },
                    },
                  }}
                />
              </Box>

              {/* Main Heading */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem', lg: '4.5rem' },
                  fontWeight: 900,
                  lineHeight: 1.15,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: { xs: 2, md: 2.5 },
                  letterSpacing: '-0.02em',
                  px: { xs: 1, sm: 0 },
                  width: '100%',
                }}
              >
                Revolutionize Your Restaurant
              </Typography>

              {/* Subheading */}
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  fontWeight: 400,
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  maxWidth: 600,
                  px: { xs: 1, sm: 0 },
                  width: '100%',
                }}
              >
                Transform your dining experience with digital menus, QR ordering, and real-time management
              </Typography>

              {/* Feature Pills */}
              <Stack 
                direction="row" 
                spacing={1.5} 
                flexWrap="wrap" 
                useFlexGap 
                sx={{ 
                  pt: 1,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  width: '100%',
                }}
              >
                {features.map((feature, index) => (
                  <Chip
                    key={index}
                    icon={feature.icon}
                    label={feature.text}
                    size="medium"
                    sx={{
                      backgroundColor: 'background.paper',
                      border: '1.5px solid',
                      borderColor: 'divider',
                      fontWeight: 600,
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      height: { xs: 32, sm: 36 },
                      px: 0.5,
                      '& .MuiChip-icon': {
                        color: 'primary.main',
                      },
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Stack>

              {/* CTA Buttons */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ 
                  pt: { xs: 2, md: 3 },
                  width: '100%',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: { xs: 'center', md: 'flex-start' },
                }}
              >
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/admin')}
                    sx={{
                      px: { xs: 4, sm: 5 },
                      py: { xs: 1.5, sm: 1.75 },
                      fontSize: { xs: '1rem', sm: '1.0625rem' },
                      fontWeight: 700,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      minHeight: { xs: 50, sm: 56 },
                      boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.35)}`,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        boxShadow: `0 14px 40px ${alpha(theme.palette.primary.main, 0.45)}`,
                        transform: 'translateY(-3px)',
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
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
                      onClick={() => navigate('/register')}
                      sx={{
                        px: { xs: 4, sm: 5 },
                        py: { xs: 1.5, sm: 1.75 },
                        fontSize: { xs: '1rem', sm: '1.0625rem' },
                        fontWeight: 700,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        minHeight: { xs: 50, sm: 56 },
                        boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.35)}`,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        '&:hover': {
                          boxShadow: `0 14px 40px ${alpha(theme.palette.primary.main, 0.45)}`,
                          transform: 'translateY(-3px)',
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Start Free Trial
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={() => {
                        const element = document.getElementById('features');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      sx={{
                        px: { xs: 4, sm: 5 },
                        py: { xs: 1.5, sm: 1.75 },
                        fontSize: { xs: '1rem', sm: '1.0625rem' },
                        fontWeight: 700,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        minHeight: { xs: 50, sm: 56 },
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        backgroundColor: 'transparent',
                        '&:hover': {
                          borderWidth: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          transform: 'translateY(-3px)',
                          boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      See How It Works
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Grid>

          {/* Right Content - Feature Showcase */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 320, sm: 400, md: 500 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Stacked Feature Cards */}
              <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ width: '100%', maxWidth: { xs: '100%', md: 450 } }}>
                {/* QR Code Feature */}
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: { xs: 2.5, md: 3 },
                    p: { xs: 2, md: 2.5 },
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    boxShadow: `0 15px 50px ${alpha(theme.palette.primary.main, 0.2)}`,
                    transform: { xs: 'translateX(0)', md: 'translateX(-30px)' },
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: { xs: 'translateY(-6px)', md: 'translateX(-30px) translateY(-10px)' },
                      boxShadow: `0 25px 70px ${alpha(theme.palette.primary.main, 0.3)}`,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 52, md: 64 },
                        height: { xs: 52, md: 64 },
                        borderRadius: 2.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <QrCode2 sx={{ color: 'primary.main', fontSize: { xs: 28, md: 36 } }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        QR Ordering
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9375rem' } }}>
                        Contactless menu access
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Dashboard Feature */}
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: { xs: 2.5, md: 3 },
                    p: { xs: 2, md: 2.5 },
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                    boxShadow: `0 15px 50px ${alpha(theme.palette.secondary.main, 0.2)}`,
                    transform: { xs: 'translateX(0)', md: 'translateX(30px)' },
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: { xs: 'translateY(-6px)', md: 'translateX(30px) translateY(-10px)' },
                      boxShadow: `0 25px 70px ${alpha(theme.palette.secondary.main, 0.3)}`,
                      borderColor: theme.palette.secondary.main,
                    },
                  }}
                >
                  <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 52, md: 64 },
                        height: { xs: 52, md: 64 },
                        borderRadius: 2.5,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DashboardIcon sx={{ color: 'secondary.main', fontSize: { xs: 28, md: 36 } }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Live Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9375rem' } }}>
                        Real-time analytics
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Restaurant Feature */}
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: { xs: 2.5, md: 3 },
                    p: { xs: 2, md: 2.5 },
                    border: `2px solid ${alpha(theme.palette.success.main, 0.25)}`,
                    boxShadow: `0 15px 50px ${alpha(theme.palette.success.main, 0.2)}`,
                    transform: { xs: 'translateX(0)', md: 'translateX(-30px)' },
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: { xs: 'translateY(-6px)', md: 'translateX(-30px) translateY(-10px)' },
                      boxShadow: `0 25px 70px ${alpha(theme.palette.success.main, 0.3)}`,
                      borderColor: theme.palette.success.main,
                    },
                  }}
                >
                  <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 52, md: 64 },
                        height: { xs: 52, md: 64 },
                        borderRadius: 2.5,
                        backgroundColor: alpha(theme.palette.success.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Restaurant sx={{ color: 'success.main', fontSize: { xs: 28, md: 36 } }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Menu Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9375rem' } }}>
                        Easy updates & control
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;

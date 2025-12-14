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
    { icon: <TrendingUp sx={{ fontSize: 12 }} />, text: '3x Faster Orders' },
    { icon: <Speed sx={{ fontSize: 12 }} />, text: 'Real-time Updates' },
    { icon: <Security sx={{ fontSize: 12 }} />, text: 'Secure & Reliable' },
  ];

  return (
    <Box
      id="hero"
      sx={{
        position: 'relative',
        minHeight: { xs: '90vh', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.03)} 0%, 
          ${alpha(theme.palette.background.default, 1)} 50%,
          ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
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
          opacity: 0.4,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)
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
          opacity: 0.15,
        }}
      >
        {/* Top Right Circle */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: { xs: '300px', md: '500px' },
            height: { xs: '300px', md: '500px' },
            borderRadius: '50%',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          }}
        />

        {/* Bottom Left Circle */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: { xs: '400px', md: '600px' },
            height: { xs: '400px', md: '600px' },
            borderRadius: '50%',
            border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70%',
              height: '70%',
              borderRadius: '50%',
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            },
          }}
        />

        {/* Floating Icons */}
        <Restaurant
          sx={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            fontSize: { xs: 40, md: 60 },
            color: theme.palette.primary.main,
            opacity: 0.2,
          }}
        />
        <QrCode2
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '12%',
            fontSize: { xs: 35, md: 50 },
            color: theme.palette.secondary.main,
            opacity: 0.2,
          }}
        />
        <DashboardIcon
          sx={{
            position: 'absolute',
            top: '60%',
            left: '15%',
            fontSize: { xs: 30, md: 45 },
            color: theme.palette.primary.main,
            opacity: 0.2,
          }}
        />
      </Box>
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              {/* Badge */}
              <Box>
                <Chip
                  icon={<AutoAwesome sx={{ fontSize: 12 }} />}
                  label="Trusted by 500+ Restaurants"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    px: 1,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '& .MuiChip-icon': {
                      color: 'primary.main',
                    },
                  }}
                />
              </Box>

              {/* Main Heading */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Revolutionize Your Restaurant
              </Typography>

              {/* Subheading */}
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 400,
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  maxWidth: 600,
                }}
              >
                Transform your dining experience with digital menus, QR ordering, and real-time management
              </Typography>

              {/* Feature Pills */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {features.map((feature, index) => (
                  <Chip
                    key={index}
                    icon={feature.icon}
                    label={feature.text}
                    size="small"
                    sx={{
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: 'primary.main',
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* CTA Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ pt: 1 }}>
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/admin')}
                    sx={{
                      px: 5,
                      py: 1.75,
                      fontSize: '1.0625rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      minHeight: 56,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
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
                        px: 5,
                        py: 1.75,
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        textTransform: 'none',
                        minHeight: 56,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        '&:hover': {
                          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
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
                        px: 5,
                        py: 1.75,
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        textTransform: 'none',
                        minHeight: 56,
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        backgroundColor: 'transparent',
                        '&:hover': {
                          borderWidth: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
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
                height: { xs: 300, md: 500 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Stacked Feature Cards */}
              <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                {/* QR Code Feature */}
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 3,
                    p: 1.5,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    transform: 'translateX(-20px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(-20px) translateY(-8px)',
                      boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.25)}`,
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <QrCode2 sx={{ color: 'primary.main', fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        QR Ordering
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contactless menu access
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Dashboard Feature */}
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 3,
                    p: 1.5,
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    boxShadow: `0 12px 40px ${alpha(theme.palette.secondary.main, 0.15)}`,
                    transform: 'translateX(20px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(20px) translateY(-8px)',
                      boxShadow: `0 20px 60px ${alpha(theme.palette.secondary.main, 0.25)}`,
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DashboardIcon sx={{ color: 'secondary.main', fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        Live Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Real-time analytics
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Restaurant Feature */}
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 3,
                    p: 1.5,
                    border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    boxShadow: `0 12px 40px ${alpha(theme.palette.success.main, 0.15)}`,
                    transform: 'translateX(-20px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(-20px) translateY(-8px)',
                      boxShadow: `0 20px 60px ${alpha(theme.palette.success.main, 0.25)}`,
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Restaurant sx={{ color: 'success.main', fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        Menu Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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

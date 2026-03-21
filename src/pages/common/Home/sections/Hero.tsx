import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  alpha,
  keyframes,
} from '@mui/material';
import {
  PlayArrow,
  CheckCircleOutline,
  TrendingUp,
  Speed,
  Security,
  Store,
  QrCode2,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/common/Auth';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const floatSlow = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-15px) translateX(10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;


const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { icon: <TrendingUp sx={{ fontSize: 16 }} />, text: '3x Faster' },
    { icon: <Speed sx={{ fontSize: 16 }} />, text: 'Real-time' },
    { icon: <Security sx={{ fontSize: 16 }} />, text: 'Secure' },
  ];

  return (
    <Box
      id="hero"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        overflow: 'hidden',
        pt: { xs: '64px', md: '70px' },
        background: '#0f172a',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 30%, ${alpha('#ffffff', 0.05)} 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${alpha('#ffffff', 0.03)} 0%, transparent 50%)
            `,
          }}
        />

        {/* Grid Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(${alpha('#ffffff', 0.02)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha('#ffffff', 0.02)} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Large Gradient Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: { xs: '400px', md: '600px' },
            height: { xs: '400px', md: '600px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#ffffff', 0.08)} 0%, ${alpha('#ffffff', 0.02)} 40%, transparent 70%)`,
            filter: 'blur(40px)',
            animation: `${float} 8s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: { xs: '500px', md: '700px' },
            height: { xs: '500px', md: '700px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#ffffff', 0.06)} 0%, ${alpha('#ffffff', 0.02)} 40%, transparent 70%)`,
            filter: 'blur(40px)',
            animation: `${floatSlow} 10s ease-in-out infinite`,
            animationDelay: '2s',
          }}
        />

        {/* Floating Circles */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: `2px solid ${alpha('#ffffff', 0.1)}`,
            animation: `${float} 6s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            border: `2px solid ${alpha('#ffffff', 0.08)}`,
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '2s',
          }}
        />

        {/* Floating Icons */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            animation: `${float} 5s ease-in-out infinite`,
            animationDelay: '0.5s',
          }}
        >
          <QrCode2
            sx={{
              fontSize: { xs: 40, md: 60 },
              color: alpha('#ffffff', 0.1),
              animation: `${pulse} 3s ease-in-out infinite`,
            }}
          />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            right: '20%',
            animation: `${floatSlow} 6s ease-in-out infinite`,
            animationDelay: '1.5s',
          }}
        >
          <DashboardIcon
            sx={{
              fontSize: { xs: 35, md: 50 },
              color: alpha('#ffffff', 0.08),
              animation: `${pulse} 4s ease-in-out infinite`,
            }}
          />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            animation: `${float} 7s ease-in-out infinite`,
            animationDelay: '2s',
          }}
        >
          <Store
            sx={{
              fontSize: { xs: 38, md: 55 },
              color: alpha('#ffffff', 0.09),
              animation: `${pulse} 3.5s ease-in-out infinite`,
            }}
          />
        </Box>
      </Box>
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2, 
          py: { xs: 4, sm: 5, md: 8 },
          px: { xs: 2, sm: 3, md: 3 },
          height: '100%',
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Stack 
              spacing={{ xs: 3, md: 3.5 }} 
              sx={{ 
                alignItems: { xs: 'center', md: 'flex-start' }, 
                textAlign: { xs: 'center', md: 'left' },
                animation: `${slideInLeft} 0.8s ease-out`,
              }}
            >
              {/* Badge */}
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, width: '100%' }}>
                <Chip
                  icon={<CheckCircleOutline sx={{ fontSize: 18 }} />}
                  label="Trusted by 500+ Businesses"
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.1),
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    height: { xs: 32, sm: 36 },
                    px: { xs: 1.5, sm: 2 },
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    '& .MuiChip-icon': {
                      color: '#ffffff',
                      marginLeft: '8px',
                    },
                    animation: `${fadeIn} 1s ease-out 0.3s both`,
                  }}
                />
              </Box>

              {/* Main Heading */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.25rem', sm: '3.25rem', md: '4rem', lg: '4.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: '#ffffff',
                  mb: { xs: 1, md: 1.5 },
                  letterSpacing: '-0.03em',
                  px: { xs: 0, sm: 0 },
                  width: '100%',
                  animation: `${fadeIn} 1s ease-out 0.5s both`,
                }}
              >
                Transform Your Business Operations
              </Typography>

              {/* Subheading */}
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.0625rem', sm: '1.25rem', md: '1.375rem' },
                  fontWeight: 400,
                  color: alpha('#ffffff', 0.8),
                  lineHeight: 1.6,
                  maxWidth: 600,
                  px: { xs: 0, sm: 0 },
                  width: '100%',
                  mb: 1,
                  animation: `${fadeIn} 1s ease-out 0.7s both`,
                }}
              >
                Streamline operations with digital catalogs, QR ordering, and real-time management for cafes, restaurants, bars, and service businesses.
              </Typography>

              {/* Feature Pills */}
              <Stack 
                direction="row" 
                spacing={1.5} 
                flexWrap="wrap" 
                useFlexGap 
                sx={{ 
                  pt: 0.5,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  width: '100%',
                  animation: `${fadeIn} 1s ease-out 0.9s both`,
                }}
              >
                {features.map((feature, index) => (
                  <Chip
                    key={index}
                    icon={feature.icon}
                    label={feature.text}
                    size="medium"
                    sx={{
                      backgroundColor: alpha('#ffffff', 0.1),
                      border: '1px solid',
                      borderColor: alpha('#ffffff', 0.2),
                      fontWeight: 600,
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      height: { xs: 32, sm: 36 },
                      px: 0.5,
                      color: alpha('#ffffff', 0.9),
                      '& .MuiChip-icon': {
                        color: '#ffffff',
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* CTA Buttons */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ 
                  pt: { xs: 2, md: 2.5 },
                  width: '100%',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  animation: `${fadeIn} 1s ease-out 1.1s both`,
                }}
              >
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/admin/dashboard')}
                    sx={{
                      px: { xs: 4, sm: 5 },
                      py: { xs: 1.5, sm: 1.75 },
                      fontSize: { xs: '1rem', sm: '1.0625rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      minHeight: { xs: 50, sm: 54 },
                      boxShadow: '0 4px 14px rgba(255, 255, 255, 0.25)',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(255, 255, 255, 0.35)',
                        transform: 'translateY(-2px)',
                        backgroundColor: '#f8fafc',
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
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        minHeight: { xs: 50, sm: 54 },
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                        backgroundColor: '#0f172a',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.35)',
                          transform: 'translateY(-2px)',
                          backgroundColor: '#1e293b',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Start Now
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
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        minHeight: { xs: 50, sm: 54 },
                        borderWidth: 1.5,
                        borderColor: alpha('#ffffff', 0.3),
                        color: '#ffffff',
                        backgroundColor: 'transparent',
                        '&:hover': {
                          borderWidth: 1.5,
                          borderColor: '#ffffff',
                          backgroundColor: alpha('#ffffff', 0.1),
                          color: '#ffffff',
                          transform: 'translateY(-2px)',
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
                height: { xs: 'auto', sm: 'auto', md: 500 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `${slideInRight} 0.8s ease-out`,
              }}
            >
              {/* Stacked Feature Cards */}
              <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ width: '100%', maxWidth: { xs: '100%', md: 480 } }}>
                {/* QR Code Feature */}
                <Box
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.08),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2.5,
                    p: { xs: 2.5, md: 3 },
                    border: `1px solid ${alpha('#ffffff', 0.1)}`,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    animation: `${fadeIn} 1s ease-out 0.5s both`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                      borderColor: alpha('#ffffff', 0.2),
                      backgroundColor: alpha('#ffffff', 0.12),
                    },
                  }}
                >
                  <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 56, md: 64 },
                        height: { xs: 56, md: 64 },
                        borderRadius: 2,
                        backgroundColor: alpha('#ffffff', 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <QrCode2 sx={{ color: '#ffffff', fontSize: { xs: 28, md: 32 } }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: '1.0625rem', md: '1.125rem' }, color: '#ffffff' }}>
                        QR Ordering
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9375rem' }, color: alpha('#ffffff', 0.7) }}>
                        Contactless catalog access
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Dashboard Feature */}
                <Box
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.08),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2.5,
                    p: { xs: 2.5, md: 3 },
                    border: `1px solid ${alpha('#ffffff', 0.1)}`,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    animation: `${fadeIn} 1s ease-out 0.7s both`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                      borderColor: alpha('#ffffff', 0.2),
                      backgroundColor: alpha('#ffffff', 0.12),
                    },
                  }}
                >
                  <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 56, md: 64 },
                        height: { xs: 56, md: 64 },
                        borderRadius: 2,
                        backgroundColor: alpha('#ffffff', 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DashboardIcon sx={{ color: '#ffffff', fontSize: { xs: 28, md: 32 } }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: '1.0625rem', md: '1.125rem' }, color: '#ffffff' }}>
                        Live Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9375rem' }, color: alpha('#ffffff', 0.7) }}>
                        Real-time analytics
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Business Feature */}
                <Box
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.08),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2.5,
                    p: { xs: 2.5, md: 3 },
                    border: `1px solid ${alpha('#ffffff', 0.1)}`,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    animation: `${fadeIn} 1s ease-out 0.9s both`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                      borderColor: alpha('#ffffff', 0.2),
                      backgroundColor: alpha('#ffffff', 0.12),
                    },
                  }}
                >
                  <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 56, md: 64 },
                        height: { xs: 56, md: 64 },
                        borderRadius: 2,
                        backgroundColor: alpha('#ffffff', 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Store sx={{ color: '#ffffff', fontSize: { xs: 28, md: 32 } }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: '1.0625rem', md: '1.125rem' }, color: '#ffffff' }}>
                        Catalog Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9375rem' }, color: alpha('#ffffff', 0.7) }}>
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
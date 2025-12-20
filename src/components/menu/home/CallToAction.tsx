import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  alpha,
  Stack,
} from '@mui/material';
import { ArrowForward, Restaurant, LocalOffer } from '@mui/icons-material';

interface CallToActionProps {
  onViewMenu: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({ onViewMenu }) => {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2.5 } }}>
      <Box
        sx={{
          mt: 2,
          p: { xs: 3, sm: 4 },
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
          borderRadius: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(30, 58, 95, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '40%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Decorative Icons */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            opacity: 0.1,
          }}
        >
          <Restaurant sx={{ fontSize: 60, color: 'white' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            opacity: 0.1,
          }}
        >
          <LocalOffer sx={{ fontSize: 50, color: 'white' }} />
        </Box>

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: 'white',
              mb: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              letterSpacing: '-0.5px',
            }}
          >
            Ready to Order?
          </Typography>
          <Typography
            variant="body1"
            sx={{ 
              mb: 3, 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Browse our full menu and discover amazing dishes crafted with love
          </Typography>

          {/* Features */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 3, justifyContent: 'center' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'white',
                fontSize: '0.85rem',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                }}
              />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Fresh Ingredients
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'white',
                fontSize: '0.85rem',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#FFC107',
                }}
              />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Quick Delivery
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'white',
                fontSize: '0.85rem',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#2196F3',
                }}
              />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Best Prices
              </Typography>
            </Box>
          </Stack>

          {/* CTA Button */}
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={onViewMenu}
            sx={{
              backgroundColor: 'white',
              color: '#1E3A5F',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha('#FFFFFF', 0.95),
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            View Full Menu
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CallToAction;

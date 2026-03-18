import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { Restaurant } from '@mui/icons-material';

const DesktopRestrictionOverlay: React.FC = () => {
  const theme = useTheme();
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Don't show restriction if it's a touch device (tablet/touch laptop)
  if (isTouchDevice) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: alpha('#000000', 0.85),
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        sx={{
          maxWidth: { xs: '100%', sm: 480 },
          p: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          borderRadius: 2,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[24],
        }}
      >
        <Box sx={{ mb: 2.5 }}>
          <Avatar
            sx={{
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              mx: 'auto',
              mb: 2,
            }}
          >
            <Restaurant sx={{ fontSize: { xs: 28, sm: 32 } }} />
          </Avatar>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 1.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Mobile Ordering Experience
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6, fontSize: '0.95rem' }}>
            Our menu is optimized for mobile devices to provide the best ordering experience. 
            Please use your smartphone or tablet to browse and order.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 2,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 42,
              borderRadius: 1,
              border: `2px solid ${theme.palette.primary.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: 14,
                height: 20,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 0.5,
              }}
            />
          </Box>
          <Typography variant="body2" color="primary" fontWeight="500" sx={{ fontSize: '0.9rem' }}>
            Scan QR code or visit on mobile device
          </Typography>
        </Box>

        <Stack spacing={0.75} sx={{ textAlign: 'left', mb: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            • Faster ordering process
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            • Touch-optimized interface
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            • Real-time order updates
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          Need assistance? Please ask your server for help
        </Typography>
      </Paper>
    </Box>
  );
};

export default DesktopRestrictionOverlay;
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

interface CallToActionProps {
  onViewMenu: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({ onViewMenu }) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
        borderTop: '3px solid rgba(255, 255, 255, 0.1)',
        py: { xs: 1.5, sm: 2 },
        mt: 2,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={{ xs: 1.5, sm: 2 }}
        >
          {/* Text Content */}
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'white',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                mb: 0.25,
              }}
            >
              Ready to Order?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              Browse our full menu and add items to your cart
            </Typography>
          </Box>

          {/* CTA Button */}
          <Button
            variant="contained"
            size="medium"
            endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
            onClick={onViewMenu}
            sx={{
              backgroundColor: 'white',
              color: '#1E3A5F',
              px: { xs: 2.5, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              fontWeight: 700,
              textTransform: 'none',
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              borderRadius: 1.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              minWidth: { xs: '100%', sm: 'auto' },
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            View Full Menu
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default CallToAction;



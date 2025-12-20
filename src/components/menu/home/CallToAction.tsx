
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

interface CallToActionProps {
  onViewMenu: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({ onViewMenu }) => {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          mt: 2.5,
          mb: 2,
          p: { xs: 2, sm: 2.5 },
          backgroundColor: 'white',
          border: '1px solid #E0E0E0',
          borderRadius: 1,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#1E3A5F',
            mb: 0.75,
            fontSize: { xs: '1rem', sm: '1.1rem' },
          }}
        >
          Ready to Order?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
        >
          Browse our full menu and add items to your cart
        </Typography>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={onViewMenu}
          sx={{
            backgroundColor: '#1E3A5F',
            color: 'white',
            px: 2.5,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': {
              backgroundColor: '#2C5282',
            },
          }}
        >
          View Menu
        </Button>
      </Box>
    </Container>
  );
};

export default CallToAction;
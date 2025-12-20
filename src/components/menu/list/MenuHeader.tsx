import React from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';

const MenuHeader: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#1E3A5F',
        color: 'white',
        py: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Menu
        </Typography>
      </Container>
    </Box>
  );
};

export default MenuHeader;
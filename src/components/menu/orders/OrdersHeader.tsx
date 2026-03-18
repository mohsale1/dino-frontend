import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface OrdersHeaderProps {
  onRefresh: () => void;
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({ onRefresh }) => {
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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Your Orders
          </Typography>
          <IconButton
            onClick={onRefresh}
            size="small"
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              width: 36,
              height: 36,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <Refresh sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
};

export default OrdersHeader;

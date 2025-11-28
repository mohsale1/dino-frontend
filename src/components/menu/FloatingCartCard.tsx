import React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Stack,
  alpha,
  Slide,
  useTheme,
} from '@mui/material';
import { ShoppingCart, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface FloatingCartCardProps {
  totalItems: number;
  totalAmount: number;
  venueId?: string;
  tableId?: string;
  show: boolean;
}

const FloatingCartCard: React.FC<FloatingCartCardProps> = ({
  totalItems,
  totalAmount,
  venueId,
  tableId,
  show,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleOrderNow = () => {
    if (venueId && tableId) {
      navigate(`/checkout/${venueId}/${tableId}`);
    }
  };

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Card
        sx={{
          position: 'fixed',
          bottom: { xs: 70, sm: 80 },
          left: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1100,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          overflow: 'hidden',
          maxWidth: { sm: 600 },
          mx: { sm: 'auto' },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Left Section - Cart Info */}
          <Stack direction="row" spacing={2} alignItems="center" flex={1}>
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <ShoppingCart sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
              <Chip
                label={totalItems}
                size="small"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  height: 24,
                  minWidth: 24,
                  backgroundColor: theme.palette.error.main,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                ₹{totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Stack>

          {/* Right Section - Order Button */}
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleOrderNow}
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1.5, sm: 1.75 },
              borderRadius: 2,
              fontWeight: 700,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Order Now
          </Button>
        </Box>

        {/* Decorative gradient line */}
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        />
      </Card>
    </Slide>
  );
};

export default FloatingCartCard;
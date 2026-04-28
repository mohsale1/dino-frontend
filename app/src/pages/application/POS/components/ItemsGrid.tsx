import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Search from '@mui/icons-material/Search';
import ItemCard from './ItemCard';
import { PosMenuItem, CartItem } from '../pos.types';

interface ItemsGridProps {
  loading: boolean;
  dataError: string;
  filteredItems: PosMenuItem[];
  cart: CartItem[];
  viewMode: 'grid' | 'list';
  onAdd: (item: PosMenuItem) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRetry: () => void;
  formatINR: (n: number) => string;
}

const ItemsGrid: React.FC<ItemsGridProps> = ({
  loading,
  dataError,
  filteredItems,
  cart,
  viewMode,
  onAdd,
  onUpdateQty,
  onRetry,
  formatINR,
}) => {
  if (loading) {
    return (
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, md: 2 }, pb: { xs: 10, lg: 2 } }}>
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={index}>
              <Skeleton
                variant="rectangular"
                height={220}
                sx={{ borderRadius: 2.5 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (dataError) {
    return (
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 1.5, md: 2 },
          pb: { xs: 10, lg: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 5,
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            bgcolor: '#F7F9FA',
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '12px',
              bgcolor: '#F7F9FA',
              border: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ErrorOutline sx={{ fontSize: 32, color: '#ef4444' }} />
          </Box>
          <Typography sx={{ color: '#1C1C1E', fontWeight: 600, fontSize: '0.95rem' }}>
            Failed to load items
          </Typography>
          <Typography sx={{ color: '#666666', fontSize: '0.83rem' }}>
            {dataError}
          </Typography>
          <Button
            variant="contained"
            onClick={onRetry}
            sx={{
              mt: 1,
              bgcolor: '#1C1C1E',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.83rem',
              borderRadius: 1.5,
              px: 3,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#374151', boxShadow: 'none' },
            }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 1.5, md: 2 },
          pb: { xs: 10, lg: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 5,
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            bgcolor: '#F7F9FA',
            maxWidth: 360,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '12px',
              bgcolor: '#F7F9FA',
              border: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search sx={{ fontSize: 28, color: '#999999' }} />
          </Box>
          <Typography sx={{ color: '#1C1C1E', fontWeight: 600, fontSize: '0.95rem' }}>
            No items found
          </Typography>
          <Typography sx={{ color: '#666666', fontSize: '0.83rem' }}>
            Try adjusting your search or filter to find what you are looking for.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (viewMode === 'list') {
    return (
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, md: 2 }, pb: { xs: 10, lg: 2 } }}>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 2.5,
            overflow: 'hidden',
          }}
        >
          {filteredItems.map((item) => {
            const cartItem = cart.find((c) => c.id === item.id);
            return (
              <ItemCard
                key={item.id}
                item={item}
                inCart={cartItem}
                viewMode="list"
                onAdd={() => onAdd(item)}
                onUpdateQty={(delta) => onUpdateQty(item.id, delta)}
                formatINR={formatINR}
              />
            );
          })}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, md: 2 }, pb: { xs: 10, lg: 2 } }}>
      <Grid container spacing={2}>
        {filteredItems.map((item) => {
          const cartItem = cart.find((c) => c.id === item.id);
          return (
            <Grid item xs={12} sm={6} md={4} xl={3} key={item.id}>
              <ItemCard
                item={item}
                inCart={cartItem}
                viewMode="grid"
                onAdd={() => onAdd(item)}
                onUpdateQty={(delta) => onUpdateQty(item.id, delta)}
                formatINR={formatINR}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ItemsGrid;

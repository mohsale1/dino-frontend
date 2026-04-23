import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import Search from '@mui/icons-material/Search'
import ItemCard from './ItemCard'
import { PosMenuItem, CartItem } from '../pos.types'

interface ItemsGridProps {
  loading: boolean
  dataError: string
  filteredItems: PosMenuItem[]
  cart: CartItem[]
  viewMode: 'grid' | 'list'
  onAdd: (item: PosMenuItem) => void
  onUpdateQty: (itemId: string, delta: number) => void
  onRetry: () => void
  formatINR: (n: number) => string
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
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
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
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 5,
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <ErrorOutline sx={{ fontSize: 48, color: '#ef4444' }} />
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
            Failed to load items
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {dataError}
          </Typography>
          <Button
            variant="contained"
            onClick={onRetry}
            sx={{
              mt: 1,
              bgcolor: '#0f172a',
              color: '#f8fafc',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    )
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
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 5,
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            maxWidth: 360,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Search sx={{ fontSize: 48, color: '#64748b' }} />
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
            No items found
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Try adjusting your search or filter to find what you are looking for.
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (viewMode === 'list') {
    return (
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, md: 2 }, pb: { xs: 10, lg: 2 } }}>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {filteredItems.map((item, index) => {
            const cartItem = cart.find((c) => c.id === item.id)
            return (
              <Box
                key={item.id}
                sx={{
                  borderBottom: index < filteredItems.length - 1 ? '1px solid #e2e8f0' : 'none',
                }}
              >
                <ItemCard
                  item={item}
                  inCart={cartItem}
                  viewMode="list"
                  onAdd={() => onAdd(item)}
                  onUpdateQty={(delta) => onUpdateQty(item.id, delta)}
                  formatINR={formatINR}
                />
              </Box>
            )
          })}
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, md: 2 }, pb: { xs: 10, lg: 2 } }}>
      <Grid container spacing={2}>
        {filteredItems.map((item) => {
          const cartItem = cart.find((c) => c.id === item.id)
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
          )
        })}
      </Grid>
    </Box>
  )
}

export default ItemsGrid
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, InputBase, IconButton, Chip } from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { PublicMenuData, PublicMenuItem } from '../../../../services/application/publicMenuService';
import { CartItem } from '../hooks/useCart';

interface MenuFragmentProps {
  menuData: PublicMenuData;
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

// ── Veg indicator dot ────────────────────────────────────────────────────────
const VegDot: React.FC<{ isVeg?: boolean }> = ({ isVeg }) => (
  <Box
    sx={{
      width: 12,
      height: 12,
      borderRadius: '2px',
      border: `1.5px solid ${isVeg ? '#16a34a' : '#dc2626'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isVeg ? '#16a34a' : '#dc2626' }} />
  </Box>
);

// ── Single item card ─────────────────────────────────────────────────────────
const ItemCard: React.FC<{
  item: PublicMenuItem;
  cartItem?: CartItem;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}> = ({ item, cartItem, onAdd, onIncrease, onDecrease }) => {
  const qty = cartItem?.quantity ?? 0;
  const isBestseller = (item.display_order ?? 99) <= 3;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        p: 1.5,
        position: 'relative',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
      }}
    >
      {/* Bestseller badge */}
      {isBestseller && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: '#f97316',
            color: '#fff',
            fontSize: '0.55rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            px: 0.75,
            py: 0.25,
            borderRadius: 0.75,
            zIndex: 1,
          }}
        >
          Popular
        </Box>
      )}

      {/* Image */}
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: 2,
          flexShrink: 0,
          overflow: 'hidden',
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {item.image_urls && item.image_urls.length > 0 ? (
          <Box
            component="img"
            src={item.image_urls[0]}
            alt={item.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography sx={{ fontSize: '2rem' }}>
            {item.is_vegetarian ? '🥗' : '🍽️'}
          </Typography>
        )}
        {!item.is_available && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff', textAlign: 'center', px: 0.5 }}>
              Unavailable
            </Typography>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
            <VegDot isVeg={item.is_vegetarian} />
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#0f172a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </Typography>
          </Box>
          {item.description && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#64748b',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}
            >
              {item.description}
            </Typography>
          )}
          {item.preparation_time_minutes && (
            <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
              {item.preparation_time_minutes} min
            </Typography>
          )}
        </Box>

        {/* Price + Add button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.75 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
            ₹{item.price.toLocaleString('en-IN')}
          </Typography>

          {item.is_available ? (
            qty === 0 ? (
              <Box
                onClick={onAdd}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: '#fff',
                  border: '1.5px solid #f97316',
                  borderRadius: 1.5,
                  px: 1.25,
                  py: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: '#fff7ed' },
                }}
              >
                <AddIcon sx={{ fontSize: 14, color: '#f97316' }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#f97316' }}>ADD</Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: '#f97316',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                }}
              >
                <IconButton
                  size="small"
                  onClick={onDecrease}
                  sx={{ color: '#fff', p: 0.5, borderRadius: 0, '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}
                >
                  <RemoveIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', minWidth: 18, textAlign: 'center' }}>
                  {qty}
                </Typography>
                <IconButton
                  size="small"
                  onClick={onIncrease}
                  sx={{ color: '#fff', p: 0.5, borderRadius: 0, '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )
          ) : (
            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Unavailable</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ── Main fragment ────────────────────────────────────────────────────────────
const MenuFragment: React.FC<MenuFragmentProps> = ({ menuData, cart, onAddToCart, onUpdateQuantity }) => {
  const { categories, items } = menuData;
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const categoryBarRef = useRef<HTMLDivElement>(null);

  const availableCategories = categories.filter((c) => c.is_available);

  const getCartItem = useCallback(
    (itemId: string) => cart.find((c) => c.item_id === itemId),
    [cart]
  );

  const handleAdd = useCallback(
    (item: PublicMenuItem) => {
      onAddToCart({
        item_id: item.id,
        item_name: item.name,
        unit_price: item.price,
        quantity: 1,
        total_price: item.price,
        image_url: item.image_urls?.[0],
        description: item.description,
      });
    },
    [onAddToCart]
  );

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category_id === activeCategory;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group by category
  const grouped = availableCategories
    .map((cat) => ({
      category: cat,
      items: filteredItems.filter((i) => i.category_id === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  // Scroll active category chip into view
  useEffect(() => {
    if (!categoryBarRef.current) return;
    const active = categoryBarRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCategory]);

  return (
    <Box>
      {/* Search bar */}
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: 2.5,
            px: 1.5,
            py: 0.75,
            transition: 'border-color 0.15s',
            '&:focus-within': { borderColor: '#f97316', bgcolor: '#fff' },
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: '#94a3b8', flexShrink: 0 }} />
          <InputBase
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: '0.875rem', color: '#0f172a' }}
          />
          {search && (
            <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25, color: '#94a3b8' }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Category chips */}
      <Box
        ref={categoryBarRef}
        sx={{
          display: 'flex',
          gap: 1,
          px: 2,
          pb: 1.5,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          position: 'sticky',
          top: 0,
          bgcolor: '#fafafa',
          zIndex: 5,
          pt: 0.5,
        }}
      >
        <Chip
          label="All"
          data-active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          sx={{
            flexShrink: 0,
            fontWeight: 700,
            fontSize: '0.78rem',
            height: 32,
            borderRadius: '10px',
            bgcolor: activeCategory === 'all' ? '#0f172a' : '#f1f5f9',
            color: activeCategory === 'all' ? '#fff' : '#374151',
            border: activeCategory === 'all' ? '1px solid #0f172a' : '1px solid #e2e8f0',
            '&:hover': { bgcolor: activeCategory === 'all' ? '#1e293b' : '#e2e8f0' },
          }}
        />
        {availableCategories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            data-active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            sx={{
              flexShrink: 0,
              fontWeight: 600,
              fontSize: '0.78rem',
              height: 32,
              borderRadius: '10px',
              bgcolor: activeCategory === cat.id ? '#0f172a' : '#f1f5f9',
              color: activeCategory === cat.id ? '#fff' : '#374151',
              border: activeCategory === cat.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
              '&:hover': { bgcolor: activeCategory === cat.id ? '#1e293b' : '#e2e8f0' },
            }}
          />
        ))}
      </Box>

      {/* Results count */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          {search && ` for "${search}"`}
        </Typography>
      </Box>

      {/* Items list */}
      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {filteredItems.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>🔍</Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', mb: 0.5 }}>No items found</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>Try a different search or category</Typography>
          </Box>
        ) : activeCategory === 'all' ? (
          grouped.map(({ category, items: catItems }) => (
            <Box key={category.id}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', mb: 1.5 }}>
                {category.name}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {catItems.map((item) => {
                  const cartItem = getCartItem(item.id);
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      cartItem={cartItem}
                      onAdd={() => handleAdd(item)}
                      onIncrease={() => onUpdateQuantity(item.id, (cartItem?.quantity ?? 0) + 1)}
                      onDecrease={() => onUpdateQuantity(item.id, (cartItem?.quantity ?? 0) - 1)}
                    />
                  );
                })}
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filteredItems.map((item) => {
              const cartItem = getCartItem(item.id);
              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  cartItem={cartItem}
                  onAdd={() => handleAdd(item)}
                  onIncrease={() => onUpdateQuantity(item.id, (cartItem?.quantity ?? 0) + 1)}
                  onDecrease={() => onUpdateQuantity(item.id, (cartItem?.quantity ?? 0) - 1)}
                />
              );
            })}
          </Box>
        )}
        <Box sx={{ height: 8 }} />
      </Box>
    </Box>
  );
};

export default MenuFragment;
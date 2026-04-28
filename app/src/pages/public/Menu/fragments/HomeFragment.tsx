import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Grass as GrassIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import type { PublicMenuWithValidation } from '../../../../services/application/publicMenuService';

interface HomeFragmentProps {
  menuData: PublicMenuWithValidation;
  onViewMenu: () => void;
}

// ── Palette ────────────────────────────────────────────────────────────────────
// Calm, professional — warm stone tones, no loud colors
const P = {
  pageBg:     '#f5f4f1',
  white:      '#ffffff',
  border:     '#e4e1da',
  text:       '#1a1916',
  textSub:    '#6b6760',
  textFaint:  '#a09d98',
  // Hero: soft warm linen gradient — light, not dark
  heroFrom:   '#edeae3',
  heroTo:     '#e4e0d8',
  // Accent: deep slate — used sparingly
  ink:        '#2c2a27',
  inkLight:   '#4a4844',
  // Category tile backgrounds — muted, desaturated
  catPalette: [
    { bg: '#ede9e3', fg: '#3a3630' },
    { bg: '#e3e8ed', fg: '#2e3a44' },
    { bg: '#e3ede6', fg: '#2e4433' },
    { bg: '#ede3e8', fg: '#44303a' },
    { bg: '#e8e3ed', fg: '#3a3044' },
    { bg: '#edebe3', fg: '#44422e' },
    { bg: '#e3edeb', fg: '#2e4440' },
    { bg: '#ede6e3', fg: '#44362e' },
  ],
};

// ── Banners ────────────────────────────────────────────────────────────────────
const BANNERS = [
  {
    tag:      'Today\'s Special',
    title:    'Fresh & Seasonal',
    body:     'Crafted daily with the finest local ingredients',
    bgFrom:   '#2c2a27',
    bgTo:     '#3d3830',
  },
  {
    tag:      'Dine In',
    title:    'Order at Your Table',
    body:     'Browse, select, and place your order — no waiting',
    bgFrom:   '#1e2530',
    bgTo:     '#2a3340',
  },
  {
    tag:      'Chef\'s Pick',
    title:    'Curated for You',
    body:     'Handpicked recommendations from our kitchen',
    bgFrom:   '#2a2420',
    bgTo:     '#3a3028',
  },
];

// ── Veg indicator (FSSAI square) ───────────────────────────────────────────────
const VegDot: React.FC<{ isVeg: boolean }> = ({ isVeg }) => (
  <Box
    sx={{
      width: 13,
      height: 13,
      border: `1.5px solid ${isVeg ? '#16a34a' : '#dc2626'}`,
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isVeg ? '#16a34a' : '#dc2626' }} />
  </Box>
);

// ── Component ──────────────────────────────────────────────────────────────────
const HomeFragment: React.FC<HomeFragmentProps> = ({ menuData, onViewMenu }) => {
  const { venue, table, categories, items } = menuData;

  // Banner auto-slide
  const [slide, setSlide] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => setSlide((s) => (s + 1) % BANNERS.length), []);

  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(advance, 3800);
  }, [advance]);

  useEffect(() => {
    resetTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [resetTimer]);

  const goTo = (idx: number) => { setSlide(idx); resetTimer(); };
  const goPrev = () => { setSlide((s) => (s - 1 + BANNERS.length) % BANNERS.length); resetTimer(); };
  const goNext = () => { advance(); resetTimer(); };

  // Derived
  const availableItems      = useMemo(() => items.filter((i) => i.is_available), [items]);
  const availableCategories = useMemo(() => categories.filter((c) => c.is_available), [categories]);
  const featuredItems       = useMemo(() => availableItems.slice(0, 5), [availableItems]);

  const catItemCount = useMemo(() => {
    const m: Record<string, number> = {};
    availableItems.forEach((i) => { m[i.category_id] = (m[i.category_id] ?? 0) + 1; });
    return m;
  }, [availableItems]);

  return (
    <Box sx={{ bgcolor: P.pageBg, minHeight: '100%', pb: 6 }}>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO  — light, airy, warm linen
      ══════════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          background: `linear-gradient(160deg, ${P.heroFrom} 0%, ${P.heroTo} 100%)`,
          px: 3,
          pt: 4,
          pb: 3.5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Very faint dot grid */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>

          {/* Table pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.4,
              borderRadius: '999px',
              bgcolor: 'rgba(44,42,39,0.07)',
              border: '1px solid rgba(44,42,39,0.14)',
              mb: 2.5,
            }}
          >
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: P.inkLight, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: P.inkLight, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Table {table?.table_number}
            </Typography>
          </Box>

          {/* Org name */}
          <Typography
            sx={{
              fontSize: '2rem',
              fontWeight: 800,
              color: P.text,
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
              wordBreak: 'break-word',
              mb: 0.75,
            }}
          >
            {venue.name}
          </Typography>

          {/* Tagline */}
          <Typography
            sx={{
              fontSize: '0.88rem',
              fontWeight: 400,
              color: P.textSub,
              lineHeight: 1.55,
              mb: 3,
              maxWidth: 280,
            }}
          >
            {venue.description || 'Scan. Browse. Order. Enjoy.'}
          </Typography>

          {/* Quick stats */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: P.textSub }}>
              {availableItems.length} items
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: P.textFaint }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: P.textSub }}>
              {availableCategories.length} categories
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: P.textFaint }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: P.textSub }}>
              {table?.capacity} seats
            </Typography>
          </Box>

          {/* CTA */}
          <Button
            onClick={onViewMenu}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: P.ink,
              color: P.white,
              borderRadius: '9px',
              px: 2.75,
              py: 1.1,
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.14)',
              '&:hover': { bgcolor: P.inkLight, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' },
              transition: 'all 0.18s ease',
            }}
          >
            Browse Menu
          </Button>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════
          CATEGORIES — small squares, horizontal scroll
      ══════════════════════════════════════════════════════════════════════ */}
      {availableCategories.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: P.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Categories
            </Typography>
            <Typography
              onClick={onViewMenu}
              sx={{ fontSize: '0.72rem', fontWeight: 600, color: P.textSub, cursor: 'pointer', '&:hover': { color: P.text } }}
            >
              View all
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1.25,
              overflowX: 'auto',
              px: 2.5,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              pb: 0.5,
            }}
          >
            {availableCategories.map((cat, idx) => {
              const pal   = P.catPalette[idx % P.catPalette.length];
              const count = catItemCount[cat.id] ?? 0;

              return (
                <Box
                  key={cat.id}
                  onClick={onViewMenu}
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.75,
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: 72,
                  }}
                >
                  {/* Square tile */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '14px',
                      bgcolor: pal.bg,
                      border: `1px solid ${P.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.25,
                      transition: 'transform 0.14s ease, box-shadow 0.14s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 10px rgba(0,0,0,0.07)' },
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: pal.fg, lineHeight: 1 }}>
                      {cat.name.charAt(0).toUpperCase()}
                    </Typography>
                    {count > 0 && (
                      <Typography sx={{ fontSize: '0.58rem', fontWeight: 500, color: P.textFaint }}>
                        {count}
                      </Typography>
                    )}
                  </Box>

                  {/* Name */}
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: P.textSub,
                      textAlign: 'center',
                      lineHeight: 1.3,
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BANNERS — auto-sliding
      ══════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mt: 3, px: 2.5 }}>
        <Box sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>

          {/* Slides */}
          {BANNERS.map((b, idx) => (
            <Box
              key={idx}
              sx={{
                display: idx === slide ? 'block' : 'none',
                background: `linear-gradient(135deg, ${b.bgFrom} 0%, ${b.bgTo} 100%)`,
                px: 2.5,
                pt: 2.25,
                pb: 2.5,
                position: 'relative',
                overflow: 'hidden',
                minHeight: 130,
              }}
            >
              {/* Faint dot texture */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                  pointerEvents: 'none',
                }}
              />

              {/* Top accent line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '1.5px',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.25), transparent)',
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Tag */}
                <Chip
                  label={b.tag}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.65)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '5px',
                    mb: 1.25,
                    '& .MuiChip-label': { px: 0.875 },
                  }}
                />

                <Typography
                  sx={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.25,
                    mb: 0.5,
                    letterSpacing: '-0.1px',
                  }}
                >
                  {b.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.5,
                    maxWidth: '75%',
                  }}
                >
                  {b.body}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* Prev arrow */}
          <Box
            onClick={goPrev}
            sx={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              width: 26, height: 26, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 2,
              '&:active': { transform: 'translateY(-50%) scale(0.9)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
          </Box>

          {/* Next arrow */}
          <Box
            onClick={goNext}
            sx={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              width: 26, height: 26, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 2,
              '&:active': { transform: 'translateY(-50%) scale(0.9)' },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
          </Box>

          {/* Dot indicators */}
          <Box sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.6, zIndex: 2 }}>
            {BANNERS.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => goTo(idx)}
                sx={{
                  width: idx === slide ? 16 : 5,
                  height: 5,
                  borderRadius: '999px',
                  bgcolor: idx === slide ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)',
                  cursor: 'pointer',
                  transition: 'all 0.28s ease',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════
          POPULAR ITEMS — compact list
      ══════════════════════════════════════════════════════════════════════ */}
      {featuredItems.length > 0 && (
        <Box sx={{ mt: 3, px: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: P.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Popular Items
            </Typography>
            <Typography
              onClick={onViewMenu}
              sx={{ fontSize: '0.72rem', fontWeight: 600, color: P.textSub, cursor: 'pointer', '&:hover': { color: P.text } }}
            >
              See all
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {featuredItems.map((item) => {
              const hasImage = Array.isArray(item.image_urls) && item.image_urls.length > 0;
              return (
                <Box
                  key={item.id}
                  onClick={onViewMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: P.white,
                    border: `1px solid ${P.border}`,
                    borderRadius: '12px',
                    p: 1.25,
                    cursor: 'pointer',
                    transition: 'border-color 0.14s ease',
                    '&:hover': { borderColor: '#ccc9c2' },
                    '&:active': { transform: 'scale(0.99)' },
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '9px',
                      flexShrink: 0,
                      overflow: 'hidden',
                      bgcolor: '#ede9e3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {hasImage ? (
                      <Box
                        component="img"
                        src={item.image_urls![0]}
                        alt={item.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#b8b0a6' }}>
                        {item.name.charAt(0).toUpperCase()}
                      </Typography>
                    )}
                  </Box>

                  {/* Name + desc */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.2 }}>
                      {item.is_vegetarian !== null && item.is_vegetarian !== undefined && (
                        <VegDot isVeg={item.is_vegetarian} />
                      )}
                      <Typography
                        sx={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: P.text,
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
                          fontSize: '0.7rem',
                          color: P.textFaint,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Price */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.4, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: P.text }}>
                      ₹{item.price.toFixed(0)}
                    </Typography>
                    {item.is_vegetarian && (
                      <GrassIcon sx={{ fontSize: 12, color: '#16a34a' }} />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default HomeFragment;

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ROLE_COLORS } from '../../../constants/app';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  todays_revenue?: number;
  todays_orders?: number;
  table_occupancy_rate?: number;
  active_items?: number;
  active_menu_items?: number;
}

interface DashboardHeaderProps {
  venueName: string;
  firstName: string;
  displayRole: string;
  lastUpdated: Date | null;
  stats: DashboardStats | null;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatLastUpdated = (date: Date | null): string => {
  if (!date) return 'Never';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} min ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (value: number): string => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const formatDate = (): string =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// ─── useCountUp ───────────────────────────────────────────────────────────────

const useCountUp = (target: number, duration = 900): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

// ─── HeroStat ─────────────────────────────────────────────────────────────────

interface HeroStatProps {
  label: string;
  value: number;
  icon: React.ReactElement;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS];
}

const HeroStat: React.FC<HeroStatProps> = ({ label, value, icon, rc }) => {
  const animated = useCountUp(value);
  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1.5, sm: 2 },
        py: 1.75,
        borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: alpha(rc.chipText, 0.9),
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 17 } })}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: rc.statValue,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {animated}
          </Typography>
          <Typography
            sx={{
              color: rc.statLabel,
              fontSize: '0.72rem',
              fontWeight: 500,
              mt: 0.25,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ─── RevenueHeroStat ──────────────────────────────────────────────────────────

interface RevenueHeroStatProps {
  label: string;
  formatted: string;
  icon: React.ReactElement;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS];
}

const RevenueHeroStat: React.FC<RevenueHeroStatProps> = ({ label, formatted, icon, rc }) => (
  <Box
    sx={{
      width: '100%',
      px: { xs: 1.5, sm: 2 },
      py: 1.75,
      borderRadius: 2.5,
      bgcolor: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(8px)',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.5,
          bgcolor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: alpha(rc.chipText, 0.9),
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 17 } })}
      </Box>
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            color: rc.statValue,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          {formatted}
        </Typography>
        <Typography
          sx={{
            color: rc.statLabel,
            fontSize: '0.72rem',
            fontWeight: 500,
            mt: 0.25,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  </Box>
);

// ─── DashboardHeader ──────────────────────────────────────────────────────────

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  venueName,
  firstName,
  displayRole,
  lastUpdated,
  stats,
  rc,
}) => {
  const [, setTick] = useState(0);

  // Re-render every 30s so "X min ago" stays fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const revenue = stats?.todays_revenue ?? 0;
  const orders = stats?.todays_orders ?? 0;
  const occupancy = Math.round(stats?.table_occupancy_rate ?? 0);
  const activeItems = stats?.active_items ?? stats?.active_menu_items ?? 0;

  return (
    <Box
      sx={{
        background: rc.gradient,
        px: { xs: 2, sm: 3, md: 5 },
        pt: { xs: 2.5, sm: 3 },
        pb: { xs: 2.5, sm: 3 },
        position: 'relative',
        // Grid overlay
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Glow orb A */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Glow orb B */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          left: '30%',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* Overline */}
        <Typography
          sx={{
            color: alpha(rc.chipText, 0.75),
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: 'uppercase',
            mb: 0.75,
          }}
        >
          {firstName} · {displayRole}
        </Typography>

        {/* Title row */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 1 },
            mb: 2.5,
          }}
        >
          {/* Left: venue name + date */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                fontSize: { xs: '1.5rem', sm: '1.875rem' },
              }}
            >
              {venueName || 'Dashboard'}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                mt: 0.5,
                color: alpha(rc.chipText, 0.65),
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 13 }} />
              <Typography
                variant="body2"
                sx={{ fontSize: '0.8rem', fontWeight: 500 }}
              >
                {formatDate()}
              </Typography>
            </Box>
          </Box>

          {/* Last updated */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: alpha(rc.chipText, 0.55),
              flexShrink: 0,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
              Updated {formatLastUpdated(lastUpdated)}
            </Typography>
          </Box>
        </Box>

        {/* Hero stat tiles */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          <RevenueHeroStat
            label="Today's Revenue"
            formatted={formatCurrency(revenue)}
            icon={<TrendingUpIcon />}
            rc={rc}
          />
          <HeroStat
            label="Today's Orders"
            value={orders}
            icon={<ShoppingBagIcon />}
            rc={rc}
          />
          <HeroStat
            label="Occupancy %"
            value={occupancy}
            icon={<TableRestaurantIcon />}
            rc={rc}
          />
          <HeroStat
            label="Active Items"
            value={activeItems}
            icon={<RestaurantMenuIcon />}
            rc={rc}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
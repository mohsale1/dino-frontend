/**
 * AreaCard Component
 *
 * Professional area card with gradient header, location count stat,
 * active state indicator, and admin controls. Fully responsive.
 */

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as ActiveIcon,
  RemoveCircle as InactiveIcon,
} from '@mui/icons-material';
import type { ServiceArea } from '../../../features/locations/types';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AreaCardProps {
  area: ServiceArea;
  locationCount?: number;
  onEdit: (area: ServiceArea) => void;
  onDelete: (areaId: string) => void;
}

// ─── Accent palette ─────────────────────────────────────────────────────────────

const ACCENTS = [
  { from: '#6366f1', to: '#818cf8', text: '#6366f1', soft: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  },
  { from: '#0ea5e9', to: '#38bdf8', text: '#0ea5e9', soft: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.2)'  },
  { from: '#10b981', to: '#34d399', text: '#059669', soft: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
  { from: '#f59e0b', to: '#fbbf24', text: '#d97706', soft: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  { from: '#ef4444', to: '#f87171', text: '#dc2626', soft: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
  { from: '#a855f7', to: '#c084fc', text: '#9333ea', soft: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.2)'  },
  { from: '#ec4899', to: '#f472b6', text: '#db2777', soft: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.2)'  },
  { from: '#14b8a6', to: '#2dd4bf', text: '#0d9488', soft: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.2)'  },
];

const getAccent = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return ACCENTS[Math.abs(h) % ACCENTS.length];
};

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

// ─── Component ─────────────────────────────────────────────────────────────────

const AreaCard: React.FC<AreaCardProps> = ({
  area,
  locationCount = 0,
  onEdit,
  onDelete,
}) => {
  const ac = getAccent(area.name);
  const initials = getInitials(area.name);
  const inactive = !area.isActive;

  return (
    <Box
      onClick={() => onEdit(area)}
      sx={{
        position: 'relative',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: { xs: 2, sm: 2.5 },
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        opacity: inactive ? 0.75 : 1,
        transition: 'all 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: inactive
            ? '0 8px 24px rgba(0,0,0,0.08)'
            : `0 8px 28px ${alpha(ac.from, 0.2)}`,
          borderColor: inactive ? '#cbd5e1' : alpha(ac.from, 0.4),
        },
      }}
    >
      {/* ── Gradient header ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          background: inactive
            ? 'linear-gradient(135deg,#e2e8f0 0%,#cbd5e1 100%)'
            : `linear-gradient(135deg,${ac.from} 0%,${ac.to} 100%)`,
          px: { xs: 1.5, sm: 2 },
          pt: { xs: 1.5, sm: 2 },
          pb: { xs: 1.5, sm: 2 },
          overflow: 'hidden',
          minHeight: { xs: 70, sm: 80 },
        }}
      >
        {/* Dot-grid texture */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            pointerEvents: 'none',
          }}
        />
        {/* Glow orb */}
        <Box
          sx={{
            position: 'absolute',
            top: -24,
            right: -24,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.14)',
            pointerEvents: 'none',
          }}
        />

        {/* Header content row */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'nowrap',
          }}
        >
          {/* Initials avatar */}
          <Box
            sx={{
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              minWidth: { xs: 36, sm: 44 },
              borderRadius: { xs: 1, sm: 1.5 },
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: initials.length > 1
                  ? { xs: '0.8rem', sm: '0.95rem' }
                  : { xs: '1rem', sm: '1.15rem' },
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              {initials}
            </Typography>
          </Box>

          {/* Status badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: { xs: 0.75, sm: 1 },
              py: { xs: 0.3, sm: 0.4 },
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(4px)',
              flexShrink: 0,
            }}
          >
            {inactive
              ? <InactiveIcon sx={{ fontSize: 10, color: 'rgba(255,255,255,0.85)' }} />
              : <ActiveIcon   sx={{ fontSize: 10, color: 'rgba(255,255,255,0.95)' }} />
            }
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.95)',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {inactive ? 'Inactive' : 'Active'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Stat strip — sits directly below header, no negative margin ──────── */}
      <Box
        sx={{
          mx: { xs: 1.5, sm: 2 },
          mt: -1.25,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: { xs: 1, sm: 1.25 },
            py: { xs: 0.6, sm: 0.75 },
            bgcolor: '#ffffff',
            border: `1px solid ${inactive ? '#e2e8f0' : ac.border}`,
            borderRadius: 1.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: 0.75,
              bgcolor: inactive ? '#f1f5f9' : ac.soft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LocationOnIcon sx={{ fontSize: 13, color: inactive ? '#94a3b8' : ac.text }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', lineHeight: 1 }}>
            {locationCount}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500, lineHeight: 1 }}>
            {locationCount === 1 ? 'location' : 'locations'}
          </Typography>
        </Box>
      </Box>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          pt: { xs: 1.25, sm: 1.5 },
          pb: { xs: 1, sm: 1.25 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            color: '#0f172a',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {area.name}
        </Typography>

        {area.description ? (
          <Typography
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              color: '#64748b',
              lineHeight: 1.55,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {area.description}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, color: '#cbd5e1', fontStyle: 'italic' }}>
            No description
          </Typography>
        )}
      </Box>

      {/* ── Action row ───────────────────────────────────────────────────────── */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1.25, sm: 1.75 },
          py: { xs: 0.75, sm: 1 },
          borderTop: '1px solid #f1f5f9',
          bgcolor: '#fafafa',
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
          Click to edit
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit area">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(area); }}
              sx={{
                width: { xs: 26, sm: 28 },
                height: { xs: 26, sm: 28 },
                color: '#475569',
                bgcolor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                '&:hover': {
                  color: '#0f172a',
                  bgcolor: alpha('#0f172a', 0.06),
                  borderColor: '#cbd5e1',
                },
              }}
            >
              <EditIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete area">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(area.id); }}
              sx={{
                width: { xs: 26, sm: 28 },
                height: { xs: 26, sm: 28 },
                color: '#94a3b8',
                bgcolor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                '&:hover': {
                  color: '#f43f5e',
                  bgcolor: 'rgba(244,63,94,0.08)',
                  borderColor: 'rgba(244,63,94,0.2)',
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default AreaCard;
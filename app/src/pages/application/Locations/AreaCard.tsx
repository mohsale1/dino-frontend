import React from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  TableRestaurant as TableRestaurantIcon,
} from '@mui/icons-material';
import type { ServiceArea } from '../../../features/locations/types';

// ── Accent palette (deterministic by name hash) ───────────────────────────────

const ACCENTS = [
  { primary: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)'  },
  { primary: '#0ea5e9', bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.2)'  },
  { primary: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  { primary: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  { primary: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
  { primary: '#a855f7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.2)'  },
  { primary: '#ec4899', bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)'  },
  { primary: '#14b8a6', bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.2)'  },
];

const getAccent = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return ACCENTS[Math.abs(h) % ACCENTS.length];
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AreaCardProps {
  area: ServiceArea;
  locationCount?: number;
  onEdit: (area: ServiceArea) => void;
  onDelete: (areaId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const AreaCard: React.FC<AreaCardProps> = ({
  area,
  locationCount = 0,
  onEdit,
  onDelete,
}) => {
  const ac       = getAccent(area.name);
  const inactive = !area.isActive;

  // When inactive, use a neutral grey palette
  const palette = inactive
    ? { primary: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)' }
    : ac;

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        opacity: inactive ? 0.85 : 1,
        transition: 'box-shadow 0.15s',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          borderColor: '#bdbdbd',
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: palette.bg,
          borderBottom: `1px solid ${palette.border}`,
          px: 2.5,
          pt: 2.5,
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        {/* Icon box */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: '#ffffff',
            border: `1px solid ${palette.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TableRestaurantIcon sx={{ fontSize: 22, color: palette.primary }} />
        </Box>

        {/* Name + table count chip */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: '#1C1C1E',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {area.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              label={`${locationCount} ${locationCount === 1 ? 'table' : 'tables'}`}
              size="small"
              sx={{
                alignSelf: 'flex-start',
                height: 18,
                fontSize: '0.68rem',
                fontWeight: 600,
                bgcolor: '#ffffff',
                border: `1px solid ${palette.border}`,
                color: palette.primary,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            {inactive && (
              <Chip
                label="Inactive"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(156,163,175,0.3)',
                  color: '#9ca3af',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Description ── */}
      <Box sx={{ flex: 1, px: 2.5, pt: 1.5, pb: 2 }}>
        {area.description ? (
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: '#666666',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {area.description}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '0.8125rem', color: '#999999', fontStyle: 'italic' }}>
            No description
          </Typography>
        )}
      </Box>

      {/* ── Actions ── */}
      <Box
        sx={{
          borderTop: '1px solid #e0e0e0',
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.5,
        }}
      >
        <Tooltip title="Edit area" arrow>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(area); }}
            sx={{
              borderRadius: 1.5,
              color: '#999999',
              '&:hover': { color: '#1C1C1E', bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete area" arrow>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(area.id); }}
            sx={{
              borderRadius: 1.5,
              color: '#999999',
              '&:hover': { color: '#EB0000', bgcolor: 'rgba(235,0,0,0.06)' },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default AreaCard;

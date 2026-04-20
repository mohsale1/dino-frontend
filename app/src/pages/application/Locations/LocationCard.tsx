/**
 * LocationCard Component
 *
 * Professional location card matching the AreaCard design language:
 * gradient header band (color-coded by status), stat strip, body, action row.
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
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
  CheckCircle,
  Cancel,
  Schedule,
  Build,
  PowerSettingsNew,
} from '@mui/icons-material';
import type { ServiceLocation, LocationStatus } from '../../../features/locations/types';

// ─── Status Config ─────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  Icon: React.ElementType;
  gradientFrom: string;
  gradientTo: string;
  border: string;
  soft: string;
  text: string;
}

const STATUS_CONFIG: Record<LocationStatus, StatusConfig> = {
  available: {
    label: 'Available',
    Icon: CheckCircle,
    gradientFrom: '#10b981',
    gradientTo: '#34d399',
    border: 'rgba(16,185,129,0.25)',
    soft: 'rgba(16,185,129,0.1)',
    text: '#059669',
  },
  occupied: {
    label: 'Occupied',
    Icon: Cancel,
    gradientFrom: '#ef4444',
    gradientTo: '#f87171',
    border: 'rgba(239,68,68,0.25)',
    soft: 'rgba(239,68,68,0.1)',
    text: '#dc2626',
  },
  reserved: {
    label: 'Reserved',
    Icon: Schedule,
    gradientFrom: '#f59e0b',
    gradientTo: '#fbbf24',
    border: 'rgba(245,158,11,0.25)',
    soft: 'rgba(245,158,11,0.1)',
    text: '#d97706',
  },
  maintenance: {
    label: 'Maintenance',
    Icon: Build,
    gradientFrom: '#64748b',
    gradientTo: '#94a3b8',
    border: 'rgba(100,116,139,0.25)',
    soft: 'rgba(100,116,139,0.1)',
    text: '#475569',
  },
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface LocationCardProps {
  location: ServiceLocation;
  areaName?: string;
  onEdit: (location: ServiceLocation) => void;
  onDelete: (locationId: string) => void;
  onToggleStatus: (locationId: string) => void;
  onViewQR: (location: ServiceLocation) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  areaName,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewQR,
}) => {
  const sc = STATUS_CONFIG[location.status] ?? STATUS_CONFIG.available;
  const isInactive = !location.isActive;

  const gradientFrom = isInactive ? '#e2e8f0' : sc.gradientFrom;
  const gradientTo   = isInactive ? '#cbd5e1' : sc.gradientTo;
  const accentBorder = isInactive ? '#e2e8f0'  : sc.border;
  const accentSoft   = isInactive ? '#f1f5f9'  : sc.soft;
  const accentText   = isInactive ? '#94a3b8'  : sc.text;

  const displayName = location.name || location.identifier;
  const { Icon: StatusIcon } = sc;

  return (
    <Box
      onClick={() => onViewQR(location)}
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
        opacity: isInactive ? 0.72 : 1,
        transition: 'all 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: isInactive
            ? '0 8px 24px rgba(0,0,0,0.08)'
            : `0 8px 28px ${alpha(gradientFrom, 0.22)}`,
          borderColor: isInactive ? '#cbd5e1' : alpha(gradientFrom, 0.4),
        },
      }}
    >
      {/* ── Gradient header ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(135deg,${gradientFrom} 0%,${gradientTo} 100%)`,
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
          {/* Left: location name + area subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.85rem', sm: '0.9375rem' },
                color: '#ffffff',
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </Typography>
            {areaName && (
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {areaName}
              </Typography>
            )}
          </Box>

          {/* Right: capacity badge (glassmorphic) */}
          {location.capacity != null && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                px: { xs: 0.75, sm: 1 },
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(4px)',
                flexShrink: 0,
              }}
            >
              <PeopleIcon sx={{ fontSize: { xs: 11, sm: 12 }, color: 'rgba(255,255,255,0.95)' }} />
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.95)',
                  lineHeight: 1,
                }}
              >
                {location.capacity}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Stat chip — floats over header bottom ─────────────────────────────── */}
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
            border: `1px solid ${accentBorder}`,
            borderRadius: 1.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 0.75,
              bgcolor: accentSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <StatusIcon sx={{ fontSize: 13, color: accentText }} />
          </Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', lineHeight: 1 }}
          >
            {isInactive ? 'Inactive' : sc.label}
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
          gap: { xs: 0.5, sm: 0.75 },
          minWidth: 0,
        }}
      >
        {/* Identifier badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: { xs: 0.75, sm: 0.875 },
            py: { xs: 0.3, sm: 0.375 },
            bgcolor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 1,
            alignSelf: 'flex-start',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <LocationOnIcon sx={{ fontSize: 11, color: '#64748b', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#475569',
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {location.identifier}
          </Typography>
        </Box>

        {/* Description */}
        {location.description ? (
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
            {location.description}
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
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: '#cbd5e1',
            fontWeight: 500,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Click to scan
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* Toggle active/inactive */}
          <Tooltip title={location.isActive ? 'Deactivate' : 'Activate'}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onToggleStatus(location.id); }}
              sx={{
                width: { xs: 26, sm: 28 },
                height: { xs: 26, sm: 28 },
                color: location.isActive ? '#059669' : '#94a3b8',
                bgcolor: location.isActive ? 'rgba(16,185,129,0.08)' : '#f1f5f9',
                border: `1px solid ${location.isActive ? 'rgba(16,185,129,0.2)' : '#e2e8f0'}`,
                borderRadius: 1,
                '&:hover': {
                  color: location.isActive ? '#047857' : '#059669',
                  bgcolor: location.isActive
                    ? 'rgba(16,185,129,0.14)'
                    : 'rgba(16,185,129,0.08)',
                  borderColor: 'rgba(16,185,129,0.3)',
                },
              }}
            >
              <PowerSettingsNew sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>

          {/* Edit */}
          <Tooltip title="Edit location">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(location); }}
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

          {/* Delete */}
          <Tooltip title="Delete location">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(location.id); }}
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

export default LocationCard;
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle,
  Cancel,
  Schedule,
  Build,
  PowerSettingsNew,
  QrCode2,
} from '@mui/icons-material';
import type { ServiceLocation, LocationStatus } from '../../../features/locations/types';

// ── Status config ─────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  Icon: React.ElementType;
  border: string;
  soft: string;
  text: string;
  bar: string;
}

const STATUS_CONFIG: Record<LocationStatus, StatusConfig> = {
  available:   { label: 'Available',   Icon: CheckCircle, bar: '#10b981', text: '#059669', soft: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  occupied:    { label: 'Occupied',    Icon: Cancel,      bar: '#ef4444', text: '#dc2626', soft: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
  reserved:    { label: 'Reserved',    Icon: Schedule,    bar: '#f59e0b', text: '#d97706', soft: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  maintenance: { label: 'Maintenance', Icon: Build,       bar: '#94a3b8', text: '#475569', soft: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' },
};

const INACTIVE: Pick<StatusConfig, 'label' | 'bar' | 'text' | 'soft' | 'border'> = {
  label: 'Inactive', bar: '#cbd5e1', text: '#94a3b8',
  soft: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface LocationCardProps {
  location: ServiceLocation;
  areaName?: string;
  onEdit: (location: ServiceLocation) => void;
  onDelete: (locationId: string) => void;
  onToggleStatus: (locationId: string) => void;
  onViewQR: (location: ServiceLocation) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  areaName,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewQR,
}) => {
  const sc          = STATUS_CONFIG[location.status] ?? STATUS_CONFIG.available;
  const isInactive  = !location.isActive;
  const displayName = location.name || location.identifier;
  const chip        = isInactive ? INACTIVE : sc;
  const barColor    = isInactive ? INACTIVE.bar : sc.bar;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, sm: 3 },
        py: 1.75,
        bgcolor: '#ffffff',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: '#f8fafc' },
      }}
    >
      {/* ── Status accent bar ── */}
      <Box
        sx={{
          width: 3,
          height: 36,
          borderRadius: '2px',
          bgcolor: barColor,
          flexShrink: 0,
          mr: 2,
          alignSelf: 'center',
        }}
      />

      {/* ── Middle: name + meta ── */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        {/* Row 1: name + status chip + capacity chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#111827',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayName}
          </Typography>

          <Chip
            label={chip.label}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 600,
              bgcolor: chip.soft,
              color: chip.text,
              border: `1px solid ${chip.border}`,
              borderRadius: '6px',
              '& .MuiChip-label': { px: '8px' },
            }}
          />

          {location.capacity != null && (
            <Chip
              label={`${location.capacity} seats`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                borderRadius: '6px',
                bgcolor: '#f8fafc',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                '& .MuiChip-label': { px: '8px' },
              }}
            />
          )}
        </Box>

        {/* Row 2: identifier · area */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              fontFamily: 'monospace',
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {location.identifier}
          </Typography>

          {areaName && (
            <>
              <Box
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  bgcolor: '#d1d5db',
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1 }}>
                {areaName}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* ── Actions ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          flexShrink: 0,
          ml: 1,
        }}
      >
        <Tooltip title="View QR code" placement="top" arrow>
          <IconButton
            size="small"
            onClick={() => onViewQR(location)}
            sx={{
              width: 32, height: 32, borderRadius: '7px', color: '#9ca3af',
              '&:hover': { color: '#1976D2', bgcolor: 'rgba(25,118,210,0.08)' },
            }}
          >
            <QrCode2 sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={isInactive ? 'Activate' : 'Toggle status'} placement="top" arrow>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onToggleStatus(location.id); }}
            sx={{
              width: 32, height: 32, borderRadius: '7px',
              color: location.isActive ? '#10b981' : '#9ca3af',
              '&:hover': {
                color: location.isActive ? '#059669' : '#10b981',
                bgcolor: 'rgba(16,185,129,0.08)',
              },
            }}
          >
            <PowerSettingsNew sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit" placement="top" arrow>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(location); }}
            sx={{
              width: 32, height: 32, borderRadius: '7px', color: '#9ca3af',
              '&:hover': { color: '#1976D2', bgcolor: 'rgba(25,118,210,0.08)' },
            }}
          >
            <EditIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete" placement="top" arrow>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(location.id); }}
            sx={{
              width: 32, height: 32, borderRadius: '7px', color: '#9ca3af',
              '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' },
            }}
          >
            <DeleteIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};


export default LocationCard;

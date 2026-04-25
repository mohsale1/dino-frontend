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

// ─── Status Config ─────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  Icon: React.ElementType;
  border: string;
  soft: string;
  text: string;
}

const STATUS_CONFIG: Record<LocationStatus, StatusConfig> = {
  available: {
    label: 'Available',
    Icon: CheckCircle,
    border: 'rgba(16,185,129,0.25)',
    soft: 'rgba(16,185,129,0.1)',
    text: '#059669',
  },
  occupied: {
    label: 'Occupied',
    Icon: Cancel,
    border: 'rgba(239,68,68,0.25)',
    soft: 'rgba(239,68,68,0.1)',
    text: '#dc2626',
  },
  reserved: {
    label: 'Reserved',
    Icon: Schedule,
    border: 'rgba(245,158,11,0.25)',
    soft: 'rgba(245,158,11,0.1)',
    text: '#d97706',
  },
  maintenance: {
    label: 'Maintenance',
    Icon: Build,
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
  const displayName = location.name || location.identifier;
  const { Icon: StatusIcon } = sc;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        bgcolor: '#ffffff',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: 'rgba(0,166,202,0.04)' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        {/* Left: status icon box + info */}
        <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flex: 1, minWidth: 0, alignItems: 'center' }}>
          {/* Status icon box */}
          <Box
            sx={{
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              borderRadius: '10px',
              bgcolor: sc.soft,
              border: `1px solid ${sc.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: sc.text,
              flexShrink: 0,
            }}
          >
            <StatusIcon sx={{ fontSize: 20 }} />
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Name + status chip + capacity chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
              <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem', lineHeight: 1.3 }}>
                {displayName}
              </Typography>
              <Chip
                label={isInactive ? 'Inactive' : sc.label}
                size="small"
                sx={{
                  bgcolor: sc.soft,
                  color: sc.text,
                  border: `1px solid ${sc.border}`,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  height: 22,
                }}
              />
              {location.capacity != null && (
                <Chip
                  label={`${location.capacity} seats`}
                  size="small"
                  sx={{
                    bgcolor: '#F7F9FA',
                    color: '#666666',
                    border: '1px solid #e0e0e0',
                    fontWeight: 500,
                    fontSize: '0.72rem',
                    height: 22,
                  }}
                />
              )}
            </Box>

            {/* Identifier + area */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: '#999999', fontFamily: 'monospace', fontWeight: 600 }}>
                {location.identifier}
              </Typography>
              {areaName && (
                <>
                  <Typography sx={{ color: '#e0e0e0' }}>·</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#666666' }}>{areaName}</Typography>
                </>
              )}
            </Box>

            {/* Description */}
            {location.description && (
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: '#666666',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {location.description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right: actions */}
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, alignItems: 'center' }}>
          <Tooltip title="View QR">
            <IconButton
              size="small"
              onClick={() => onViewQR(location)}
              sx={{
                color: '#999999',
                borderRadius: '8px',
                '&:hover': { color: '#1976D2', bgcolor: 'rgba(25,118,210,0.08)' },
              }}
            >
              <QrCode2 sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={location.isActive ? 'Deactivate' : 'Activate'}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onToggleStatus(location.id); }}
              sx={{
                color: location.isActive ? '#059669' : '#999999',
                borderRadius: '8px',
                '&:hover': {
                  color: location.isActive ? '#047857' : '#059669',
                  bgcolor: 'rgba(16,185,129,0.08)',
                },
              }}
            >
              <PowerSettingsNew sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(location); }}
              sx={{
                color: '#999999',
                borderRadius: '8px',
                '&:hover': { color: '#1976D2', bgcolor: 'rgba(25,118,210,0.08)' },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(location.id); }}
              sx={{
                color: '#999999',
                borderRadius: '8px',
                '&:hover': { color: '#f43f5e', bgcolor: 'rgba(244,63,94,0.08)' },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default LocationCard;

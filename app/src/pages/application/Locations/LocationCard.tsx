/**
 * LocationCard Component - Clean Professional Design
 *
 * Display individual location information
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff,
  QrCode,
  Print,
  People,
  CheckCircle,
  Cancel,
  Schedule,
  Build,
} from '@mui/icons-material';
import type { ServiceLocation, LocationStatus } from '../../../features/locations/types';

interface LocationCardProps {
  location: ServiceLocation;
  areaName?: string;
  onEdit: (location: ServiceLocation) => void;
  onDelete: (locationId: string) => void;
  onToggleStatus: (locationId: string) => void;
  onGenerateQR: (locationId: string) => void;
  onPrintQR: (locationId: string) => void;
  onViewQR: (location: ServiceLocation) => void;
}

const getStatusConfig = (status: LocationStatus) => {
  const configs: Record<LocationStatus, { label: string; icon: React.ReactElement; bg: string; color: string; border: string }> = {
    available: {
      label: 'Available',
      icon: <CheckCircle sx={{ fontSize: 16 }} />,
      bg: 'rgba(16,185,129,0.08)',
      color: '#059669',
      border: 'rgba(16,185,129,0.2)',
    },
    occupied: {
      label: 'Occupied',
      icon: <Cancel sx={{ fontSize: 16 }} />,
      bg: 'rgba(239,68,68,0.08)',
      color: '#dc2626',
      border: 'rgba(239,68,68,0.2)',
    },
    reserved: {
      label: 'Reserved',
      icon: <Schedule sx={{ fontSize: 16 }} />,
      bg: 'rgba(245,158,11,0.08)',
      color: '#d97706',
      border: 'rgba(245,158,11,0.2)',
    },
    maintenance: {
      label: 'Maintenance',
      icon: <Build sx={{ fontSize: 16 }} />,
      bg: 'rgba(100,116,139,0.08)',
      color: '#475569',
      border: 'rgba(100,116,139,0.2)',
    },
  };
  return configs[status];
};

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  areaName,
  onEdit,
  onDelete,
  onToggleStatus,
  onGenerateQR,
  onPrintQR,
  onViewQR,
}) => {
  const statusConfig = getStatusConfig(location.status);

  return (
    <Paper
      elevation={0}
      onClick={() => onViewQR(location)}
      sx={{
        p: { xs: 2, sm: 2.5 },
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: location.isActive ? 1 : 0.6,
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          borderColor: '#cbd5e1',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '1rem',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {location.name || location.identifier}
          </Typography>
          {areaName && (
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
              {areaName}
            </Typography>
          )}
        </Box>
        <Tooltip title={location.isActive ? 'Active' : 'Inactive'}>
          <IconButton
            size="small"
            onClick={() => onToggleStatus(location.id)}
            sx={{
              color: location.isActive ? '#059669' : '#94a3b8',
              '&:hover': {
                backgroundColor: location.isActive ? 'rgba(16,185,129,0.08)' : '#f8fafc',
              },
            }}
          >
            {location.isActive ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5 } }}>
        {/* Capacity */}
        {location.capacity && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 1.5,
            }}
          >
            <People sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600, fontSize: '0.8125rem' }}>
              Capacity: {location.capacity}
            </Typography>
          </Box>
        )}

        {/* Status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            backgroundColor: statusConfig.bg,
            border: `1px solid ${statusConfig.border}`,
            borderRadius: 1.5,
          }}
        >
          {statusConfig.icon}
          <Typography variant="body2" sx={{ color: statusConfig.color, fontWeight: 600, fontSize: '0.8125rem' }}>
            {statusConfig.label}
          </Typography>
        </Box>

        {/* Description */}
        {location.description && (
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontSize: '0.8125rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {location.description}
          </Typography>
        )}
      </Box>

      {/* Actions */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: 'flex',
          gap: 1,
          mt: { xs: 1.5, sm: 2 },
          pt: { xs: 1.5, sm: 2 },
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <Tooltip title="View QR Code">
          <IconButton
            size="small"
            onClick={() => onGenerateQR(location.id)}
            sx={{
              color: '#64748b',
              '&:hover': {
                color: '#0f172a',
                bgcolor: 'rgba(15,23,42,0.06)',
              },
            }}
          >
            <QrCode sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print QR">
          <IconButton
            size="small"
            onClick={() => onPrintQR(location.id)}
            sx={{
              color: '#64748b',
              '&:hover': {
                color: '#0f172a',
                bgcolor: 'rgba(15,23,42,0.06)',
              },
            }}
          >
            <Print sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Edit location">
          <IconButton
            size="small"
            onClick={() => onEdit(location)}
            sx={{
              color: '#64748b',
              '&:hover': {
                color: '#0f172a',
                bgcolor: 'rgba(15,23,42,0.06)',
              },
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete location">
          <IconButton
            size="small"
            onClick={() => onDelete(location.id)}
            sx={{
              color: '#64748b',
              '&:hover': {
                color: '#f43f5e',
                bgcolor: 'rgba(244,63,94,0.08)',
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default LocationCard;
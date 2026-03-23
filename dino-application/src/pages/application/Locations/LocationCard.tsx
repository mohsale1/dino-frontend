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
  Chip,
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
}

const getStatusConfig = (status: LocationStatus) => {
  const configs = {
    available: { 
      label: 'Available', 
      icon: <CheckCircle sx={{ fontSize: 16 }} />,
      bg: '#dcfce7',
      color: '#166534',
      border: '#bbf7d0',
    },
    occupied: { 
      label: 'Occupied', 
      icon: <Cancel sx={{ fontSize: 16 }} />,
      bg: '#fee2e2',
      color: '#991b1b',
      border: '#fecaca',
    },
    reserved: { 
      label: 'Reserved', 
      icon: <Schedule sx={{ fontSize: 16 }} />,
      bg: '#fef3c7',
      color: '#92400e',
      border: '#fde68a',
    },
    maintenance: { 
      label: 'Maintenance', 
      icon: <Build sx={{ fontSize: 16 }} />,
      bg: '#f3f4f6',
      color: '#374151',
      border: '#e5e7eb',
    },
  };
  return configs[status] || configs.available;
};

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  areaName,
  onEdit,
  onDelete,
  onToggleStatus,
  onGenerateQR,
  onPrintQR,
}) => {
  const statusConfig = getStatusConfig(location.status);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: location.isActive ? 1 : 0.6,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
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
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
              {areaName}
            </Typography>
          )}
        </Box>
        <Tooltip title={location.isActive ? 'Active' : 'Inactive'}>
          <IconButton
            size="small"
            onClick={() => onToggleStatus(location.id)}
            sx={{
              color: location.isActive ? '#166534' : '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            {location.isActive ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Capacity */}
        {location.capacity && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 1.5,
            }}
          >
            <People sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.8125rem' }}>
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
              color: '#6b7280',
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
        sx={{
          display: 'flex',
          gap: 1,
          mt: 2,
          pt: 2,
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <Tooltip title="Generate QR">
          <IconButton
            size="small"
            onClick={() => onGenerateQR(location.id)}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                color: '#1a1a1a',
              },
            }}
          >
            <QrCode fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print QR">
          <IconButton
            size="small"
            onClick={() => onPrintQR(location.id)}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                color: '#1a1a1a',
              },
            }}
          >
            <Print fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Edit location">
          <IconButton
            size="small"
            onClick={() => onEdit(location)}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                color: '#1a1a1a',
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete location">
          <IconButton
            size="small"
            onClick={() => onDelete(location.id)}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#fee2e2',
                color: '#991b1b',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default LocationCard;
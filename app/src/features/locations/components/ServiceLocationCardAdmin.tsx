import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Delete,
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
import { IconButton, Chip } from '@mui/material';
import type { ServiceLocation, LocationStatus } from '../types';

export interface ServiceLocationCardAdminProps {
  location: ServiceLocation;
  areaName?: string;
  onToggleStatus?: (locationId: string) => void;
  onGenerateQR?: (locationId: string) => void;
  onPrintQR?: (locationId: string) => void;
  onEdit?: (location: ServiceLocation) => void;
  onDelete?: (locationId: string) => void;
  showActions?: boolean;
}

const getStatusConfig = (status: LocationStatus) => {
  const configs: Record<LocationStatus, { label: string; color: 'success' | 'error' | 'warning' | 'default'; icon: React.ReactElement }> = {
    available: { label: 'Available', color: 'success' as const, icon: <CheckCircle /> },
    occupied: { label: 'Occupied', color: 'error' as const, icon: <Cancel /> },
    reserved: { label: 'Reserved', color: 'warning' as const, icon: <Schedule /> },
    maintenance: { label: 'Maintenance', color: 'default' as const, icon: <Build /> },
  };
  return configs[status];
};

export const ServiceLocationCardAdmin: React.FC<ServiceLocationCardAdminProps> = ({
  location,
  areaName,
  onToggleStatus,
  onGenerateQR,
  onPrintQR,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const theme = useTheme();
  const statusConfig = getStatusConfig(location.status);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'grey.200',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        borderLeft: `4px solid`,
        borderLeftColor: `${statusConfig.color}.main`,
        opacity: location.isActive ? 1 : 0.6,
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight="700"
              color="text.primary"
              noWrap
              sx={{
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                mb: 0.25,
              }}
            >
              {location.name || `Location ${location.identifier}`}
            </Typography>
            {areaName && (
              <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.75rem' }}>
                {areaName}
              </Typography>
            )}
          </Box>

          {onToggleStatus && (
            <IconButton
              size="small"
              onClick={() => onToggleStatus(location.id)}
              sx={{
                color: location.isActive ? 'success.main' : 'text.disabled',
                width: 28,
                height: 28,
              }}
            >
              {location.isActive ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
            </IconButton>
          )}
        </Stack>

        {/* Content */}
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          {/* Capacity */}
          {location.capacity && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.25,
                backgroundColor: 'grey.50',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'grey.100',
              }}
            >
              <People sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="body2" color="text.primary" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                {location.capacity} capacity
              </Typography>
            </Box>
          )}

          {/* Status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              backgroundColor: 'grey.50',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'grey.100',
            }}
          >
            {React.cloneElement(statusConfig.icon, {
              sx: { fontSize: 16, color: `${statusConfig.color}.main` },
            })}
            <Chip label={statusConfig.label} color={statusConfig.color as any} size="small" />
          </Box>

          {/* Description */}
          {location.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
              }}
            >
              {location.description}
            </Typography>
          )}
        </Stack>

        {showActions && (
          <>
            <Divider sx={{ my: 1.5 }} />

            {/* Actions */}
            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Stack direction="row" spacing={0.75}>
                {onGenerateQR && (
                  <IconButton
                    size="small"
                    onClick={() => onGenerateQR(location.id)}
                    sx={{
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <QrCode sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
                {onPrintQR && (
                  <IconButton
                    size="small"
                    onClick={() => onPrintQR(location.id)}
                    sx={{
                      color: 'text.secondary',
                      backgroundColor: 'grey.100',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'grey.200',
                      },
                    }}
                  >
                    <Print sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Stack>

              <Stack direction="row" spacing={0.75}>
                {onEdit && (
                  <IconButton
                    size="small"
                    onClick={() => onEdit(location)}
                    sx={{
                      color: 'text.secondary',
                      backgroundColor: 'grey.100',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'grey.200',
                        color: 'primary.main',
                      },
                    }}
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton
                    size="small"
                    onClick={() => onDelete(location.id)}
                    sx={{
                      color: 'text.secondary',
                      backgroundColor: 'grey.100',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: 'error.main',
                        borderColor: alpha(theme.palette.error.main, 0.2),
                      },
                    }}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceLocationCardAdmin;

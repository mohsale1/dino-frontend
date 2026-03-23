import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import { People, CheckCircle, Cancel, Schedule, Build } from '@mui/icons-material';
import { ServiceLocation, LocationStatus } from '../types';

export interface ServiceLocationCardProps {
  location: ServiceLocation;
  areaName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

const getStatusConfig = (status: LocationStatus) => {
  const configs = {
    available: { label: 'Available', color: 'success' as const, icon: <CheckCircle /> },
    occupied: { label: 'Occupied', color: 'error' as const, icon: <Cancel /> },
    reserved: { label: 'Reserved', color: 'warning' as const, icon: <Schedule /> },
    maintenance: { label: 'Maintenance', color: 'default' as const, icon: <Build /> },
  };
  return configs[status] || configs.available;
};

export const ServiceLocationCard: React.FC<ServiceLocationCardProps> = ({
  location,
  areaName,
  onClick,
}) => {
  const statusConfig = getStatusConfig(location.status);

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        opacity: location.isActive ? 1 : 0.6,
        transition: 'all 0.2s',
        borderLeft: 4,
        borderLeftColor: `${statusConfig.color}.main`,
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {location.name || `Location ${location.identifier}`}
            </Typography>
            {areaName && (
              <Typography variant="body2" color="text.secondary">
                {areaName}
              </Typography>
            )}
          </Box>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            icon={React.cloneElement(statusConfig.icon, { fontSize: 'small' })}
          />
        </Box>

        {location.capacity && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <People fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Capacity: {location.capacity}
            </Typography>
          </Box>
        )}

        {location.description && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            {location.description}
          </Typography>
        )}

        {!location.isActive && (
          <Chip label="Inactive" size="small" color="default" sx={{ mt: 1 }} />
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceLocationCard;
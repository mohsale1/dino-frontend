/**
 * AreaCard Component - Clean Professional Design
 * 
 * Display individual area information
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
  Business,
} from '@mui/icons-material';
import type { ServiceArea } from '../../../features/locations/types';

interface AreaCardProps {
  area: ServiceArea;
  onEdit: (area: ServiceArea) => void;
  onDelete: (areaId: string) => void;
}

const AreaCard: React.FC<AreaCardProps> = ({
  area,
  onEdit,
  onDelete,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
      onClick={() => onEdit(area)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Business sx={{ fontSize: 24, color: '#6b7280' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              fontSize: '1.125rem',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {area.name}
          </Typography>
          {area.description && (
            <Typography
              variant="body2"
              sx={{
                color: '#6b7280',
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {area.description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
          mt: 'auto',
          pt: 2,
          borderTop: '1px solid #f3f4f6',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="Edit area">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(area);
            }}
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
        <Tooltip title="Delete area">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(area.id);
            }}
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

export default AreaCard;
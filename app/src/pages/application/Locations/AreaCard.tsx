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
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
            bgcolor: 'rgba(25,118,210,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Business sx={{ fontSize: 24, color: '#1976d2' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
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
                color: '#64748b',
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
          borderTop: '1px solid #f1f5f9',
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
              color: '#64748b',
              '&:hover': {
                bgcolor: 'rgba(25,118,210,0.08)',
                color: '#1976d2',
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
              color: '#64748b',
              '&:hover': {
                bgcolor: 'rgba(239,68,68,0.08)',
                color: '#dc2626',
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
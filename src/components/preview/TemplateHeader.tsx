import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { Star, LocationOn, Schedule } from '@mui/icons-material';
import { MenuTemplateConfig } from '../../config/menuTemplates';

interface TemplateHeaderProps {
  template: MenuTemplateConfig;
  venueName: string;
  tableNumber: string;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  template,
  venueName,
  tableNumber,
}) => {
  // Classic: Logo + Full venue info + Rating + Location + Delivery time
  if (template.id === 'classic') {
    return (
      <Box
        sx={{
          background: template.hero.background,
          color: 'white',
          px: 2,
          py: 1.5,
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: alpha('#fff', 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 1,
            border: `2px solid ${alpha('#fff', 0.3)}`,
          }}
        >
          <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1rem' }}>
            {venueName.charAt(0)}
          </Typography>
        </Box>

        <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1rem', mb: 0.5 }}>
          {venueName}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9, display: 'block', mb: 1 }}>
          Indian • Chinese • Continental
        </Typography>

        {/* Full info with rating, location, delivery */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star sx={{ fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              4.5 (200+)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              Hyderabad
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              25-30 min
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Modern: No logo + Minimal info (just venue name & table)
  if (template.id === 'modern') {
    return (
      <Box
        sx={{
          background: template.hero.background,
          color: 'white',
          px: 2,
          py: 1.5,
          textAlign: 'left',
        }}
      >
        <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.125rem', mb: 0.25 }}>
          {venueName}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.85 }}>
          Table {tableNumber}
        </Typography>
      </Box>
    );
  }

  // Minimal: Text-only header + No logo + No extra details
  if (template.id === 'minimal') {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: `1px solid ${alpha(template.colors.primary, 0.1)}`,
          px: 2,
          py: 1.5,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h6"
          fontWeight="500"
          sx={{
            fontSize: '1rem',
            color: template.colors.textPrimary,
            fontFamily: template.typography.headerFont,
          }}
        >
          {venueName}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            color: template.colors.textSecondary,
            display: 'block',
            mt: 0.25,
          }}
        >
          Table {tableNumber}
        </Typography>
      </Box>
    );
  }

  // Elegant: Large logo + Full details + Description
  if (template.id === 'elegant') {
    return (
      <Box
        sx={{
          background: template.hero.background,
          color: 'white',
          px: 2,
          py: 2,
          textAlign: 'center',
        }}
      >
        {/* Large Logo */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: alpha('#fff', 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 1.5,
            border: `3px solid ${alpha('#fff', 0.25)}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <Typography variant="h4" fontWeight="700" sx={{ fontSize: '1rem' }}>
            {venueName.charAt(0)}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          fontWeight="700"
          sx={{
            fontSize: '1rem',
            mb: 0.5,
            fontFamily: template.typography.headerFont,
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontSize: '0.8125rem',
            opacity: 0.9,
            mb: 1.5,
            fontStyle: 'italic',
          }}
        >
          Fine Dining Experience • Table {tableNumber}
        </Typography>

        {/* Full details */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              4.5 (200+)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              Hyderabad
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              25-30 min
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Fallback (shouldn't happen)
  return null;
};

export default TemplateHeader;
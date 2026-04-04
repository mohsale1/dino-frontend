import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: SvgIconComponent;
  stats?: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        width: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        cursor: 'default',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
          borderColor: '#cbd5e1',
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box',
          '&:last-child': { pb: { xs: 2, md: 2.5 } },
        }}
      >
        {/* Icon container */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            backgroundColor: alpha('#1976D2', 0.08),
            border: `1px solid ${alpha('#1976D2', 0.15)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 20, color: '#1976D2' }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: '1rem', md: '1.0625rem' },
            color: '#0f172a',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            lineHeight: 1.7,
            fontSize: { xs: '0.875rem', md: '0.9375rem' },
            flexGrow: 1,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
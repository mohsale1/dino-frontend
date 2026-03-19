import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
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
  stats,
  delay = 0,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        width: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
        boxSizing: 'border-box',
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
          borderColor: '#cbd5e1',
          backgroundColor: '#ffffff',
          '& .feature-icon': {
            transform: 'scale(1.05)',
            backgroundColor: alpha('#0f172a', 0.1),
          },
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
        {/* Icon */}
        <Box
          className="feature-icon"
          sx={{
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            borderRadius: 2,
            backgroundColor: alpha('#0f172a', 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 2.5, md: 3 },
            transition: 'all 0.3s ease',
          }}
        >
          <Icon sx={{ fontSize: { xs: 28, md: 32 }, color: '#0f172a' }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: { xs: 1.5, md: 2 },
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
            color: '#0f172a',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            mb: { xs: 2, md: 2.5 },
            lineHeight: 1.7,
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {description}
        </Typography>

        {/* Stats Chip */}
        {stats && (
          <Chip
            label={stats}
            size="small"
            sx={{
              backgroundColor: alpha('#0f172a', 0.08),
              color: '#0f172a',
              fontWeight: 600,
              border: `1px solid ${alpha('#0f172a', 0.2)}`,
              fontSize: { xs: '0.75rem', md: '0.8125rem' },
              height: { xs: 28, md: 30 },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
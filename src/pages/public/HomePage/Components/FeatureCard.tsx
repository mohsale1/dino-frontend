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
  stats: string;
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
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(30px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:hover': {
          transform: 'translateY(-12px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: 'primary.main',
          '& .feature-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
          },
          '&::before': {
            opacity: 1,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Icon */}
        <Box
          className="feature-icon"
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            transition: 'all 0.3s ease',
          }}
        >
          <Icon sx={{ fontSize: 26, color: 'primary.main' }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: 3,
            lineHeight: 1.7,
            fontSize: { xs: '0.9375rem', md: '1rem' },
          }}
        >
          {description}
        </Typography>

        {/* Stats Chip */}
        <Chip
          label={stats}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontWeight: 600,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            fontSize: '0.8125rem',
          }}
        />
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
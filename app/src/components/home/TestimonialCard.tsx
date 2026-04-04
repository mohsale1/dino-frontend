import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  alpha,
  keyframes,
  Tooltip,
} from '@mui/material';
import { FormatQuote, VerifiedUser } from '@mui/icons-material';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface TestimonialCardProps {
  name: string;
  role?: string;
  restaurant?: string;
  location?: string;
  rating: number;
  comment: string;
  avatar?: string;
  delay?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  restaurant,
  location,
  rating,
  comment,
  avatar,
  delay = 0,
}) => {
  // Build subtitle from available fields
  const subtitle = [role, restaurant, location].filter(Boolean).join(' • ');

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        width: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        animation: `${fadeInUp} 0.6s ease-out ${delay}ms both`,
        boxSizing: 'border-box',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(25, 118, 210, 0.12)',
          borderColor: alpha('#1976D2', 0.25),
          '& .accent-bar': {
            opacity: 1,
            transform: 'scaleX(1)',
          },
          '& .quote-icon': {
            opacity: 0.12,
            transform: 'scale(1.08) rotate(-5deg)',
            color: '#1976D2',
          },
        },
      }}
    >
      {/* Top Gradient Accent Bar */}
      <Box
        className="accent-bar"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #1976D2, #42A5F5, #10b981)',
          opacity: 0,
          transform: 'scaleX(0)',
          transformOrigin: 'left center',
          transition: 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '3px 3px 0 0',
        }}
      />

      <CardContent
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          '&:last-child': {
            paddingBottom: { xs: 2.5, sm: 3, md: 3.5 },
          },
        }}
      >
        {/* Quote Icon */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 16, md: 20 },
            right: { xs: 16, md: 20 },
            opacity: 0.07,
            transition: 'all 0.35s ease',
          }}
        >
          <FormatQuote
            className="quote-icon"
            sx={{
              fontSize: { xs: 56, md: 72 },
              color: '#0f172a',
              transition: 'all 0.35s ease',
              display: 'block',
            }}
          />
        </Box>

        {/* Rating */}
        <Rating
          value={rating}
          readOnly
          size="small"
          sx={{
            mb: { xs: 2, md: 2.5 },
            '& .MuiRating-iconFilled': {
              color: '#fbbf24',
            },
            '& .MuiRating-icon': {
              fontSize: { xs: '1.125rem', md: '1.25rem' },
            },
          }}
        />

        {/* Comment */}
        <Typography
          variant="body1"
          sx={{
            color: '#334155',
            mb: { xs: 3, md: 3.5 },
            lineHeight: 1.75,
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            fontStyle: 'italic',
            position: 'relative',
            zIndex: 1,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          &ldquo;{comment}&rdquo;
        </Typography>

        {/* Divider */}
        <Box
          sx={{
            height: '1px',
            background: `linear-gradient(90deg, ${alpha('#1976D2', 0.15)}, ${alpha('#e2e8f0', 0.8)}, transparent)`,
            mb: { xs: 2.5, md: 3 },
          }}
        />

        {/* Author Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, md: 2 },
            width: '100%',
          }}
        >
          <Avatar
            src={avatar && avatar.startsWith('http') ? avatar : undefined}
            alt={name}
            sx={{
              width: { xs: 44, md: 52 },
              height: { xs: 44, md: 52 },
              border: `2px solid ${alpha('#1976D2', 0.2)}`,
              flexShrink: 0,
              backgroundColor: alpha('#1976D2', 0.1),
              color: '#1976D2',
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.125rem' },
            }}
          >
            {avatar && !avatar.startsWith('http')
              ? avatar
              : name
                  .split(' ')
                  .map((n) => n.charAt(0))
                  .join('')
                  .slice(0, 2)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Name + Verified Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: { xs: '0.9375rem', md: '1rem' },
                  lineHeight: 1.3,
                }}
              >
                {name}
              </Typography>
              <Tooltip title="Verified customer" placement="top" arrow>
                <VerifiedUser
                  sx={{
                    fontSize: '0.9375rem',
                    color: '#1976D2',
                    flexShrink: 0,
                    cursor: 'default',
                  }}
                />
              </Tooltip>
            </Box>

            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
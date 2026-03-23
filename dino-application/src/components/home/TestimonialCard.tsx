import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  alpha,
} from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

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
  const subtitle = [role, restaurant, location].filter(Boolean).join(' â€¢ ');

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
          '& .quote-icon': {
            transform: 'scale(1.05)',
            opacity: 0.15,
          },
        },
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2.5, sm: 3, md: 3.5 },
        '&:last-child': {
          paddingBottom: { xs: 2.5, sm: 3, md: 3.5 },
        },
      }}>
        {/* Quote Icon */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 16, md: 20 },
            right: { xs: 16, md: 20 },
            opacity: 0.08,
          }}
        >
          <FormatQuote
            className="quote-icon"
            sx={{
              fontSize: { xs: 56, md: 72 },
              color: '#0f172a',
              transition: 'all 0.3s ease',
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
            lineHeight: 1.7,
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            fontStyle: 'italic',
            position: 'relative',
            zIndex: 1,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          "{comment}"
        </Typography>

        {/* Author Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, width: '100%' }}>
          <Avatar
            src={avatar && avatar.startsWith('http') ? avatar : undefined}
            alt={name}
            sx={{
              width: { xs: 44, md: 52 },
              height: { xs: 44, md: 52 },
              border: `2px solid ${alpha('#0f172a', 0.15)}`,
              flexShrink: 0,
              backgroundColor: alpha('#0f172a', 0.1),
              color: '#0f172a',
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.125rem' },
            }}
          >
            {avatar && !avatar.startsWith('http') ? avatar : name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: { xs: '0.9375rem', md: '1rem' },
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {name}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
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
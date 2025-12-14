import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  useTheme,
  alpha,
} from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

interface TestimonialCardProps {
  name: string;
  role: string;
  restaurant: string;
  rating: number;
  comment: string;
  avatar: string;
  delay?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  restaurant,
  rating,
  comment,
  avatar,
  delay = 0,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        width: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: { xs: 2, md: 3 },
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
        boxSizing: 'border-box',
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
          transform: 'translateY(-8px)',
          boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: 'primary.main',
          '& .quote-icon': {
            transform: 'scale(1.1) rotate(-5deg)',
            color: 'primary.main',
          },
        },
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 },
        '&:last-child': {
          paddingBottom: { xs: 2, sm: 2.5, md: 3 },
        },
      }}>
        {/* Quote Icon */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 12, md: 16 },
            right: { xs: 12, md: 16 },
            opacity: 0.1,
          }}
        >
          <FormatQuote
            className="quote-icon"
            sx={{
              fontSize: { xs: 48, md: 64 },
              color: 'primary.main',
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
            mb: { xs: 1.5, md: 2 },
            '& .MuiRating-iconFilled': {
              color: '#FFB400',
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
            color: 'text.primary',
            mb: { xs: 2.5, md: 3 },
            lineHeight: 1.7,
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
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
            src={avatar}
            alt={name}
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              flexShrink: 0,
            }}
          >
            {name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '0.9375rem', md: '1rem' },
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {role} at {restaurant}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;

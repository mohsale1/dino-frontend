import React from 'react';
import { Box, Typography } from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

interface UnavailableViewProps {
  orgName?: string;
}

const UnavailableView: React.FC<UnavailableViewProps> = ({ orgName }) => {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        px: 3,
        py: 6,
        textAlign: 'center',
      }}
    >
      {/* Pulsing icon */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer pulse ring */}
        <Box
          sx={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: '2px solid rgba(148,163,184,0.2)',
            animation: 'pulse-ring 3s ease-in-out infinite',
            '@keyframes pulse-ring': {
              '0%': { transform: 'scale(1)', opacity: 0.6 },
              '50%': { transform: 'scale(1.18)', opacity: 0.15 },
              '100%': { transform: 'scale(1)', opacity: 0.6 },
            },
          }}
        />
        {/* Icon container */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(148,163,184,0.08)',
            border: '1.5px solid rgba(148,163,184,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StorefrontOutlinedIcon
            sx={{
              fontSize: { xs: 36, sm: 40 },
              color: '#94a3b8',
            }}
          />
        </Box>
      </Box>

      {/* Org name overline */}
      {orgName && (
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#64748b',
            mb: 1.5,
          }}
        >
          {orgName}
        </Typography>
      )}

      {/* Main heading */}
      <Typography
        sx={{
          fontSize: { xs: '1.6rem', sm: '2rem' },
          fontWeight: 800,
          color: '#f1f5f9',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          mb: 2,
        }}
      >
        We are currently closed
      </Typography>

      {/* Accent divider */}
      <Box
        sx={{
          width: 48,
          height: 3,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #475569, #94a3b8)',
          mb: 2.5,
        }}
      />

      {/* Subtext */}
      <Typography
        sx={{
          fontSize: { xs: '0.9rem', sm: '1rem' },
          color: '#64748b',
          lineHeight: 1.75,
          maxWidth: 360,
          mb: 5,
        }}
      >
        We are not operating at this moment. Please check back during our operating hours or ask our staff for assistance.
      </Typography>

      {/* Thank you footer */}
      <Typography
        sx={{
          fontSize: '0.78rem',
          color: '#334155',
          fontWeight: 500,
          letterSpacing: '0.04em',
        }}
      >
        Thank you for visiting {orgName || 'us'}
      </Typography>
    </Box>
  );
};

export default UnavailableView;
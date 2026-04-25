import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  alpha,
  Stack,
} from '@mui/material';
import {
  Business,
  Store,
  Person,
  LocationOn,
  Email,
  Phone,
  VpnKey,
} from '@mui/icons-material';
import { RegistrationFormData } from '../types';

interface ReviewStepProps {
  formData: RegistrationFormData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const SectionHeader = ({
    icon,
    title,
    accentColor = '#1976D2',
  }: {
    icon: React.ReactNode;
    title: string;
    accentColor?: string;
  }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          backgroundColor: alpha(accentColor, 0.1),
          border: `1.5px solid ${alpha(accentColor, 0.25)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700 }}>
        {title}
      </Typography>
    </Box>
  );

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
      <Box sx={{ color: '#64748b', mt: 0.5, minWidth: 20 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            display: 'block',
            mb: 0.5,
            textTransform: 'uppercase',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.6px',
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 500, lineHeight: 1.5 }}>
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );

  const cardSx = {
    p: 3,
    mb: 2.5,
    borderRadius: 3,
    border: `1px solid ${alpha('#1976D2', 0.12)}`,
    backgroundColor: '#ffffff',
    boxShadow: `0 1px 4px ${alpha('#0f172a', 0.06)}`,
  };

  return (
    <Box>
      {/* Referral */}
      {formData.referralEmailValid && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 3,
            border: `1.5px solid ${alpha('#10b981', 0.3)}`,
            backgroundColor: alpha('#10b981', 0.06),
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              backgroundColor: alpha('#10b981', 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <VpnKey sx={{ color: '#10b981', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#064e3b', fontWeight: 700 }}>
              Referred by: {formData.referredByName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#047857' }}>
              {formData.referralEmail} — agent verified
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Workspace Details */}
      <Paper elevation={0} sx={cardSx}>
        <SectionHeader
          icon={<Business sx={{ color: '#1976D2', fontSize: 22 }} />}
          title="Workspace"
        />
        <InfoRow
          icon={<Business fontSize="small" />}
          label="Workspace Name"
          value={formData.workspaceName}
        />
        {formData.workspaceDescription && (
          <InfoRow
            icon={<Business fontSize="small" />}
            label="Description"
            value={formData.workspaceDescription}
          />
        )}
      </Paper>

      {/* Persona Information */}
      <Paper elevation={0} sx={cardSx}>
        <SectionHeader
          icon={<Store sx={{ color: '#1976D2', fontSize: 22 }} />}
          title="Persona"
        />

        <InfoRow
          icon={<Store fontSize="small" />}
          label="Persona Name"
          value={formData.personaName}
        />

        {formData.personaDescription && (
          <InfoRow
            icon={<Store fontSize="small" />}
            label="Description"
            value={formData.personaDescription}
          />
        )}

        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              display: 'block',
              mb: 1,
              textTransform: 'uppercase',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.6px',
            }}
          >
            Business Details
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={formData.personaType === 0 ? 'Food & Beverage' : 'Non-Food'}
              size="small"
              sx={{
                backgroundColor: alpha('#1976D2', 0.1),
                color: '#1976D2',
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            />
            <Chip
              label={formData.orderType === 0 ? 'Online (QR)' : 'Manual (Counter)'}
              size="small"
              sx={{
                backgroundColor: alpha('#10b981', 0.1),
                color: '#059669',
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2, borderColor: alpha('#1976D2', 0.1) }} />

        <InfoRow
          icon={<LocationOn fontSize="small" />}
          label="Venue Address"
          value={`${formData.personaLocation.address}, ${formData.personaLocation.city}, ${formData.personaLocation.state} ${formData.personaLocation.postal_code}`}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow
              icon={<Phone fontSize="small" />}
              label="Phone"
              value={formData.personaPhone}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow
              icon={<Email fontSize="small" />}
              label="Email"
              value={formData.personaEmail}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Admin Account */}
      <Paper elevation={0} sx={{ ...cardSx, mb: 3 }}>
        <SectionHeader
          icon={<Person sx={{ color: '#1976D2', fontSize: 22 }} />}
          title="Administrator Account"
        />

        <InfoRow
          icon={<Person fontSize="small" />}
          label="Full Name"
          value={`${formData.adminFirstName} ${formData.adminLastName}`}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow
              icon={<Email fontSize="small" />}
              label="Email"
              value={formData.adminEmail}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow
              icon={<Phone fontSize="small" />}
              label="Phone"
              value={formData.adminPhone}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Footer Note */}
      <Box
        sx={{
          p: 2.5,
          backgroundColor: alpha('#f59e0b', 0.06),
          borderRadius: 2,
          border: `1.5px solid ${alpha('#f59e0b', 0.3)}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500, lineHeight: 1.6 }}>
          <strong>Important:</strong> By submitting this registration, you agree to our Terms of Service and Privacy Policy.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReviewStep;

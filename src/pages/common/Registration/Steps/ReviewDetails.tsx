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
  CheckCircle,
  VpnKey,
} from '@mui/icons-material';
import { RegistrationFormData } from '../types';

interface ReviewStepProps {
  formData: RegistrationFormData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          backgroundColor: alpha('#0f172a', 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700 }}>
        {title}
      </Typography>
    </Box>
  );

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
      <Box sx={{ color: '#64748b', mt: 0.5, minWidth: 24 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: '#0f172a', fontWeight: 500 }}>
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CheckCircle sx={{ fontSize: 32, color: '#0f172a' }} />
        <Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
            Review Your Information
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Please review all details carefully before submitting. You can go back to edit any information.
          </Typography>
        </Box>
      </Box>

      {/* Referral Code */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha('#10b981', 0.2)}`,
          backgroundColor: alpha('#10b981', 0.05),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VpnKey sx={{ color: '#10b981' }} />
          <Box>
            <Typography variant="body2" sx={{ color: '#064e3b', fontWeight: 600 }}>
              Referral Code: {formData.referralCode}
            </Typography>
            {formData.referredByName && (
              <Typography variant="caption" sx={{ color: '#065f46' }}>
                Referred by: {formData.referredByName}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Workspace Details */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha('#0f172a', 0.1)}`,
          backgroundColor: '#ffffff',
        }}
      >
        <SectionHeader icon={<Business sx={{ color: '#0f172a' }} />} title="Workspace" />
        <InfoRow icon={<Business fontSize="small" />} label="Workspace Name" value={formData.workspaceName} />
        {formData.workspaceDescription && (
          <InfoRow icon={<Business fontSize="small" />} label="Description" value={formData.workspaceDescription} />
        )}
      </Paper>

      {/* Billing Information */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha('#0f172a', 0.1)}`,
          backgroundColor: '#ffffff',
        }}
      >
        <SectionHeader icon={<Person sx={{ color: '#0f172a' }} />} title="Billing Information" />
        
        <InfoRow icon={<Person fontSize="small" />} label="Billing Name" value={formData.billingName} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow icon={<Email fontSize="small" />} label="Email" value={formData.billingEmail} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow icon={<Phone fontSize="small" />} label="Phone" value={formData.billingPhone} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        <InfoRow
          icon={<LocationOn fontSize="small" />}
          label="Billing Address"
          value={`${formData.billingAddress.address}, ${formData.billingAddress.city}, ${formData.billingAddress.state} ${formData.billingAddress.postal_code}`}
        />
      </Paper>

      {/* Organization Information */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha('#0f172a', 0.1)}`,
          backgroundColor: '#ffffff',
        }}
      >
        <SectionHeader icon={<Store sx={{ color: '#0f172a' }} />} title="Organization" />
        
        <InfoRow icon={<Store fontSize="small" />} label="Organization Name" value={formData.organizationName} />
        
        {formData.organizationDescription && (
          <InfoRow icon={<Store fontSize="small" />} label="Description" value={formData.organizationDescription} />
        )}

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
            Business Details
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={formData.organizationType === 0 ? 'Food & Beverage' : 'Non-Food'}
              size="small"
              sx={{
                backgroundColor: alpha('#0f172a', 0.1),
                color: '#0f172a',
                fontWeight: 600,
              }}
            />
            <Chip
              label={formData.orderType === 0 ? 'Online (QR)' : 'Manual (Counter)'}
              size="small"
              sx={{
                backgroundColor: alpha('#10b981', 0.1),
                color: '#10b981',
                fontWeight: 600,
              }}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <InfoRow
          icon={<LocationOn fontSize="small" />}
          label="Venue Address"
          value={`${formData.organizationLocation.address}, ${formData.organizationLocation.city}, ${formData.organizationLocation.state} ${formData.organizationLocation.postal_code}`}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow icon={<Phone fontSize="small" />} label="Phone" value={formData.organizationPhone} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow icon={<Email fontSize="small" />} label="Email" value={formData.organizationEmail} />
          </Grid>
        </Grid>
      </Paper>

      {/* Admin Account */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${alpha('#0f172a', 0.1)}`,
          backgroundColor: '#ffffff',
        }}
      >
        <SectionHeader icon={<Person sx={{ color: '#0f172a' }} />} title="Administrator Account" />
        
        <InfoRow
          icon={<Person fontSize="small" />}
          label="Full Name"
          value={`${formData.adminFirstName} ${formData.adminLastName}`}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow icon={<Email fontSize="small" />} label="Email" value={formData.adminEmail} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow icon={<Phone fontSize="small" />} label="Phone" value={formData.adminPhone} />
          </Grid>
        </Grid>
      </Paper>

      {/* Footer Note */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: alpha('#f59e0b', 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha('#f59e0b', 0.2)}`,
        }}
      >
        <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>
          ⚠️ <strong>Important:</strong> By submitting this registration, you agree to our Terms of Service and Privacy Policy. 
        </Typography>
      </Box>
    </Box>
  );
};

export default ReviewStep;
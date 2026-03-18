import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import { 
  Business, 
  Store, 
  Person, 
  CheckCircle, 
  Place, 
  Phone, 
  Email, 
  Category, 
  AttachMoney
} from '@mui/icons-material';
import { RegistrationFormData, priceRangeOptions } from './types';

interface ReviewStepProps {
  formData: RegistrationFormData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#64748b',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: '0.7rem'
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        {icon}
        <Typography variant="body1" sx={{ fontWeight: 500, color: '#0f172a' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: '#0f172a',
            mb: 1
          }}
        >
          Review Your Information
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ color: '#64748b' }}
        >
          Please verify all details before creating your workspace
        </Typography>
      </Box>

      {/* Workspace Details Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: 2,
          backgroundColor: '#f8fafc'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Business sx={{ color: '#0f172a', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
            Workspace Details
          </Typography>
          <CheckCircle sx={{ ml: 'auto', color: '#10b981', fontSize: 20 }} />
        </Box>
        
        <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Workspace Name" 
              value={formData.workspaceName}
            />
          </Grid>
          
          {formData.workspaceDescription && (
            <Grid item xs={12}>
              <InfoRow 
                label="Description" 
                value={formData.workspaceDescription}
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Venue Information Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: 2,
          backgroundColor: '#f8fafc'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Store sx={{ color: '#0f172a', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
            Venue Information
          </Typography>
          <CheckCircle sx={{ ml: 'auto', color: '#10b981', fontSize: 20 }} />
        </Box>
        
        <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Venue Name" 
              value={formData.venueName}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Venue Type" 
              value={formData.venueType.charAt(0).toUpperCase() + formData.venueType.slice(1).replace('_', ' ')}
              icon={<Category sx={{ fontSize: 18, color: '#64748b' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Price Range" 
              value={priceRangeOptions.find(p => p.value === formData.priceRange)?.label || formData.priceRange}
              icon={<AttachMoney sx={{ fontSize: 18, color: '#64748b' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Phone" 
              value={formData.venuePhone}
              icon={<Phone sx={{ fontSize: 18, color: '#64748b' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Email" 
              value={formData.venueEmail}
              icon={<Email sx={{ fontSize: 18, color: '#64748b' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontSize: '0.7rem'
                }}
              >
                Address
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
                <Place sx={{ fontSize: 18, color: '#64748b', mt: 0.2 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a' }}>
                    {formData.venueLocation.address}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {formData.venueLocation.city}, {formData.venueLocation.state} {formData.venueLocation.postal_code}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {formData.venueLocation.country}
                  </Typography>
                  {formData.venueLocation.landmark && (
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontStyle: 'italic', color: '#64748b' }}>
                      Near {formData.venueLocation.landmark}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          
          {formData.venueDescription && (
            <Grid item xs={12}>
              <InfoRow 
                label="Description" 
                value={formData.venueDescription}
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Owner Account Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: 2,
          backgroundColor: '#f8fafc'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Person sx={{ color: '#0f172a', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
            Owner Account
          </Typography>
          <Chip 
            label="Super Admin" 
            size="small" 
            sx={{ 
              ml: 'auto', 
              fontWeight: 600, 
              fontSize: '0.7rem',
              backgroundColor: alpha('#0f172a', 0.1),
              color: '#0f172a',
              border: '1px solid #cbd5e1',
            }}
          />
          <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
        </Box>
        
        <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Full Name" 
              value={`${formData.ownerFirstName} ${formData.ownerLastName}`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Email" 
              value={formData.ownerEmail}
              icon={<Email sx={{ fontSize: 18, color: '#64748b' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Phone" 
              value={formData.ownerPhone}
              icon={<Phone sx={{ fontSize: 18, color: '#64748b' }} />}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Info Box */}
      <Box 
        sx={{ 
          p: 2.5,
          borderRadius: 2,
          backgroundColor: '#f8fafc',
          border: '1px solid',
          borderColor: '#e2e8f0',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748b' }}>
          By creating this workspace, you'll have full administrative access to manage your business operations, including catalogs, orders, tables, and staff.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReviewStep;

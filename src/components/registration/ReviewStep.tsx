import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  Divider,
  Chip
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
    <Box sx={{ mb: 1 }}>
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.secondary',
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
        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 1
          }}
        >
          Review Your Information
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
        >
          Please verify all details before creating your workspace
        </Typography>
      </Box>

      {/* Workspace Details Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 1.5,
          mb: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Business sx={{ color: 'primary.main', fontSize: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Workspace Details
          </Typography>
          <CheckCircle sx={{ ml: 'auto', color: 'success.main', fontSize: 12 }} />
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        <Grid container spacing={1}>
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
          p: 1.5,
          mb: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Store sx={{ color: 'primary.main', fontSize: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Venue Information
          </Typography>
          <CheckCircle sx={{ ml: 'auto', color: 'success.main', fontSize: 12 }} />
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        <Grid container spacing={1}>
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
              icon={<Category sx={{ fontSize: 12, color: 'text.secondary' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Price Range" 
              value={priceRangeOptions.find(p => p.value === formData.priceRange)?.label || formData.priceRange}
              icon={<AttachMoney sx={{ fontSize: 12, color: 'text.secondary' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Phone" 
              value={formData.venuePhone}
              icon={<Phone sx={{ fontSize: 12, color: 'text.secondary' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Email" 
              value={formData.venueEmail}
              icon={<Email sx={{ fontSize: 12, color: 'text.secondary' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontSize: '0.7rem'
                }}
              >
                Address
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
                <Place sx={{ fontSize: 12, color: 'text.secondary', mt: 0.2 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {formData.venueLocation.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {formData.venueLocation.city}, {formData.venueLocation.state} {formData.venueLocation.postal_code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {formData.venueLocation.country}
                  </Typography>
                  {formData.venueLocation.landmark && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
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
          p: 1.5,
          mb: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Person sx={{ color: 'primary.main', fontSize: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Owner Account
          </Typography>
          <Chip 
            label="Super Admin" 
            size="small" 
            color="primary" 
            sx={{ ml: 'auto', fontWeight: 600, fontSize: '0.7rem' }}
          />
          <CheckCircle sx={{ color: 'success.main', fontSize: 12 }} />
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        <Grid container spacing={1}>
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
              icon={<Email sx={{ fontSize: 12, color: 'text.secondary' }} />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <InfoRow 
              label="Phone" 
              value={formData.ownerPhone}
              icon={<Phone sx={{ fontSize: 12, color: 'text.secondary' }} />}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Info Box */}
      <Box 
        sx={{ 
          p: 1.5,
          borderRadius: 1,
          backgroundColor: 'primary.50',
          border: '1px solid',
          borderColor: 'primary.200',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          By creating this workspace, you'll have full administrative access to manage your restaurant operations, including menus, orders, tables, and staff.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReviewStep;
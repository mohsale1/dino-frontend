import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  BusinessOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  EmailOutlined,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useUserData } from '../../../../contexts/application/UserData';
import { venueService } from '../../../../services/application/venue.service';

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

const BRAND = {
  primary: '#1976D2',
  primaryHover: '#1565C0',
  primaryBg: 'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#ffffff',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: BRAND.primaryBorder },
    '&.Mui-focused fieldset': { borderColor: BRAND.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND.primary },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
    <Box sx={{
      width: { xs: 34, sm: 38 }, height: { xs: 34, sm: 38 },
      borderRadius: 2, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: BRAND.primary, flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WorkspaceSectionProps {
  onSave?: () => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({ onSave }) => {
  const { userData, refreshUserData } = useUserData();
  const venue = userData?.venue ?? null;

  const [formData, setFormData] = useState({
    name:        '',
    description: '',
    address:     '',
    city:        '',
    state:       '',
    postalCode:  '',
    phone:       '',
    email:       '',
    isActive:    true,
  });

  const [saving,    setSaving]    = useState(false);
  const [dirty,     setDirty]     = useState(false);
  const [success,   setSuccess]   = useState('');
  const [error,     setError]     = useState('');

  // Sync form when venue loads
  useEffect(() => {
    if (venue) {
      setFormData({
        name:        venue.name        ?? '',
        description: (venue as any).description ?? '',
        address:     venue.location?.address    ?? '',
        city:        venue.location?.city       ?? '',
        state:       venue.location?.state      ?? '',
        postalCode:  venue.location?.postalCode ?? '',
        phone:       venue.phone       ?? '',
        email:       venue.email       ?? '',
        isActive:    venue.isActive    ?? true,
      });
      setDirty(false);
    }
  }, [venue?.id]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleCancel = () => {
    if (venue) {
      setFormData({
        name:        venue.name        ?? '',
        description: (venue as any).description ?? '',
        address:     venue.location?.address    ?? '',
        city:        venue.location?.city       ?? '',
        state:       venue.location?.state      ?? '',
        postalCode:  venue.location?.postalCode ?? '',
        phone:       venue.phone       ?? '',
        email:       venue.email       ?? '',
        isActive:    venue.isActive    ?? true,
      });
    }
    setDirty(false);
    setError('');
  };

  const handleSave = async () => {
    if (!venue?.id) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await venueService.updateVenue(venue.id, {
        name:        formData.name,
        description: formData.description,
        phone:       formData.phone,
        email:       formData.email,
        is_active:   formData.isActive,
        location: {
          address:     formData.address,
          city:        formData.city,
          state:       formData.state,
          postal_code: formData.postalCode,
        },
      } as any);
      await refreshUserData();
      setSuccess('Venue details saved successfully.');
      setDirty(false);
      onSave?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save venue details.');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Card 1: Venue Overview ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Dark band */}
        <Box sx={{
          height: 64,
          background: 'linear-gradient(135deg, #0d1b2e 0%, #1565C0 100%)',
        }} />

        {/* Overview content */}
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, pt: 1.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: 2,
            bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: BRAND.primary, flexShrink: 0,
          }}>
            <BusinessOutlined sx={{ fontSize: 26 }} />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, mb: 0.5 }}>
              {formData.name || venue?.name || 'Venue Name'}
            </Typography>
            {(formData.city || formData.state) && (
              <Typography variant="body2" sx={{ color: '#64748b', mb: 0.75 }}>
                {[formData.city, formData.state].filter(Boolean).join(', ')}
              </Typography>
            )}
            <Chip
              icon={formData.isActive ? <CheckCircle sx={{ fontSize: 14 }} /> : <Cancel sx={{ fontSize: 14 }} />}
              label={formData.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                height: 22,
                fontWeight: 600,
                fontSize: '0.72rem',
                bgcolor:      formData.isActive ? 'rgba(16,185,129,0.1)'  : 'rgba(239,68,68,0.1)',
                color:        formData.isActive ? '#10b981'               : '#ef4444',
                border: `1px solid ${formData.isActive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                '& .MuiChip-icon': { color: formData.isActive ? '#10b981' : '#ef4444' },
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* ── Card 2: Venue Details Form ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeader
            icon={<BusinessOutlined sx={{ fontSize: 20 }} />}
            title="Venue Details"
            subtitle="Manage your venue information and contact details"
          />

          {success && (
            <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2.5, borderRadius: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            {/* Venue Name */}
            <Grid item xs={12}>
              <TextField
                label="Venue Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                fullWidth size="small" required sx={fieldSx}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                fullWidth multiline rows={3} size="small" sx={fieldSx}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                fullWidth size="small" required sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlined sx={{ fontSize: 17, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                fullWidth size="small" required sx={fieldSx}
              />
            </Grid>

            {/* State */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                fullWidth size="small" required sx={fieldSx}
              />
            </Grid>

            {/* Postal Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                fullWidth size="small" sx={fieldSx}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                fullWidth size="small" sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined sx={{ fontSize: 17, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                fullWidth size="small" sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ fontSize: 17, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Venue Active toggle */}
            <Grid item xs={12}>
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: { xs: 1.5, sm: 2 }, py: { xs: 1.25, sm: 1.5 },
                borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 34, height: 34, borderRadius: 1.5,
                    bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.primary,
                  }}>
                    <BusinessOutlined sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>Venue Active</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Enable or disable venue operations</Typography>
                  </Box>
                </Box>
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>

          {/* Action buttons */}
          <Divider sx={{ mt: 3, mb: 2.5, borderColor: '#e2e8f0' }} />
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            justifyContent: { xs: 'stretch', sm: 'flex-end' },
            gap: { xs: 1.5, sm: 2 },
          }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving || !dirty}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3,
                borderColor: '#e2e8f0', color: '#475569',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !dirty || !venue?.id}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3,
                bgcolor: BRAND.primary, boxShadow: '0 4px 14px rgba(25,118,210,0.3)',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { bgcolor: BRAND.primaryHover },
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkspaceSection;
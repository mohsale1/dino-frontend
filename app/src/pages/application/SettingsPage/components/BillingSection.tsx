import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AccountBalanceOutlined } from '@mui/icons-material';
import { useUserData } from '../../../../contexts/application/UserData';
import {
  workspaceService,
  WorkspaceBilling,
  BillingDetail,
} from '../../../../services/application/workspace.service';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIMARY = '#1976D2';

const BRAND = {
  primary: PRIMARY,
  primaryHover: '#1565C0',
  primaryBg: 'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#ffffff',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: BRAND.primaryBorder },
    '&.Mui-focused fieldset': { borderColor: BRAND.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND.primary },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};


// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #e0e0e0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: { xs: 34, sm: 38 },
          height: { xs: 34, sm: 38 },
          borderRadius: 2,
          bgcolor: BRAND.primaryBg,
          border: `1px solid ${BRAND.primaryBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: BRAND.primary,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  </Box>
);

const SaveRow: React.FC<{
  saving: boolean;
  dirty: boolean;
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
}> = ({ saving, dirty, onCancel, onSave, disabled }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column-reverse', sm: 'row' },
      justifyContent: 'flex-end',
      gap: 1.5,
      mt: 0.5,
    }}
  >
    <Button
      variant="outlined"
      onClick={onCancel}
      disabled={saving || !dirty}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        px: 3,
        borderColor: '#e0e0e0',
        color: '#475569',
        width: { xs: '100%', sm: 'auto' },
        '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
      }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      onClick={onSave}
      disabled={saving || !dirty || disabled}
      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        px: 3,
        bgcolor: BRAND.primary,
        boxShadow: 'none',
        width: { xs: '100%', sm: 'auto' },
        '&:hover': { bgcolor: BRAND.primaryHover, boxShadow: 'none' },
      }}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  </Box>
);

const FieldSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={40} />
    ))}
    <Skeleton variant="rounded" height={36} width={160} sx={{ alignSelf: 'flex-end' }} />
  </Box>
);

// ---------------------------------------------------------------------------
// Tab 1 — Plan & Billing
// ---------------------------------------------------------------------------

interface PlanBillingTabProps {
  workspaceId: string;
  billing: WorkspaceBilling | null;
  loadingBilling: boolean;
}

const PlanBillingTab: React.FC<PlanBillingTabProps> = ({ workspaceId, billing, loadingBilling }) => {
  const [form, setForm] = useState<Partial<WorkspaceBilling>>({});
  const [dirty, setDirty]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (billing) {
      setForm({
        billing_name:         billing.billing_name         ?? '',
        billing_email:        billing.billing_email        ?? '',
        billing_phone:        billing.billing_phone        ?? '',
        billing_address:      billing.billing_address      ?? '',
        billing_city:         billing.billing_city         ?? '',
        billing_state:        billing.billing_state        ?? '',
        billing_country:      billing.billing_country      ?? '',
        billing_postal_code:  billing.billing_postal_code  ?? '',
      });
      setDirty(false);
    }
  }, [billing]);

  const handleChange = (field: keyof WorkspaceBilling) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setDirty(true);
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    if (billing) {
      setForm({
        billing_name:         billing.billing_name         ?? '',
        billing_email:        billing.billing_email        ?? '',
        billing_phone:        billing.billing_phone        ?? '',
        billing_address:      billing.billing_address      ?? '',
        billing_city:         billing.billing_city         ?? '',
        billing_state:        billing.billing_state        ?? '',
        billing_country:      billing.billing_country      ?? '',
        billing_postal_code:  billing.billing_postal_code  ?? '',
      });
    }
    setDirty(false);
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await workspaceService.updateWorkspaceBilling(workspaceId, form);
      setDirty(false);
      setSuccess('Billing contact updated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save billing details.');
    } finally {
      setSaving(false);
    }
  };

  const planLabel = billing?.plan ?? 'Free';
  const planStatus = billing?.plan_status;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Plan summary */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          p: 2.5,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          bgcolor: '#fafafa',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {loadingBilling ? (
          <>
            <Skeleton variant="rounded" width={120} height={28} />
            <Skeleton variant="rounded" width={100} height={28} />
            <Skeleton variant="rounded" width={140} height={28} />
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                Current Plan
              </Typography>
              <Chip
                label={planLabel}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: BRAND.primaryBg,
                  color: BRAND.primary,
                  border: `1px solid ${BRAND.primaryBorder}`,
                  borderRadius: '6px',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
              {planStatus && (
                <Chip
                  label={planStatus}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    bgcolor: planStatus === 'active' ? 'rgba(46,125,50,0.08)' : 'rgba(230,81,0,0.08)',
                    color: planStatus === 'active' ? '#2e7d32' : '#e65100',
                    border: `1px solid ${planStatus === 'active' ? 'rgba(46,125,50,0.2)' : 'rgba(230,81,0,0.2)'}`,
                    borderRadius: '6px',
                    textTransform: 'capitalize',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {billing?.billing_cycle && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Billing Cycle</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1C1E', textTransform: 'capitalize' }}>
                    {billing.billing_cycle}
                  </Typography>
                </Box>
              )}
              {billing?.next_billing_date && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Next Billing Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1C1E' }}>
                    {formatDate(billing.next_billing_date)}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>

      <Divider sx={{ borderColor: '#e0e0e0' }} />

      {/* Billing contact form */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1C1E', mb: 2 }}>
          Billing Contact
        </Typography>

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

        {loadingBilling && !billing ? (
          <FieldSkeleton rows={5} />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Billing Name"
                  value={form.billing_name ?? ''}
                  onChange={handleChange('billing_name')}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Billing Email"
                  type="email"
                  value={form.billing_email ?? ''}
                  onChange={handleChange('billing_email')}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={form.billing_phone ?? ''}
                  onChange={handleChange('billing_phone')}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address"
                  value={form.billing_address ?? ''}
                  onChange={handleChange('billing_address')}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  value={form.billing_city ?? ''}
                  onChange={handleChange('billing_city')}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="State"
                  value={form.billing_state ?? ''}
                  onChange={handleChange('billing_state')}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  value={form.billing_country ?? ''}
                  onChange={handleChange('billing_country')}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Postal Code"
                  value={form.billing_postal_code ?? ''}
                  onChange={handleChange('billing_postal_code')}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: '#e0e0e0' }} />

            <SaveRow
              saving={saving}
              dirty={dirty}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Tab 2 — Tax Details
// ---------------------------------------------------------------------------

interface TaxDetailsTabProps {
  workspaceId: string;
  detail: BillingDetail | null;
  loadingDetail: boolean;
}

const TaxDetailsTab: React.FC<TaxDetailsTabProps> = ({ workspaceId, detail, loadingDetail }) => {
  const [form, setForm]       = useState<Partial<BillingDetail>>({});
  const [dirty, setDirty]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (detail) {
      setForm({
        legal_name:    detail.legal_name    ?? '',
        trade_name:    detail.trade_name    ?? '',
        gstin:         detail.gstin         ?? '',
        pan:           detail.pan           ?? '',
        billing_email: detail.billing_email ?? '',
        billing_phone: detail.billing_phone ?? '',
        address_line1: detail.address_line1 ?? '',
        city:          detail.city          ?? '',
        state:         detail.state         ?? '',
        country:       detail.country       ?? '',
        postal_code:   detail.postal_code   ?? '',
      });
      setDirty(false);
    }
  }, [detail]);

  const handleChange = (field: keyof BillingDetail, transform?: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = transform ? transform(e.target.value) : e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
      setDirty(true);
      setSuccess('');
      setError('');
    };

  const handleCancel = () => {
    if (detail) {
      setForm({
        legal_name:    detail.legal_name    ?? '',
        trade_name:    detail.trade_name    ?? '',
        gstin:         detail.gstin         ?? '',
        pan:           detail.pan           ?? '',
        billing_email: detail.billing_email ?? '',
        billing_phone: detail.billing_phone ?? '',
        address_line1: detail.address_line1 ?? '',
        city:          detail.city          ?? '',
        state:         detail.state         ?? '',
        country:       detail.country       ?? '',
        postal_code:   detail.postal_code   ?? '',
      });
    }
    setDirty(false);
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await workspaceService.updateBillingDetail(workspaceId, form);
      setDirty(false);
      setSuccess('Tax details updated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save tax details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loadingDetail && !detail ? (
        <FieldSkeleton rows={6} />
      ) : (
        <>
          <Grid container spacing={2}>
            {/* Business identity */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Legal Name"
                value={form.legal_name ?? ''}
                onChange={handleChange('legal_name')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Trade Name"
                value={form.trade_name ?? ''}
                onChange={handleChange('trade_name')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>

            {/* Tax IDs */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="GSTIN"
                value={form.gstin ?? ''}
                onChange={handleChange('gstin', v => v.toUpperCase().slice(0, 15))}
                fullWidth
                size="small"
                inputProps={{ maxLength: 15 }}
                helperText="Format: 22AAAAA0000A1Z5"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PAN"
                value={form.pan ?? ''}
                onChange={handleChange('pan', v => v.toUpperCase().slice(0, 10))}
                fullWidth
                size="small"
                inputProps={{ maxLength: 10 }}
                helperText="Format: ABCDE1234F"
                sx={fieldSx}
              />
            </Grid>

            {/* Contact */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={form.billing_email ?? ''}
                onChange={handleChange('billing_email')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={form.billing_phone ?? ''}
                onChange={handleChange('billing_phone')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Address Line 1"
                value={form.address_line1 ?? ''}
                onChange={handleChange('address_line1')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={form.city ?? ''}
                onChange={handleChange('city')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={form.state ?? ''}
                onChange={handleChange('state')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={form.country ?? ''}
                onChange={handleChange('country')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                value={form.postal_code ?? ''}
                onChange={handleChange('postal_code')}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: '#e0e0e0' }} />

          <SaveRow
            saving={saving}
            dirty={dirty}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </>
      )}
    </Box>
  );
};



// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TAB_LABELS = ['Plan & Billing', 'Tax Details'];


const BillingSection: React.FC = () => {
  const { userData, loading: userLoading } = useUserData();
  const workspaceId = userData?.workspace?.id ?? '';

  const [activeTab, setActiveTab]           = useState(0);
  const [billing, setBilling]               = useState<WorkspaceBilling | null>(null);
  const [detail, setDetail]                 = useState<BillingDetail | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [loadingDetail, setLoadingDetail]   = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    setLoadingBilling(true);
    workspaceService
      .getWorkspaceBilling(workspaceId)
      .then(data => setBilling(data))
      .catch(() => setBilling(null))
      .finally(() => setLoadingBilling(false));

    setLoadingDetail(true);
    workspaceService
      .getBillingDetail(workspaceId)
      .then(data => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [workspaceId]);

  const isBootstrapping = userLoading && !workspaceId;

  return (
    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      <SectionHeader
        icon={<AccountBalanceOutlined sx={{ fontSize: 20 }} />}
        title="Billing & Plan"
        subtitle="Manage your subscription, billing contact, and tax details"
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #e0e0e0', px: { xs: 2, sm: 3 } }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minHeight: 44,
              color: '#64748b',
              px: { xs: 1.5, sm: 2 },
            },
            '& .Mui-selected': { color: `${BRAND.primary} !important` },
            '& .MuiTabs-indicator': { backgroundColor: BRAND.primary, height: 2 },
          }}
        >
          {TAB_LABELS.map(label => (
            <Tab key={label} label={label} disableRipple />
          ))}
        </Tabs>
      </Box>

      {/* Tab content */}
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {isBootstrapping ? (
          <FieldSkeleton rows={5} />
        ) : (
          <>
            {activeTab === 0 && (
              <PlanBillingTab
                workspaceId={workspaceId}
                billing={billing}
                loadingBilling={loadingBilling}
              />
            )}
            {activeTab === 1 && (
              <TaxDetailsTab
                workspaceId={workspaceId}
                detail={detail}
                loadingDetail={loadingDetail}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};


export default BillingSection;

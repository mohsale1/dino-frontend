import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Rating,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Assessment,
  RateReview,
  ContactMail,
  Save,
  Add,
  Delete,
  CalendarToday,
  BarChart,
  FormatQuote,
  LocationOn,
  Email,
  Phone,
  Tag,
} from '@mui/icons-material';
import { homePageService } from '../../services/api/homePage';

// ─── Brand ───────────────────────────────────────────────────────────────────
const BRAND = {
  primary:       '#1976D2',
  primaryHover:  '#1565C0',
  primaryLight:  '#42A5F5',
  primaryBg:     'rgba(25,118,210,0.07)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatItem {
  title: string;
  value: string;
  number: number;
  suffix: string;
  label: string;
  icon: string;
}

interface TestimonialItem {
  name: string;
  role?: string;
  restaurant?: string;
  location?: string;
  rating: number;
  comment: string;
  avatar?: string;
  created_at?: string;
}

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

const ICON_OPTIONS = [
  'business', 'shopping_cart', 'sentiment_satisfied', 'cloud_done',
  'restaurant', 'people', 'menu_book', 'thumb_up', 'trending_up',
  'star', 'local_dining', 'assessment', 'speed', 'verified',
];

// ─── TabPanel ─────────────────────────────────────────────────────────────────
interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// ─── Section toolbar ──────────────────────────────────────────────────────────
interface SectionToolbarProps {
  title: string;
  subtitle: string;
  onAdd?: () => void;
  addLabel?: string;
  onSave: () => void;
  saveLabel: string;
  saving: boolean;
}
const SectionToolbar: React.FC<SectionToolbarProps> = ({ title, subtitle, onAdd, addLabel, onSave, saveLabel, saving }) => (
  <Box sx={{
    display: 'flex',
    alignItems: { xs: 'flex-start', sm: 'center' },
    justifyContent: 'space-between',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2,
    mb: 3,
  }}>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
    </Box>
    <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
      {onAdd && (
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={onAdd}
          size="small"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            borderColor: BRAND.primaryBorder,
            color: BRAND.primary,
            '&:hover': { borderColor: BRAND.primary, bgcolor: BRAND.primaryBg },
          }}
        >
          {addLabel}
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <Save />}
        onClick={onSave}
        disabled={saving}
        size="small"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          bgcolor: BRAND.primary,
          boxShadow: 'none',
          '&:hover': { bgcolor: BRAND.primaryHover, boxShadow: 'none' },
          '&:disabled': { bgcolor: alpha(BRAND.primary, 0.4) },
        }}
      >
        {saving ? 'Saving...' : saveLabel}
      </Button>
    </Box>
  </Box>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ icon: React.ReactNode; message: string; onAdd: () => void; addLabel: string }> = ({ icon, message, onAdd, addLabel }) => (
  <Box sx={{
    textAlign: 'center',
    py: { xs: 6, sm: 8 },
    px: 3,
    border: '2px dashed #e2e8f0',
    borderRadius: 3,
    bgcolor: '#fafafa',
  }}>
    <Box sx={{
      width: 56, height: 56, borderRadius: 3,
      bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      mx: 'auto', mb: 2, color: BRAND.primary,
    }}>
      {icon}
    </Box>
    <Typography variant="body1" sx={{ color: '#64748b', mb: 2.5, fontWeight: 500 }}>
      {message}
    </Typography>
    <Button
      variant="contained"
      startIcon={<Add />}
      onClick={onAdd}
      sx={{
        bgcolor: BRAND.primary,
        '&:hover': { bgcolor: BRAND.primaryHover },
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        boxShadow: 'none',
      }}
    >
      {addLabel}
    </Button>
  </Box>
);

// ─── Field sx ─────────────────────────────────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    '&.Mui-focused fieldset': { borderColor: BRAND.primary },
  },
  '& label.Mui-focused': { color: BRAND.primary },
};

// ─── Main component ───────────────────────────────────────────────────────────
const Appearance: React.FC = () => {
  const [tabValue,     setTabValue]     = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [snackbar,     setSnackbar]     = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [stats,        setStats]        = useState<StatItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [contact,      setContact]      = useState<ContactInfo>({});

  // ── Fetch — call each endpoint individually so one failure doesn't block all ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [statsData, testimonialsData, contactData] = await Promise.allSettled([
        homePageService.getStats(),
        homePageService.getTestimonials(),
        homePageService.getContactInfo(),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats((statsData.value || []).map((s: any) => ({
          title:  s.title  || '',
          value:  s.value  || '0',
          number: s.number || 0,
          suffix: s.suffix || '+',
          label:  s.label  || '',
          icon:   s.icon   || 'star',
        })));
      }

      if (testimonialsData.status === 'fulfilled') {
        setTestimonials(testimonialsData.value || []);
      }

      if (contactData.status === 'fulfilled') {
        const c: any = contactData.value || {};
        setContact({
          email:       c.email       || '',
          phone:       c.phone       || '',
          address:     c.address     || '',
          city:        c.city        || '',
          state:       c.state       || '',
          country:     c.country     || '',
          postal_code: c.postal_code || '',
        });
      }

      // Surface a warning if all three failed
      const allFailed = [statsData, testimonialsData, contactData].every(r => r.status === 'rejected');
      if (allFailed) {
        setFetchError('Could not load homepage data. The backend may be unavailable.');
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load homepage data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Save handlers ─────────────────────────────────────────────────────────
  const handleSaveStats = async () => {
    try {
      setSaving(true);
      await homePageService.updateStats(stats);
      setSnackbar({ open: true, message: 'Stats saved successfully.', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save stats.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTestimonials = async () => {
    try {
      setSaving(true);
      await homePageService.updateTestimonials(testimonials);
      setSnackbar({ open: true, message: 'Testimonials saved successfully.', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save testimonials.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async () => {
    try {
      setSaving(true);
      await homePageService.updateContact(contact);
      setSnackbar({ open: true, message: 'Contact information saved successfully.', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save contact information.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Stats CRUD ────────────────────────────────────────────────────────────
  const addStat = () => setStats(prev => [...prev, { title: '', value: '0', number: 0, suffix: '+', label: '', icon: 'star' }]);
  const deleteStat = (i: number) => setStats(prev => prev.filter((_, idx) => idx !== i));
  const updateStat = (i: number, field: keyof StatItem, value: any) => {
    setStats(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      if (field === 'number') next[i].value = value.toString();
      return next;
    });
  };

  // ── Testimonials CRUD ─────────────────────────────────────────────────────
  const addTestimonial = () => setTestimonials(prev => [...prev, { name: '', role: '', restaurant: '', location: '', rating: 5, comment: '', avatar: '', created_at: new Date().toISOString() }]);
  const deleteTestimonial = (i: number) => setTestimonials(prev => prev.filter((_, idx) => idx !== i));
  const updateTestimonial = (i: number, field: keyof TestimonialItem, value: any) => {
    setTestimonials(prev => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next; });
  };

  // ── Contact ───────────────────────────────────────────────────────────────
  const updateContact = (field: keyof ContactInfo, value: string) => setContact(prev => ({ ...prev, [field]: value }));

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress sx={{ color: BRAND.primary }} />
        <Typography variant="body2" color="text.secondary">Loading homepage data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 45%, #1565C0 100%)',
        px: { xs: 2.5, sm: 4, md: 6 },
        pt: { xs: 3, md: 4 },
        pb: { xs: 4, md: 5 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: -100, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,118,210,0.22) 0%, transparent 70%)', pointerEvents: 'none' },
        '&::after':  { content: '""', position: 'absolute', bottom: -80, left: '25%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
      }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ color: 'rgba(144,202,249,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
            SYSTEM CONTROL CENTER
          </Typography>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Homepage Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
            <CalendarToday sx={{ fontSize: 13, color: 'rgba(144,202,249,0.6)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.6)', fontWeight: 500, fontSize: '0.75rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Tabs bar — flush to hero, full width, no gap ── */}
      <Paper elevation={0} sx={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            minHeight: 50,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minHeight: 50,
              color: '#64748b',
              gap: 0.75,
            },
            '& .Mui-selected': { color: BRAND.primary },
            '& .MuiTabs-indicator': { bgcolor: BRAND.primary, height: 3 },
          }}
        >
          <Tab icon={<BarChart sx={{ fontSize: 18 }} />} iconPosition="start" label="Stats" />
          <Tab icon={<FormatQuote sx={{ fontSize: 18 }} />} iconPosition="start" label="Testimonials" />
          <Tab icon={<ContactMail sx={{ fontSize: 18 }} />} iconPosition="start" label="Contact" />
        </Tabs>
      </Paper>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 1.5, sm: 3, md: 5 }, pt: { xs: 2.5, sm: 3 }, pb: { xs: 4, sm: 6 } }}>

        {fetchError && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFetchError(null)}>
            {fetchError}
          </Alert>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STATS TAB                                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabValue} index={0}>
          <SectionToolbar
            title="Platform Statistics"
            subtitle="Numbers displayed on the public homepage"
            onAdd={addStat}
            addLabel="Add Stat"
            onSave={handleSaveStats}
            saveLabel="Save Stats"
            saving={saving}
          />

          {stats.length === 0 ? (
            <EmptyState
              icon={<Assessment sx={{ fontSize: 26 }} />}
              message="No stats configured yet. Add your first stat to display on the homepage."
              onAdd={addStat}
              addLabel="Add Your First Stat"
            />
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>

                      {/* Card header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart sx={{ fontSize: 16, color: BRAND.primary }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            Stat {index + 1}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => deleteStat(index)} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) } }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth size="small" label="Title" value={stat.title} onChange={e => updateStat(index, 'title', e.target.value)} sx={fieldSx} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth size="small" label="Label" value={stat.label} onChange={e => updateStat(index, 'label', e.target.value)} sx={fieldSx} />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <TextField fullWidth size="small" label="Number" type="number" inputProps={{ step: '0.1' }} value={stat.number} onChange={e => updateStat(index, 'number', parseFloat(e.target.value) || 0)} sx={fieldSx} />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <TextField fullWidth size="small" label="Display Value" value={stat.value} onChange={e => updateStat(index, 'value', e.target.value)} helperText="e.g. 10K, 500+" sx={fieldSx} />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <TextField fullWidth size="small" label="Suffix" value={stat.suffix} onChange={e => updateStat(index, 'suffix', e.target.value)} placeholder="+" sx={fieldSx} />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small" sx={fieldSx}>
                            <InputLabel>Icon</InputLabel>
                            <Select value={stat.icon} label="Icon" onChange={e => updateStat(index, 'icon', e.target.value)}>
                              {ICON_OPTIONS.map(icon => (
                                <MenuItem key={icon} value={icon}>{icon.replace(/_/g, ' ')}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      {/* Preview pill */}
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">Preview:</Typography>
                        <Chip
                          label={`${stat.value || stat.number}${stat.suffix} — ${stat.label || stat.title}`}
                          size="small"
                          sx={{ bgcolor: BRAND.primaryBg, color: BRAND.primary, border: `1px solid ${BRAND.primaryBorder}`, fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TESTIMONIALS TAB                                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabValue} index={1}>
          <SectionToolbar
            title="Customer Testimonials"
            subtitle="Reviews displayed on the public homepage"
            onAdd={addTestimonial}
            addLabel="Add Testimonial"
            onSave={handleSaveTestimonials}
            saveLabel="Save Testimonials"
            saving={saving}
          />

          {testimonials.length === 0 ? (
            <EmptyState
              icon={<RateReview sx={{ fontSize: 26 }} />}
              message="No testimonials added yet. Add your first customer review."
              onAdd={addTestimonial}
              addLabel="Add Your First Testimonial"
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
              {testimonials.map((t, index) => (
                <Card key={index} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

                    {/* Card header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: BRAND.primary, fontSize: '0.875rem', fontWeight: 700 }}>
                          {t.name ? t.name.charAt(0).toUpperCase() : '#'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                            {t.name || `Testimonial ${index + 1}`}
                          </Typography>
                          {t.role && <Typography variant="caption" color="text.secondary">{t.role}</Typography>}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={t.rating} readOnly size="small" />
                        <IconButton size="small" onClick={() => deleteTestimonial(index)} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) } }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2.5 }} />

                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Customer Name" value={t.name} onChange={e => updateTestimonial(index, 'name', e.target.value)} required sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Role / Title" value={t.role || ''} onChange={e => updateTestimonial(index, 'role', e.target.value)} placeholder="e.g. Owner, Manager" sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Restaurant / Business" value={t.restaurant || ''} onChange={e => updateTestimonial(index, 'restaurant', e.target.value)} sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Location" value={t.location || ''} onChange={e => updateTestimonial(index, 'location', e.target.value)} placeholder="e.g. Mumbai, Maharashtra" sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Avatar (initials or URL)" value={t.avatar || ''} onChange={e => updateTestimonial(index, 'avatar', e.target.value)} placeholder="JD or https://..." sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ px: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>Rating</Typography>
                          <Rating value={t.rating} onChange={(_, v) => updateTestimonial(index, 'rating', v || 5)} />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth multiline rows={3} size="small" label="Testimonial Comment" value={t.comment} onChange={e => updateTestimonial(index, 'comment', e.target.value)} required sx={fieldSx} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* CONTACT TAB                                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabValue} index={2}>
          <SectionToolbar
            title="Contact Information"
            subtitle="Details shown on the public homepage contact section"
            onSave={handleSaveContact}
            saveLabel="Save Contact"
            saving={saving}
          />

          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

              {/* Email & Phone */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ContactMail sx={{ fontSize: 16, color: BRAND.primary }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Contact Details</Typography>
              </Box>

              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Email" type="email"
                    value={contact.email || ''} onChange={e => updateContact('email', e.target.value)}
                    sx={fieldSx}
                    InputProps={{ startAdornment: <Email sx={{ fontSize: 18, color: '#94a3b8', mr: 1 }} /> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Phone"
                    value={contact.phone || ''} onChange={e => updateContact('phone', e.target.value)}
                    sx={fieldSx}
                    InputProps={{ startAdornment: <Phone sx={{ fontSize: 18, color: '#94a3b8', mr: 1 }} /> }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* Address */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LocationOn sx={{ fontSize: 16, color: BRAND.primary }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Address</Typography>
              </Box>

              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Street Address" value={contact.address || ''} onChange={e => updateContact('address', e.target.value)} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="City" value={contact.city || ''} onChange={e => updateContact('city', e.target.value)} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="State / Province" value={contact.state || ''} onChange={e => updateContact('state', e.target.value)} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Country" value={contact.country || ''} onChange={e => updateContact('country', e.target.value)} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Postal Code"
                    value={contact.postal_code || ''} onChange={e => updateContact('postal_code', e.target.value)}
                    sx={fieldSx}
                    InputProps={{ startAdornment: <Tag sx={{ fontSize: 18, color: '#94a3b8', mr: 1 }} /> }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Appearance;
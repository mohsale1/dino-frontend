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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Assessment,
  RateReview,
  ContactMail,
  Save,
  Refresh,
  Add,
  Delete,
  CalendarToday,
} from '@mui/icons-material';
import { homePageService } from '../../services/api/homePage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

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
  'business',
  'shopping_cart',
  'sentiment_satisfied',
  'cloud_done',
  'restaurant',
  'people',
  'menu_book',
  'thumb_up',
  'trending_up',
  'star',
  'local_dining',
  'assessment',
  'speed',
  'verified',
];

const Appearance: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [stats, setStats] = useState<StatItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [contact, setContact] = useState<ContactInfo>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await homePageService.getAllHomeData();

      const mappedStats = (data.stats || []).map((stat: any) => ({
        title: stat.title || '',
        value: stat.value || '0',
        number: stat.number || 0,
        suffix: stat.suffix || '+',
        label: stat.label || '',
        icon: stat.icon || 'star',
      }));

      setStats(mappedStats);
      setTestimonials(data.testimonials || []);

      const apiContact: any = data.contact || {};
      setContact({
        email: apiContact.email || '',
        phone: apiContact.phone || '',
        address: apiContact.address || '',
        city: apiContact.city || '',
        state: apiContact.state || '',
        country: apiContact.country || '',
        postal_code: apiContact.postal_code || '',
      });
    } catch (err: any) {
      console.error('Failed to fetch homepage data:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to load homepage data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveStats = async () => {
    try {
      setSaving(true);
      await homePageService.updateStats(stats);
      setSnackbar({ open: true, message: 'Stats updated successfully', severity: 'success' });
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save stats', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTestimonials = async () => {
    try {
      setSaving(true);
      await homePageService.updateTestimonials(testimonials);
      setSnackbar({ open: true, message: 'Testimonials updated successfully', severity: 'success' });
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save testimonials',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async () => {
    try {
      setSaving(true);
      await homePageService.updateContact(contact);
      setSnackbar({
        open: true,
        message: 'Contact information updated successfully',
        severity: 'success',
      });
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save contact information',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Stats Management
  const addStat = () => {
    setStats([
      ...stats,
      { title: 'New Stat', value: '0', number: 0, suffix: '+', label: 'New Stat', icon: 'star' },
    ]);
  };

  const updateStat = (index: number, field: keyof StatItem, value: any) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    if (field === 'number') {
      newStats[index].value = value.toString();
    }
    setStats(newStats);
  };

  const deleteStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  // Testimonials Management
  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      {
        name: '',
        role: '',
        restaurant: '',
        location: '',
        rating: 5,
        comment: '',
        avatar: '',
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: any) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setTestimonials(newTestimonials);
  };

  const deleteTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  // Contact Management
  const updateContact = (field: keyof ContactInfo, value: string) => {
    setContact({ ...contact, [field]: value });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)',
          px: { xs: 2.5, sm: 4, md: 6 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80,
            left: '25%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'rgba(199,210,254,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}
            >
              SYSTEM CONTROL CENTER
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: '#fff',
                fontWeight: 800,
                mt: 0.5,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              Homepage Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
              <CalendarToday sx={{ fontSize: 13, color: 'rgba(199,210,254,0.6)' }} />
              <Typography
                variant="caption"
                sx={{ color: 'rgba(199,210,254,0.6)', fontWeight: 500, fontSize: '0.75rem' }}
              >
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, pt: 4, pb: 6 }}>
        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            border: 'none',
            borderTop: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              minHeight: 44,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 44,
                color: '#64748b',
              },
              '& .Mui-selected': { color: '#0f172a' },
              '& .MuiTabs-indicator': {
                bgcolor: '#0f172a',
                height: 2,
                borderRadius: 2,
              },
            }}
          >
            <Tab icon={<Assessment />} label="Stats" />
            <Tab icon={<RateReview />} label="Testimonials" />
            <Tab icon={<ContactMail />} label="Contact" />
          </Tabs>
        </Paper>

        {/* Stats Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                Platform Statistics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addStat}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    '&:hover': { borderColor: '#0f172a', color: '#0f172a' },
                  }}
                >
                  Add Stat
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveStats}
                  disabled={saving}
                  sx={{
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#1e293b' },
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Stats'}
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b' }}>
                          Stat #{index + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => deleteStat(index)}
                          sx={{
                            color: '#94a3b8',
                            '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Title"
                            value={stat.title}
                            onChange={(e) => updateStat(index, 'title', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Label"
                            value={stat.label}
                            onChange={(e) => updateStat(index, 'label', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Number"
                            type="number"
                            inputProps={{ step: '0.1' }}
                            value={stat.number}
                            onChange={(e) =>
                              updateStat(index, 'number', parseFloat(e.target.value) || 0)
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Display Value"
                            value={stat.value}
                            onChange={(e) => updateStat(index, 'value', e.target.value)}
                            helperText="e.g., 10K, 500+"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Suffix"
                            value={stat.suffix}
                            onChange={(e) => updateStat(index, 'suffix', e.target.value)}
                            placeholder="+"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Icon</InputLabel>
                            <Select
                              value={stat.icon}
                              label="Icon"
                              onChange={(e) => updateStat(index, 'icon', e.target.value)}
                            >
                              {ICON_OPTIONS.map((icon) => (
                                <MenuItem key={icon} value={icon}>
                                  {icon.replace('_', ' ')}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {stats.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                  No stats configured yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addStat}
                  sx={{
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#1e293b' },
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Add Your First Stat
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Testimonials Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                Customer Testimonials
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addTestimonial}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    '&:hover': { borderColor: '#0f172a', color: '#0f172a' },
                  }}
                >
                  Add Testimonial
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveTestimonials}
                  disabled={saving}
                  sx={{
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#1e293b' },
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Testimonials'}
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b' }}>
                          Testimonial #{index + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => deleteTestimonial(index)}
                          sx={{
                            color: '#94a3b8',
                            '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Customer Name"
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Role/Title"
                            value={testimonial.role || ''}
                            onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                            placeholder="e.g., Owner, Manager"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Restaurant/Business"
                            value={testimonial.restaurant || ''}
                            onChange={(e) => updateTestimonial(index, 'restaurant', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Location"
                            value={testimonial.location || ''}
                            onChange={(e) => updateTestimonial(index, 'location', e.target.value)}
                            placeholder="e.g., Mumbai, Maharashtra"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Avatar (Initials or URL)"
                            value={testimonial.avatar || ''}
                            onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                            placeholder="e.g., JD or https://..."
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: '#64748b', mb: 1, display: 'block' }}
                            >
                              Rating
                            </Typography>
                            <Rating
                              value={testimonial.rating}
                              onChange={(_, newValue) =>
                                updateTestimonial(index, 'rating', newValue || 5)
                              }
                              size="large"
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            label="Testimonial Comment"
                            value={testimonial.comment}
                            onChange={(e) => updateTestimonial(index, 'comment', e.target.value)}
                            required
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {testimonials.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                  No testimonials added yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addTestimonial}
                  sx={{
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#1e293b' },
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Add Your First Testimonial
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Contact Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
                Contact Information
              </Typography>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveContact}
                disabled={saving}
                sx={{
                  bgcolor: '#0f172a',
                  '&:hover': { bgcolor: '#1e293b' },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                {saving ? 'Saving...' : 'Save Contact'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={contact.email || ''}
                  onChange={(e) => updateContact('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={contact.phone || ''}
                  onChange={(e) => updateContact('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={contact.address || ''}
                  onChange={(e) => updateContact('address', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={contact.city || ''}
                  onChange={(e) => updateContact('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={contact.state || ''}
                  onChange={(e) => updateContact('state', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={contact.country || ''}
                  onChange={(e) => updateContact('country', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={contact.postal_code || ''}
                  onChange={(e) => updateContact('postal_code', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Appearance;
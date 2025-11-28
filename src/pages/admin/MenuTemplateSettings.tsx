import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Button,
  alpha,
  useTheme,
  IconButton,
  Grid,
  Card,
  CardContent,
  Radio,
  Chip,
  Divider,
} from '@mui/material';
import {
  Palette,
  Refresh,
  Save,
  CheckCircle,
} from '@mui/icons-material';
import { useUserData } from '../../contexts/UserDataContext';
import { venueService } from '../../services/business';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import StorageManager from '../../utils/storage';
import { getTemplatesList, getTemplateConfig } from '../../config/menuTemplates';
import MobilePreviewFrame from '../../components/preview/MobilePreviewFrame';

// Get template configurations
const menuTemplates = getTemplatesList();

// Sample menu items for preview - More realistic data
const sampleMenuItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil',
    price: 299,
    category: 'Pizza',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    rating: 4.5,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Loaded with pepperoni, mozzarella cheese and Italian herbs',
    price: 349,
    category: 'Pizza',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    rating: 4.7,
    isPopular: true,
  },
  {
    id: '3',
    name: 'Chicken Tikka Masala',
    description: 'Tender chicken pieces in a creamy tomato-based curry sauce',
    price: 349,
    category: 'Main Course',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    rating: 4.8,
    spicyLevel: 2,
  },
  {
    id: '4',
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in rich creamy tomato gravy',
    price: 299,
    category: 'Main Course',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
    rating: 4.6,
    spicyLevel: 1,
  },
  {
    id: '5',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan cheese and croutons',
    price: 199,
    category: 'Salads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    rating: 4.2,
  },
  {
    id: '6',
    name: 'Greek Salad',
    description: 'Tomatoes, cucumber, olives, feta cheese with olive oil',
    price: 219,
    category: 'Salads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    rating: 4.4,
  },
  {
    id: '7',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten chocolate center',
    price: 149,
    category: 'Desserts',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
    rating: 4.9,
    isNew: true,
  },
  {
    id: '8',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers',
    price: 179,
    category: 'Desserts',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    rating: 4.7,
  },
];

const MenuTemplateSettings: React.FC = () => {
  const theme = useTheme();
  const { getVenue, refreshUserData } = useUserData();
  const venue = getVenue();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Load current template
  useEffect(() => {
    const loadCurrentTemplate = async () => {
      if (!venue?.id) {
        setSnackbar({
          open: true,
          message: 'No venue found. Please contact support.',
          severity: 'error',
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const currentTemplate = venue.menu_template || 'classic';
        setSelectedTemplate(currentTemplate);
        console.log('📋 Current menu template:', currentTemplate);
      } catch (error) {
        console.error('Error loading template:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load current template',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadCurrentTemplate();
  }, [venue]);

  const handleSave = async () => {
    if (!venue?.id) {
      setSnackbar({
        open: true,
        message: 'No venue available',
        severity: 'error',
      });
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Saving menu template:', selectedTemplate);

      // Get the full template configuration
      const templateConfig = getTemplateConfig(selectedTemplate);

      // Save both template name and full config
      await venueService.updateMenuTemplate(venue.id, selectedTemplate, templateConfig);
      StorageManager.clearVenueData();
      await refreshUserData();

      setSnackbar({
        open: true,
        message: 'Menu template saved successfully! Customers will now see this template.',
        severity: 'success',
      });

      console.log('✅ Menu template saved successfully');
    } catch (error) {
      console.error('❌ Error saving template:', error);
      setSnackbar({
        open: true,
        message: `Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading templates...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'auto',
        height: 'auto',
        backgroundColor: '#f8f9fa',
        padding: 0,
        margin: 0,
        width: '100%',
        pb: 4,
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, md: 3 },
              py: { xs: 3, sm: 4 },
              px: { xs: 3, sm: 4 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Palette sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  Menu Template
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  maxWidth: '600px',
                  color: 'text.secondary',
                }}
              >
                Choose how your menu appears to customers. Select a template and see a live preview.
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                {saving ? 'Saving...' : 'Save Template'}
              </Button>

              <IconButton
                onClick={() => window.location.reload()}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content - Split Screen */}
      <Box sx={{ px: { xs: 3, sm: 4 }, py: 4, pb: 0 }}>
        <Grid container spacing={3}>
          {/* Left Side - Template Selector */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                minHeight: '600px',
              }}
            >
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Choose Template
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a template to preview how your menu will look to customers
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {menuTemplates.map((template) => (
                  <Card
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedTemplate === template.id ? `2px solid ${template.color}` : '1px solid',
                      borderColor: selectedTemplate === template.id ? template.color : 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: alpha(template.color, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                          }}
                        >
                          {template.icon}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {template.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.description}
                          </Typography>
                        </Box>

                        <Radio
                          checked={selectedTemplate === template.id}
                          value={template.id}
                          sx={{
                            color: template.color,
                            '&.Mui-checked': {
                              color: template.color,
                            },
                          }}
                        />
                      </Box>

                      {selectedTemplate === template.id && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Chip
                            icon={<CheckCircle />}
                            label="Currently Selected"
                            size="small"
                            sx={{
                              backgroundColor: alpha(template.color, 0.1),
                              color: template.color,
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - Mobile Preview */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                minHeight: '750px',
                backgroundColor: '#fafafa',
              }}
            >
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Live Customer View
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This is exactly how customers will see your menu on their phones
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Mobile Preview Frame */}
              <Box
                sx={{
                  minHeight: '700px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MobilePreviewFrame
                  template={getTemplateConfig(selectedTemplate)}
                  menuItems={sampleMenuItems}
                  venueName={venue?.name || 'Demo Restaurant'}
                  tableNumber="T-5"
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            backgroundColor: '#ffffff',
            color: 'text.primary',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuTemplateSettings;
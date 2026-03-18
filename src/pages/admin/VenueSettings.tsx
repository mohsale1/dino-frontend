import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  Chip,
  Fade,
  Slide,
  Zoom,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Badge,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Restaurant,
  Schedule,
  Palette,
  Notifications,
  Security,
  Payment,
  Language,
  Print,
  Save,
  CloudUpload,
  QrCode,
  Analytics,
  Settings,
  EmojiEvents,
  PowerSettingsNew,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  Edit,
  Info,
  TrendingUp,
  Star,
  AccessTime,
  LocationOn,
  Phone,
  Email,
  Web,
  Refresh,
  Store,
} from '@mui/icons-material';
import { venueService } from '../../services/business';
import { useUserData } from '../../contexts/UserDataContext';
import { CircularProgress } from '@mui/material';
import StorageManager from '../../utils/storage';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

interface VenueSettings {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  landmark: string;
  phone: string;
  email: string;

  logo?: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoPosition: 'left' | 'center' | 'right';
    showLogo: boolean;
  };
  features: {
    onlineOrdering: boolean;
    tableReservation: boolean;
    loyaltyProgram: boolean;
    multiLanguage: boolean;
    printReceipts: boolean;
    analytics: boolean;
  };
  paymentMethods: {
    cash: boolean;
    card: boolean;
    digitalWallet: boolean;
    onlinePayment: boolean;
  };
  notifications: {
    orderAlerts: boolean;
    lowStock: boolean;
    dailyReports: boolean;
    customerFeedback: boolean;
  };
  advanced: {
    autoAcceptOrders: boolean;
    orderTimeout: number;
    maxOrdersPerTable: number;
    requireCustomerInfo: boolean;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>{children}</Box>
      )}
    </div>
  );
};

const VenueSettings: React.FC = () => {
  const { getVenue, getVenueDisplayName, refreshUserData, userData, loading: userDataLoading } = useUserData();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [settings, setSettings] = useState<VenueSettings>({
    name: 'Dino Venue',
    description: 'Authentic Indian flavors with modern digital ordering experience',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
    phone: '',
    email: '',

    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
    theme: {
      primaryColor: '#2196F3',
      secondaryColor: '#FF9800',
      logoPosition: 'left',
      showLogo: true,
    },
    features: {
      onlineOrdering: true,
      tableReservation: true,
      loyaltyProgram: false,
      multiLanguage: true,
      printReceipts: true,
      analytics: true,
    },
    paymentMethods: {
      cash: true,
      card: true,
      digitalWallet: true,
      onlinePayment: true,
    },
    notifications: {
      orderAlerts: true,
      lowStock: true,
      dailyReports: true,
      customerFeedback: true,
    },
    advanced: {
      autoAcceptOrders: false,
      orderTimeout: 30,
      maxOrdersPerTable: 5,
      requireCustomerInfo: false,
    },
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [hasChanges, setHasChanges] = useState(false);
  const [venueActive, setVenueActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Use ref to always have access to the latest settings state
  const settingsRef = useRef(settings);
  
  // Update ref whenever settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load venue settings from API
  useEffect(() => {
    const loadVenueSettings = async () => {
      // If no userData and not loading, try to refresh
      if (!userData && !userDataLoading) {
        try {
          await refreshUserData();
        } catch (error) {
      // Error handled silently
    }
        return;
      }
      
      const venue = getVenue();
      
      if (!venue?.id) {        // No venue - keep default settings, don't show error
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use venue data from UserDataContext - it already contains all necessary information
        let venueData = venue;
        
        // REMOVED: Unnecessary API call to /venues/{venueId}
        // The /auth/user-data endpoint already provides complete venue information
        // This eliminates the duplicate API call that was happening        
        if (venueData) {          
          // Map venue data to settings format with proper fallbacks
          setSettings(prevSettings => ({
            name: venueData.name || '',
            description: venueData.description || '',
            address: venueData.location?.address || '',
            city: venueData.location?.city || '',
            state: venueData.location?.state || '',
            postalCode: venueData.location?.postalCode || '',
            landmark: venueData.location?.landmark || '',
            phone: venueData.phone || '',
            email: venueData.email || '',
 
            operatingHours: prevSettings.operatingHours, // Keep existing operating hours settings
            theme: prevSettings.theme, // Keep existing theme settings
            features: prevSettings.features, // Keep existing feature settings
            paymentMethods: prevSettings.paymentMethods, // Keep existing payment settings
            notifications: prevSettings.notifications, // Keep existing notification settings
            advanced: prevSettings.advanced, // Keep existing advanced settings
          }));
          
          const isActive = venueData.isActive !== undefined ? venueData.isActive : venueData.isActive;
          setVenueActive(isActive || false);        }
      } catch (error) {        // API failed - show error alert but keep UI visible
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadVenueSettings();
  }, [getVenue, userData, userDataLoading, refreshUserData]);

  const handleSettingChange = (section: keyof VenueSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleDirectSettingChange = (field: keyof VenueSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateSettings = (currentSettings: VenueSettings): { isValid: boolean; errors: {[key: string]: string} } => {
    const errors: {[key: string]: string} = {};
    
    // Name validation
    if (!currentSettings.name || currentSettings.name.trim().length === 0) {
      errors.name = 'Venue name is required';
    } else if (currentSettings.name.length > 100) {
      errors.name = 'Venue name must be less than 100 characters';
    }
    
    // Description validation
    if (!currentSettings.description || currentSettings.description.trim().length === 0) {
      errors.description = 'Description is required';
    } else if (currentSettings.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
    
    // Address validation
    if (!currentSettings.address || currentSettings.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters';
    } else if (currentSettings.address.length > 500) {
      errors.address = 'Address must be less than 500 characters';
    }
    
    // City validation
    if (!currentSettings.city || currentSettings.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    } else if (currentSettings.city.length > 100) {
      errors.city = 'City must be less than 100 characters';
    }
    
    // State validation
    if (!currentSettings.state || currentSettings.state.trim().length < 2) {
      errors.state = 'State must be at least 2 characters';
    } else if (currentSettings.state.length > 100) {
      errors.state = 'State must be less than 100 characters';
    }
    
    // Postal code validation
    if (!currentSettings.postalCode || currentSettings.postalCode.trim().length < 3) {
      errors.postalCode = 'Postal code must be at least 3 characters';
    } else if (currentSettings.postalCode.length > 20) {
      errors.postalCode = 'Postal code must be less than 20 characters';
    }
    
    // Landmark validation (optional)
    if (currentSettings.landmark && currentSettings.landmark.length > 200) {
      errors.landmark = 'Landmark must be less than 200 characters';
    }
    
    // Phone validation
    if (!currentSettings.phone || !/^[0-9]{10}$/.test(currentSettings.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone must be 10 digits';
    }
    
    // Email validation (optional)
    if (currentSettings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentSettings.email)) {
      errors.email = 'Invalid email format';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSave = async () => {
    const venue = getVenue();    
    if (!venue?.id) {      
      setSnackbar({ open: true, message: 'No venue available', severity: 'error' });
      return;
    }

    // Get the latest settings from ref
    const currentSettings = settingsRef.current;
    
    // Validate settings before saving
    const validation = validateSettings(currentSettings);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSnackbar({ 
        open: true, 
        message: 'Please fix validation errors before saving', 
        severity: 'error' 
      });
      return;
    }

    try {
      setSaving(true);
      
      // Prepare venue update data with proper structure using current state
      const updateData: any = {
        name: currentSettings.name.trim(),
        description: currentSettings.description.trim(),
        location: {
          address: currentSettings.address.trim(),
          city: currentSettings.city.trim(),
          state: currentSettings.state.trim(),
          postal_code: currentSettings.postalCode.trim(),
          landmark: currentSettings.landmark.trim() || null
        },
        phone: currentSettings.phone.replace(/\D/g, ''), // Remove non-digits
        email: currentSettings.email.trim() || null,
      };
      
      // console.log('Saving venue settings:', updateData); // Debug log
      
      await venueService.updateVenue(venue.id, updateData);
      
      // Clear venue cache and refresh user data to get updated venue information
      StorageManager.clearVenueData();
      await refreshUserData();

      setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
      setHasChanges(false);
      setValidationErrors({});
    } catch (updateError) {
      console.error('Failed to save settings:', updateError); // Debug log
      setSnackbar({ 
        open: true, 
        message: `Failed to save settings: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`, 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHasChanges(false);
    setSnackbar({ open: true, message: 'Settings reset to defaults', severity: 'success' });
  };

  const handleToggleVenueStatus = async () => {
    const venue = getVenue();    
    if (!venue?.id) {
      setSnackbar({ open: true, message: 'No venue available', severity: 'error' });
      return;
    }

    try {
      const newStatus = !venueActive;      
      if (newStatus) {
        // Use activate API
        await venueService.activateVenue(venue.id);
      } else {
        // Use deactivate API
        await venueService.deactivateVenue(venue.id);
      }
      
      // Clear venue cache and refresh user data to get updated venue status
      StorageManager.clearVenueData();
      await refreshUserData();

      setVenueActive(newStatus);
      setSnackbar({ 
        open: true, 
        message: `Venue ${newStatus ? 'activated' : 'deactivated'} successfully`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: `Failed to update venue status: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        severity: 'error' 
      });
    }
  };

  const handleRefreshSettings = async () => {
    try {
      setLoading(true);      
      // Refresh user data to get latest venue information
      await refreshUserData();
      
      setSnackbar({
        open: true,
        message: 'Settings refreshed successfully',
        severity: 'success'
      });
    } catch (error) {      setSnackbar({
        open: true,
        message: 'Failed to refresh settings. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#795548', '#FF5722'
  ];

  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  // Don't block UI with loading or error states
  // Show page immediately with default settings if API fails
  
  if (false) { // Disabled blocking UI
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 2.5, width: '100%' }}>        <Container maxWidth='lg'>
          <Alert severity='error' sx={{ mb: 3 }}>
            Placeholder
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant='contained' 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Reload Page
            </Button>
          </Box>
        </Container>
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
        overflow: 'visible',
        '& .MuiContainer-root': {
          padding: '0 !important',
          margin: '0 !important',
          maxWidth: 'none !important',
        },
      }}
    >
      {/* Hero Section - Compact */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
          py: { xs: 2.5, sm: 3 },
          px: { xs: 2, sm: 3 },
          margin: 0,
          width: '100%',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 2, pl: { xs: 4, sm: 5, md: 6 }, pr: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1, pl: { xs: 0.5, sm: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Settings sx={{ fontSize: 24, mr: 1.25, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant='h4'
                  component='h1'
                  fontWeight='600'
                  sx={{
                    fontSize: { xs: '1.375rem', sm: '1.625rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  Venue Settings
                </Typography>
              </Box>
              
              <Typography
                variant='body1'
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 400,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                Configure your venue's information, features, and operational preferences
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexDirection: 'column',
                alignItems: { xs: 'flex-start', md: 'flex-end' },
              }}
            >
              {/* Venue Name Badge - Moved to top right */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1.25,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Restaurant sx={{ fontSize: 14, mr: 0.5, color: 'primary.main', opacity: 0.9 }} />
                <Typography variant='body2' fontWeight='500' color='text.primary' sx={{ fontSize: '0.8125rem' }}>
                  {settings.name || 'Your Venue'}
                </Typography>
              </Box>

              {/* Buttons Row */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
              <IconButton
                onClick={handleRefreshSettings}
                disabled={loading}
                size='small'
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title={loading ? 'Refreshing...' : 'Refresh settings'}
              >
                <Refresh sx={{ fontSize: 16 }} />
              </IconButton>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          width: '100%',
          padding: 0,
          margin: 0,
        }}
      >
        {/* Error Alert */}
        {error && (
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 0.5 }}>
            <Alert 
              severity='error' 
              onClose={() => setError(null)}
              sx={{ fontSize: '0.8125rem', py: 0.5 }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Unsaved Changes Banner */}
        {hasChanges && (
          <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 1.5, 
                bgcolor: 'rgba(33, 150, 243, 0.08)',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'rgba(33, 150, 243, 0.2)',
                marginTop: 1.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Edit sx={{ color: 'primary.main', fontSize: 18 }} />
                <Box>
                  <Typography variant='body1' color='primary.main' fontWeight='600' sx={{ fontSize: '0.8125rem' }}>
                    You have unsaved changes
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                    Don't forget to save your modifications
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                <Button 
                  variant='outlined' 
                  onClick={handleReset}
                  size='small'
                  sx={{
                    borderColor: 'divider',
                    color: 'text.secondary',
                    flex: { xs: 1, sm: 'none' },
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': {
                      borderColor: 'text.secondary',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  Reset
                </Button>
                <Button 
                  variant='contained' 
                  startIcon={saving ? <CircularProgress size={14} color='inherit' /> : <Save sx={{ fontSize: 16 }} />} 
                  onClick={handleSave}
                  disabled={saving}
                  size='small'
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    flex: { xs: 1, sm: 'none' },
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Settings Tabs */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: 4 }}>
          <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => {
                // Only allow tab 0 (Basic Info) to be selected
                if (newValue === 0) {
                  setTabValue(newValue);
                }
              }}
              variant='scrollable'
              scrollButtons='auto'
              allowScrollButtonsMobile
              sx={{ 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                backgroundColor: 'grey.50',
                minHeight: { xs: 40, sm: 56 },
                '& .MuiTab-root': {
                  minHeight: { xs: 40, sm: 56 },
                  fontSize: { xs: '0.6875rem', sm: '0.8125rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', sm: 100 },
                  px: { xs: 1, sm: 1.5 },
                  py: { xs: 0.75, sm: 1 },
                  '&.Mui-selected': {
                    backgroundColor: 'white',
                    fontWeight: 600,
                  },
                },
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: 16, sm: 18 },
                }
              }}
            >
              <Tab 
                icon={<Restaurant fontSize={isMobile ? 'small' : 'medium'} />} 
                label='Basic Info' 
                iconPosition={isMobile ? 'start' : 'top'} 
              />
              <Tab 
                icon={<Settings fontSize={isMobile ? 'small' : 'medium'} />} 
                label='Features' 
                iconPosition={isMobile ? 'start' : 'top'} 
                disabled
              />
              <Tab 
                icon={<Payment fontSize={isMobile ? 'small' : 'medium'} />} 
                label='Payment' 
                iconPosition={isMobile ? 'start' : 'top'} 
                disabled
              />
              <Tab 
                icon={<Notifications fontSize={isMobile ? 'small' : 'medium'} />} 
                label={isMobile ? 'Alerts' : 'Notifications'} 
                iconPosition={isMobile ? 'start' : 'top'} 
                disabled
              />
              <Tab 
                icon={<Security fontSize={isMobile ? 'small' : 'medium'} />} 
                label='Advanced' 
                iconPosition={isMobile ? 'start' : 'top'} 
                disabled
              />
            </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ boxShadow: 1, mb: 3 }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                    <Typography variant='h6' gutterBottom fontWeight='600' sx={{ mb: 2.5, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                      Basic Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          label='Venue Name'
                          value={settings.name}
                          onChange={(e) => handleDirectSettingChange('name', e.target.value)}
                          error={!!validationErrors.name}
                          helperText={validationErrors.name}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          label='Description'
                          multiline
                          rows={2.5}
                          value={settings.description}
                          onChange={(e) => handleDirectSettingChange('description', e.target.value)}
                          error={!!validationErrors.description}
                          helperText={validationErrors.description}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          label='Address'
                          placeholder='Street address, building number'
                          value={settings.address}
                          onChange={(e) => handleDirectSettingChange('address', e.target.value)}
                          error={!!validationErrors.address}
                          helperText={validationErrors.address || 'Enter your complete street address'}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label='City'
                          placeholder='e.g., Hyderabad'
                          value={settings.city}
                          onChange={(e) => handleDirectSettingChange('city', e.target.value)}
                          error={!!validationErrors.city}
                          helperText={validationErrors.city}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label='State'
                          placeholder='e.g., Telangana'
                          value={settings.state}
                          onChange={(e) => handleDirectSettingChange('state', e.target.value)}
                          error={!!validationErrors.state}
                          helperText={validationErrors.state}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label='Postal Code'
                          placeholder='e.g., 500001'
                          value={settings.postalCode}
                          onChange={(e) => handleDirectSettingChange('postalCode', e.target.value)}
                          error={!!validationErrors.postalCode}
                          helperText={validationErrors.postalCode}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Landmark (Optional)'
                          placeholder='e.g., Near City Mall'
                          value={settings.landmark}
                          onChange={(e) => handleDirectSettingChange('landmark', e.target.value)}
                          error={!!validationErrors.landmark}
                          helperText={validationErrors.landmark || 'Nearby landmark for easy location'}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label='Phone'
                          placeholder='10 digit phone number'
                          value={settings.phone}
                          onChange={(e) => handleDirectSettingChange('phone', e.target.value)}
                          error={!!validationErrors.phone}
                          helperText={validationErrors.phone}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Email (Optional)'
                          type='email'
                          placeholder='contact@venue.com'
                          value={settings.email}
                          onChange={(e) => handleDirectSettingChange('email', e.target.value)}
                          error={!!validationErrors.email}
                          helperText={validationErrors.email || 'Optional contact email'}
                          size='small'
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              py: 1.25,
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.6875rem',
                              mt: 0.5,
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: 1, mb: 3 }}>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                    <Typography variant='h6' gutterBottom fontWeight='600' sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                      Venue Logo
                    </Typography>
                    <Avatar
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mx: 'auto', 
                        mb: 1.5,
                        bgcolor: 'primary.main',
                        fontSize: '1.75rem'
                      }}
                    >
                      <Restaurant sx={{ fontSize: '2rem', color: 'white' }} />
                    </Avatar>
                    <Button
                      variant='contained'
                      startIcon={<CloudUpload sx={{ fontSize: 16 }} />}
                      fullWidth
                      size='small'
                      onClick={() => {
                        setSnackbar({ 
                          open: true, 
                          message: 'Logo upload feature coming soon', 
                          severity: 'info' 
                        });
                      }}
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        py: 0.75,
                      }}
                    >
                      Upload Logo
                    </Button>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 1.5, display: 'block', fontSize: '0.75rem' }}>
                      Recommended: 512x512px, PNG or JPG
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Other tab panels remain the same... */}
          </Paper>
        </Box>
      </Box>

      <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ 
              vertical: 'bottom', 
              horizontal: isMobile ? 'center' : 'right' 
            }}
          >
            <Alert 
              severity={snackbar.severity} 
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
              sx={{
                borderRadius: 1.5,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                fontSize: '0.8125rem',
                '& .MuiAlert-icon': {
                  fontSize: '1.25rem'
                },
                width: { xs: '90vw', sm: 'auto' },
                maxWidth: { xs: '400px', sm: 'none' }
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
    </Box>
  );
};

export default VenueSettings;
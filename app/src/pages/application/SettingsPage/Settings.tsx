/**
 * Settings Page - Professional Clean Design
 * 
 * Modern, minimal settings interface without flashy effects
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import { useUserData } from '../../../contexts/application/UserData';
import SettingsNav from './components/SettingsNav';
import ProfileSection from './components/ProfileSection';
import SecuritySection from './components/SecuritySection';
import NotificationsSection from './components/NotificationsSection';
import AppearanceSection from './components/AppearanceSection';
import WorkspaceSection from './components/WorkspaceSection';

const Settings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userData, getVenue } = useUserData();
  const venue = getVenue();

  const [activeSection, setActiveSection] = useState('profile');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const sections = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: 'person',
      description: 'Personal information'
    },
    { 
      id: 'workspace', 
      label: 'Workspace', 
      icon: 'business',
      description: 'Venue settings'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: 'notifications',
      description: 'Alert preferences'
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: 'security',
      description: 'Password & privacy'
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: 'palette',
      description: 'Theme & display'
    },
  ];

  const handleSave = async (data: any, section: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSnackbar({
        open: true,
        message: `${section} settings saved successfully`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to save ${section} settings`,
        severity: 'error',
      });
    }
  };

  const renderContent = () => {
    const profileData = {
      name: userData?.user?.firstName && userData?.user?.lastName 
        ? `${userData.user.firstName} ${userData.user.lastName}` 
        : userData?.user?.email || '',
      email: userData?.user?.email || '',
      phone: userData?.user?.phone || '',
      role: userData?.user?.role || 'User',
    };

    const workspaceData = {
      name: venue?.name || '',
      description: venue?.description || '',
      address: venue?.location?.address || '',
      city: venue?.location?.city || '',
      state: venue?.location?.state || '',
      postalCode: venue?.location?.postalCode || '',
      phone: venue?.phone || '',
      email: venue?.email || '',
      isActive: venue?.isActive ?? true,
    };

    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSection 
            userData={profileData}
            onSave={(data) => handleSave(data, 'Profile')}
          />
        );
      case 'workspace':
        return (
          <WorkspaceSection 
            workspaceData={workspaceData}
            onSave={(data) => handleSave(data, 'Workspace')}
          />
        );
      case 'notifications':
        return (
          <NotificationsSection 
            onSave={(data) => handleSave(data, 'Notifications')}
          />
        );
      case 'security':
        return (
          <SecuritySection 
            onSave={(data) => handleSave(data, 'Security')}
            onChangePassword={async (data) => {
              await handleSave(data, 'Password');
            }}
          />
        );
      case 'appearance':
        return (
          <AppearanceSection 
            onSave={(data) => handleSave(data, 'Appearance')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              mb: 1,
              fontSize: { xs: '1.75rem', md: '2.125rem' },
            }}
          >
            Settings
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              fontSize: '0.9375rem',
            }}
          >
            Manage your account preferences and configuration
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Navigation */}
          <Box
            sx={{
              width: { xs: '100%', md: 280 },
              flexShrink: 0,
            }}
          >
            <SettingsNav
              sections={sections}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </Box>

          {/* Content Area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {renderContent()}
          </Box>
        </Box>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 1,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
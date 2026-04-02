import React, { useState } from 'react';
import {
  Box,
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
    { id: 'profile',   label: 'Profile',   icon: 'person',   description: 'Personal information' },
    { id: 'workspace', label: 'Workspace', icon: 'business', description: 'Venue & operations'   },
    { id: 'security',  label: 'Security',  icon: 'security', description: 'Password & access'    },
  ];

  const handleSave = async (data: any, section: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSnackbar({ open: true, message: `${section} settings saved successfully`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: `Failed to save ${section} settings`, severity: 'error' });
    }
  };

  const renderContent = () => {
    const profileData = {
      name: userData?.user?.firstName && userData?.user?.lastName
        ? `${userData.user.firstName} ${userData.user.lastName}`
        : userData?.user?.email || '',
      email: userData?.user?.email || '',
      phone: userData?.user?.phone || '',
      role:  userData?.user?.role  || 'User',
    };

    const workspaceData = {
      name:        venue?.name                || '',
      description: venue?.description         || '',
      address:     venue?.location?.address   || '',
      city:        venue?.location?.city      || '',
      state:       venue?.location?.state     || '',
      postalCode:  venue?.location?.postalCode || '',
      phone:       venue?.phone               || '',
      email:       venue?.email               || '',
      isActive:    venue?.isActive            ?? true,
    };

    switch (activeSection) {
      case 'profile':
        return <ProfileSection userData={profileData} onSave={(d) => handleSave(d, 'Profile')} />;
      case 'workspace':
        return <WorkspaceSection workspaceData={workspaceData} onSave={(d) => handleSave(d, 'Workspace')} />;
      case 'security':
        return (
          <SecuritySection
            onSave={(d) => handleSave(d, 'Security')}
            onChangePassword={async (d) => { await handleSave(d, 'Password'); }}
          />
        );
      default:
        return null;
    }
  };

  const activeLabel = sections.find((s) => s.id === activeSection)?.label ?? '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8fafc' }}>

      {/* ── Header ── */}
      <Box sx={{
        px: 3,
        py: 2,
        borderBottom: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.0625rem' }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {activeLabel}
        </Typography>
      </Box>

      {/* ── Body: nav + content ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
      }}>

        {/* Nav panel */}
        <Box sx={{
          width: { xs: '100%', md: 220 },
          flexShrink: 0,
          borderRight: { xs: 'none', md: '1px solid #e2e8f0' },
          borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
          bgcolor: '#ffffff',
          overflowY: 'auto',
        }}>
          <SettingsNav
            sections={sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </Box>

        {/* Content panel */}
        <Box sx={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          p: { xs: 2, md: 3 },
        }}>
          {renderContent()}
        </Box>
      </Box>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};


export default Settings;
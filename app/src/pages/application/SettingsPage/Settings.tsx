import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PersonOutlined,
  BusinessOutlined,
  LockOutlined,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/common/Auth';
import { useUserData } from '../../../contexts/application/UserData';
import { getUserFirstName } from '../../../utils/data/userUtils';
import ProfileSection from './components/ProfileSection';
import SecuritySection from './components/SecuritySection';
import WorkspaceSection from './components/WorkspaceSection';

const ROLE_DISPLAY: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  operator: 'Operator',
  customer: 'Customer',
};

const SECTIONS = [
  { id: 'profile',   label: 'Profile',   icon: <PersonOutlined fontSize="small" />   },
  { id: 'workspace', label: 'Workspace', icon: <BusinessOutlined fontSize="small" /> },
  { id: 'security',  label: 'Security',  icon: <LockOutlined fontSize="small" />     },
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  useUserData(); // keep provider active

  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const firstName = user ? getUserFirstName(user) : '';
  const roleLabel = (() => {
    const r = user?.role;
    if (!r) return '';
    if (typeof r === 'string') return ROLE_DISPLAY[r] ?? r;
    return (r as any).displayName || (r as any).name || '';
  })();

  const handleSave = async (_data: unknown, section: string) => {
    try {
      setSnackbar({ open: true, message: `${section} settings saved successfully`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: `Failed to save ${section} settings`, severity: 'error' });
    }
  };

  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const renderSection = () => {
    switch (SECTIONS[activeTab]?.id) {
      case 'profile':
        return <ProfileSection />;
      case 'workspace':
        return <WorkspaceSection onSave={() => handleSave(null, 'Workspace')} />;
      case 'security':
        return <SecuritySection />;
      default:
        return null;
    }
  };

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 2, sm: '32px' },
          pt: '24px',
          pb: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: 20, lineHeight: 1.3 }}>
            Settings
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
            {[firstName, roleLabel].filter(Boolean).join(' · ') || 'Account settings'}
          </Typography>
        </Box>

        {/* Date chip */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: '#f4f4f4',
            borderRadius: '8px',
            px: 1.5,
            py: 0.75,
          }}
        >
          <CalendarToday sx={{ fontSize: 14, color: '#666666' }} />
          <Typography sx={{ fontSize: 12, color: '#666666', fontWeight: 500 }}>
            {dateLabel}
          </Typography>
        </Box>
      </Box>

      {/* ── Tab Bar ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: 'none',
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
        }}
      >
        <Box sx={{ px: { xs: 1, sm: 2, md: '32px' } }}>
          <Tabs
            value={activeTab}
            onChange={(_e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{
              style: { backgroundColor: '#1976D2', height: 3 },
            }}
            sx={{
              minHeight: 52,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 52,
                color: '#666666',
                gap: 0.75,
                '&.Mui-selected': {
                  color: '#1C1C1E',
                },
              },
            }}
          >
            {SECTIONS.map((section) => (
              <Tab
                key={section.id}
                label={section.label}
                icon={section.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* ── Content Area ── */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3, pb: 6 }}>
        {renderSection()}
      </Box>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;

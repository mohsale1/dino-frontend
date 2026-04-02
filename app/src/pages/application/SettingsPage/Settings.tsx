import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
import { ROLE_COLORS } from '../../../constants/app';
import ProfileSection from './components/ProfileSection';
import SecuritySection from './components/SecuritySection';
import WorkspaceSection from './components/WorkspaceSection';

const BRAND = {
  primary: '#1976D2',
  primaryHover: '#1565C0',
  primaryBg: 'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

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
  const { user, userPermissions } = useAuth();
  useUserData(); // keep provider active

  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const firstName  = user ? getUserFirstName(user) : '';
  const roleLabel  = user?.role ? (ROLE_DISPLAY[user.role] ?? user.role) : '';

  const rawRole = (userPermissions?.role?.name || (user as any)?.role?.name || user?.role || '').toLowerCase();
  const roleKey: keyof typeof ROLE_COLORS = rawRole.includes('owner') || rawRole.includes('super')
    ? 'Owner'
    : rawRole.includes('manager') || rawRole.includes('admin')
    ? 'Manager'
    : 'User';
  const rc = ROLE_COLORS[roleKey];

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

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* ── Hero Banner ── */}
      <Box
        sx={{
          background: rc.gradient,
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
            background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
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
            background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Hero content */}
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant="overline"
            sx={{ color: `${rc.chipText}bf`, fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}
          >
            {[firstName, roleLabel].filter(Boolean).join(' · ') || 'ACCOUNT'}
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
            Settings
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
            <CalendarToday sx={{ fontSize: 13, color: `${rc.chipText}99` }} />
            <Typography
              variant="caption"
              sx={{ color: `${rc.chipText}99`, fontWeight: 500, fontSize: '0.75rem' }}
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
      </Box>

      {/* ── Tab Bar ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          px: { xs: 1, sm: 2, md: 4 },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{
            style: { backgroundColor: BRAND.primary, height: 3 },
          }}
          sx={{
            minHeight: 52,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              minHeight: 52,
              color: '#64748b',
              gap: 0.75,
              '&.Mui-selected': {
                color: BRAND.primary,
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

      {/* ── Content Area ── */}
      <Box sx={{ px: { xs: 1.5, sm: 3, md: 5 }, pt: { xs: 2.5, sm: 4 }, pb: { xs: 4, sm: 6 } }}>
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

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PersonOutlined,
  BusinessOutlined,
  LockOutlined,
  CalendarToday,
  RateReviewOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/common/Auth';
import { useUserData } from '../../../contexts/application/UserData';
import { getUserFirstName } from '../../../utils/data/userUtils';
import ProfileSection from './components/ProfileSection';
import SecuritySection from './components/SecuritySection';
import WorkspaceSection from './components/WorkspaceSection';
import ReviewSection from './components/ReviewSection';

const ROLE_DISPLAY: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  operator: 'Operator',
  customer: 'Customer',
};

const SECTIONS = [
  { id: 'profile',   label: 'Profile',   icon: PersonOutlined,     description: 'Personal info & avatar'   },
  { id: 'workspace', label: 'Workspace', icon: BusinessOutlined,   description: 'Venue details & location' },
  { id: 'security',  label: 'Security',  icon: LockOutlined,       description: 'Password & access'        },
  { id: 'review',    label: 'Review',    icon: RateReviewOutlined, description: 'Share your feedback'      },
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  useUserData();

  const [activeSection, setActiveSection] = useState('profile');
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

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':   return <ProfileSection />;
      case 'workspace': return <WorkspaceSection onSave={() => handleSave(null, 'Workspace')} />;
      case 'security':  return <SecuritySection />;
      case 'review':    return <ReviewSection />;
      default:          return null;
    }
  };

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Box sx={{ maxWidth: '1440px', margin: '0 auto', px: { xs: 2, sm: 3 }, pt: 3, pb: 6 }}>

      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 4 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#1C1C1E', lineHeight: 1.2 }}>
            Settings
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#666666', mt: 0.5 }}>
            {[firstName, roleLabel].filter(Boolean).join(' · ') || 'Account settings'}
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 0.75,
            bgcolor: '#F7F9FA',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            px: 1.5,
            py: 0.75,
            flexShrink: 0,
          }}
        >
          <CalendarToday sx={{ fontSize: 14, color: '#666666' }} />
          <Typography sx={{ fontSize: 12, color: '#666666', fontWeight: 500 }}>
            {dateLabel}
          </Typography>
        </Box>
      </Box>

      {/* ── Mobile: horizontal pill nav ── */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <Box
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.875,
                borderRadius: '8px',
                cursor: 'pointer',
                border: `1px solid ${isActive ? '#1976D2' : '#e0e0e0'}`,
                bgcolor: isActive ? 'rgba(25,118,210,0.08)' : '#ffffff',
                transition: 'all 0.15s',
              }}
            >
              <Icon sx={{ fontSize: 16, color: isActive ? '#1976D2' : '#666666' }} />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#1976D2' : '#1C1C1E' }}>
                {section.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* ── Two-column layout ── */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch' }}>

        {/* ── Left: Nav sidebar ── */}
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: '#ffffff',
            alignSelf: 'flex-start',
            position: 'sticky',
            top: 80,
          }}
        >
          <Box sx={{ px: 2, py: 1.75, borderBottom: '1px solid #e0e0e0', bgcolor: '#F7F9FA' }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#999999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Account
            </Typography>
          </Box>

          <Box sx={{ py: 1 }}>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <Box
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    mx: 1,
                    my: 0.25,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    bgcolor: isActive ? 'rgba(25,118,210,0.08)' : 'transparent',
                    transition: 'background-color 0.15s',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(25,118,210,0.08)' : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      bgcolor: isActive ? 'rgba(25,118,210,0.12)' : '#F7F9FA',
                      border: `1px solid ${isActive ? 'rgba(25,118,210,0.25)' : '#e0e0e0'}`,
                      color: isActive ? '#1976D2' : '#666666',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon sx={{ fontSize: 17 }} />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#1976D2' : '#1C1C1E',
                        lineHeight: 1.3,
                        transition: 'color 0.15s',
                      }}
                    >
                      {section.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        color: '#999999',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {section.description}
                    </Typography>
                  </Box>

                  {isActive && (
                    <Box
                      sx={{
                        width: 3,
                        height: 20,
                        borderRadius: '2px',
                        bgcolor: '#1976D2',
                        flexShrink: 0,
                        ml: 'auto',
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── Right: Section content ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {renderSection()}
        </Box>

      </Box>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;

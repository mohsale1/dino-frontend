import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Card,
  Chip,
  Skeleton,
  Switch,
} from '@mui/material';
import {
  PersonOutlined,
  BusinessOutlined,
  LockOutlined,
  CalendarToday,
  RateReviewOutlined,
  CreditCardOutlined,
  StorefrontOutlined,
  LocationOnOutlined,
  QrCodeOutlined,
  PointOfSaleOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/common/Auth';
import { useUserData } from '../../../contexts/application/UserData';
import { getUserFirstName } from '../../../utils/data/userUtils';
import ProfileSection from './components/ProfileSection';
import SecuritySection from './components/SecuritySection';
import WorkspaceSection from './components/WorkspaceSection';
import ReviewSection from './components/ReviewSection';
import BillingSection from './components/BillingSection';
import { personaService, Persona } from '../../../services/application/persona.service';

const PRIMARY         = '#1976D2';
const PRIMARY_BG      = 'rgba(25,118,210,0.08)';
const PRIMARY_BG_ICON = 'rgba(25,118,210,0.12)';
const PRIMARY_BORDER  = 'rgba(25,118,210,0.2)';

const ROLE_DISPLAY: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  operator: 'Operator',
  customer: 'Customer',
};

const SECTIONS = [
  { id: 'profile',   label: 'Profile',   icon: PersonOutlined,     description: 'Personal info & avatar'   },
  { id: 'workspace', label: 'Workspace', icon: BusinessOutlined,   description: 'Venue details & location' },
  { id: 'outlets',   label: 'Outlets',   icon: StorefrontOutlined, description: 'Manage your outlets'      },
  { id: 'security',  label: 'Security',  icon: LockOutlined,       description: 'Password & access'        },
  { id: 'billing',   label: 'Billing',   icon: CreditCardOutlined, description: 'Plan & billing details'   },
  { id: 'review',    label: 'Review',    icon: RateReviewOutlined, description: 'Share your feedback'      },
];

// ── OutletsSection ────────────────────────────────────────────────────────────

const OutletsSection: React.FC = () => {
  const [personas, setPersonas]     = useState<Persona[]>([]);
  const [loading, setLoading]       = useState(true);
  const [toggling, setToggling]     = useState<Record<number, boolean>>({});
  const [error, setError]           = useState<string | null>(null);

  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await personaService.getPersonas();
      setPersonas(res.data.filter((p) => !p.is_deactivated));
    } catch {
      setError('Failed to load outlets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPersonas(); }, [fetchPersonas]);

  const handleToggle = async (persona: Persona) => {
    const next = !persona.is_open;
    setToggling((prev) => ({ ...prev, [persona.id]: true }));
    setPersonas((prev) =>
      prev.map((p) => (p.id === persona.id ? { ...p, is_open: next } : p))
    );
    try {
      await personaService.setPersonaOpenStatus(persona.id, next);
    } catch {
      // revert on failure
      setPersonas((prev) =>
        prev.map((p) => (p.id === persona.id ? { ...p, is_open: !next } : p))
      );
    } finally {
      setToggling((prev) => ({ ...prev, [persona.id]: false }));
    }
  };

  const buildAddress = (p: Persona): string => {
    return [p.address, p.city, p.state, p.country]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <Box>
      {/* Section header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1C1C1E', mb: 0.5 }}>
          Outlets
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#666666' }}>
          View and manage the open/closed status of your outlets.
        </Typography>
      </Box>

      {/* Error state */}
      {error && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: '10px',
            bgcolor: 'rgba(211,47,47,0.06)',
            border: '1px solid rgba(211,47,47,0.2)',
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: '#d32f2f' }}>{error}</Typography>
        </Box>
      )}

      {/* Skeleton */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              elevation={0}
              sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', p: 2.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '10px' }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="25%" height={16} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton variant="rounded" width={48} height={24} sx={{ borderRadius: '12px' }} />
              </Box>
              <Skeleton variant="text" width="60%" height={16} />
            </Card>
          ))}
        </Box>
      )}

      {/* Persona cards */}
      {!loading && !error && personas.length === 0 && (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            border: '1px dashed #e0e0e0',
            borderRadius: '12px',
            bgcolor: '#fafafa',
          }}
        >
          <StorefrontOutlined sx={{ fontSize: 40, color: '#cccccc', mb: 1 }} />
          <Typography sx={{ fontSize: '0.875rem', color: '#999999' }}>
            No outlets found.
          </Typography>
        </Box>
      )}

      {!loading && !error && personas.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {personas.map((persona) => {
            const isQR      = persona.order_type === 0;
            const address   = buildAddress(persona);
            const isToggling = toggling[persona.id] ?? false;

            return (
              <Card
                key={persona.id}
                elevation={0}
                sx={{
                  border: `1px solid ${persona.is_open ? PRIMARY_BORDER : '#e0e0e0'}`,
                  borderRadius: '12px',
                  p: 2.5,
                  bgcolor: persona.is_open ? PRIMARY_BG : '#ffffff',
                  transition: 'border-color 0.2s, background-color 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      bgcolor: persona.is_open ? PRIMARY_BG_ICON : '#f8fafc',
                      border: `1px solid ${persona.is_open ? PRIMARY_BORDER : '#e0e0e0'}`,
                      color: persona.is_open ? PRIMARY : '#999999',
                      transition: 'all 0.2s',
                    }}
                  >
                    <StorefrontOutlined sx={{ fontSize: 20 }} />
                  </Box>

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          color: '#1C1C1E',
                          lineHeight: 1.3,
                        }}
                      >
                        {persona.name}
                      </Typography>

                      {/* Order type badge */}
                      <Chip
                        icon={isQR
                          ? <QrCodeOutlined sx={{ fontSize: '13px !important' }} />
                          : <PointOfSaleOutlined sx={{ fontSize: '13px !important' }} />
                        }
                        label={isQR ? 'QR / Online' : 'POS / Manual'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: isQR ? 'rgba(25,118,210,0.08)' : 'rgba(102,102,102,0.08)',
                          color: isQR ? PRIMARY : '#555555',
                          border: `1px solid ${isQR ? PRIMARY_BORDER : 'rgba(102,102,102,0.2)'}`,
                          '& .MuiChip-icon': { color: 'inherit' },
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />

                      {/* Open/Closed status chip */}
                      <Chip
                        label={persona.is_open ? 'Open' : 'Closed'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: persona.is_open
                            ? 'rgba(46,125,50,0.08)'
                            : 'rgba(211,47,47,0.08)',
                          color: persona.is_open ? '#2e7d32' : '#d32f2f',
                          border: `1px solid ${persona.is_open ? 'rgba(46,125,50,0.2)' : 'rgba(211,47,47,0.2)'}`,
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                    </Box>

                    {/* Address */}
                    {address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnOutlined sx={{ fontSize: 13, color: '#999999', flexShrink: 0 }} />
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            color: '#888888',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {address}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Toggle */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <Switch
                      checked={persona.is_open}
                      disabled={isToggling}
                      onChange={() => handleToggle(persona)}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: PRIMARY,
                        },
                      }}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: '#999999', mt: 0.25 }}>
                      {persona.is_open ? 'Open' : 'Closed'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

// ── Settings ──────────────────────────────────────────────────────────────────

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
      case 'outlets':   return <OutletsSection />;
      case 'security':  return <SecuritySection />;
      case 'billing':   return <BillingSection />;
      case 'review':    return <ReviewSection />;
      default:          return null;
    }
  };

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 4, md: 5 },
          pt: 3,
          pb: 3,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '22px', letterSpacing: '-0.3px', color: '#1C1C1E' }}>
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
            bgcolor: '#f8fafc',
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

      {/* ── Content area ── */}
      <Box sx={{ px: 2, pt: 3, pb: 6, bgcolor: '#f8fafc' }}>

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
                  border: `1px solid ${isActive ? PRIMARY : '#e0e0e0'}`,
                  bgcolor: isActive ? PRIMARY_BG : '#ffffff',
                  transition: 'all 0.15s',
                }}
              >
                <Icon sx={{ fontSize: 16, color: isActive ? PRIMARY : '#666666' }} />
                <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500, color: isActive ? PRIMARY : '#1C1C1E' }}>
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
            <Box sx={{ px: 2, py: 1.75, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc' }}>
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
                      bgcolor: isActive ? PRIMARY_BG : 'transparent',
                      transition: 'background-color 0.15s',
                      '&:hover': {
                        bgcolor: isActive ? PRIMARY_BG : 'rgba(0,0,0,0.04)',
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
                        bgcolor: isActive ? PRIMARY_BG_ICON : '#f8fafc',
                        border: `1px solid ${isActive ? PRIMARY_BORDER : '#e0e0e0'}`,
                        color: isActive ? PRIMARY : '#666666',
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
                          color: isActive ? PRIMARY : '#1C1C1E',
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
                          bgcolor: PRIMARY,
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

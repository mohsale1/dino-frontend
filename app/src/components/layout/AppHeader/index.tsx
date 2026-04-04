import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box,
  Container, useScrollTrigger, useTheme, useMediaQuery, alpha,
} from '@mui/material';
import { AccountCircle, ExitToApp } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import DinoLogo from '../../ui/DinoLogo';
import { NotificationCenter } from '../../common';
import AppMobileMenu from '../AppMobileMenu';
import { getUserFirstName } from '../../../utils/data/userUtils';
import { ConfirmationDialog } from '../../dialogs';

const COMPANY_INFO = { name: 'Dino', tagline: 'Smart Ordering Solutions' };

const NAV_ITEMS = [
  { label: 'Features',  id: 'features'     },
  { label: 'Stats',     id: 'stats'        },
  { label: 'Reviews',   id: 'testimonials' },
  { label: 'FAQ',       id: 'faq'          },
];

interface AppHeaderProps {
  onSectionScroll?: (sectionId: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSectionScroll }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [activeSection,   setActiveSection]   = useState('hero');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  const isHomePage   = location.pathname === '/' || location.pathname === '/home';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Home nav items — includes hero anchor for active-section tracking
  const homeNavItems = [
    { id: 'hero',         label: 'Home'     },
    ...NAV_ITEMS,
  ];

  // ── Scroll to section ────────────────────────────────────────────────────────
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);

    const doScroll = () => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const navbarHeight = window.innerWidth >= 900 ? 70 : 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
      if (onSectionScroll) onSectionScroll(sectionId);
    };

    if (!isHomePage) {
      navigate('/');
      setTimeout(doScroll, 100);
    } else {
      doScroll();
    }
  };

  // ── Active section tracking ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isHomePage) return;

    const onScroll = () => {
      const navbarHeight = window.innerWidth >= 900 ? 70 : 64;
      const scrollPosition = window.scrollY + navbarHeight + 10;
      let current = homeNavItems[0].id;
      for (const { id } of homeNavItems) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) current = id;
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomePage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout  = () => setLogoutModalOpen(true);
  const confirmLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setLogoutModalOpen(false);
  };

  const isTransparent = isHomePage && !trigger;

  // ── Desktop navigation ───────────────────────────────────────────────────────
  const renderDesktopNavigation = () => {
    if (!isHomePage) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {NAV_ITEMS.map(({ id, label }) => {
          const active = activeSection === id;
          return (
            <Button
              key={id}
              onClick={() => scrollToSection(id)}
              sx={{
                textTransform: 'none',
                fontWeight: active ? 700 : 500,
                px: 2,
                py: 1,
                borderRadius: 2,
                fontSize: '0.9375rem',
                minHeight: 40,
                position: 'relative',
                backgroundColor: 'transparent',
                color: isTransparent
                  ? (active ? '#ffffff' : alpha('#ffffff', 0.75))
                  : (active ? '#1976D2' : '#64748b'),
                '&::after': active && !isTransparent ? {
                  content: '""',
                  position: 'absolute',
                  bottom: '6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '18px',
                  height: '2px',
                  borderRadius: '1px',
                  backgroundColor: '#1976D2',
                } : {},
                '&:hover': {
                  backgroundColor: isTransparent
                    ? alpha('#ffffff', 0.1)
                    : alpha('#1976D2', 0.06),
                  color: isTransparent ? '#ffffff' : '#1976D2',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </Button>
          );
        })}
      </Box>
    );
  };

  // ── User / auth actions ──────────────────────────────────────────────────────
  const renderUserActions = () => {
    if (user) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationCenter />
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/settings')}
            startIcon={<AccountCircle sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: 'none', fontWeight: 500, px: 2, py: 0.75,
              borderRadius: 1.5, fontSize: '0.875rem',
              borderColor: '#e2e8f0', color: '#475569', minHeight: 36,
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: alpha('#0f172a', 0.04),
              },
              transition: 'all 0.2s ease',
            }}
          >
            {getUserFirstName(user) || 'Settings'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleLogout}
            startIcon={<ExitToApp sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: 'none', fontWeight: 500, px: 2, py: 0.75,
              borderRadius: 1.5, fontSize: '0.875rem',
              borderColor: '#e2e8f0', color: '#475569', minHeight: 36,
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: alpha('#1976d2', 0.04),
                color: '#1976d2',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Logout
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button
          variant="text"
          onClick={() => navigate('/login')}
          sx={{
            textTransform: 'none', fontWeight: 500, px: 2.5, py: 1,
            borderRadius: 1.5, fontSize: '0.9375rem', minHeight: 40,
            color: isTransparent ? alpha('#ffffff', 0.9) : '#475569',
            '&:hover': {
              backgroundColor: isTransparent
                ? alpha('#ffffff', 0.1)
                : alpha('#0f172a', 0.06),
              color: isTransparent ? '#ffffff' : '#0f172a',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Sign In
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/register')}
          sx={{
            fontWeight: 600, textTransform: 'none', px: 3, py: 1,
            borderRadius: 1.5, fontSize: '0.9375rem', minHeight: 40,
            backgroundColor: isTransparent ? '#ffffff' : '#1976D2',
            color: isTransparent ? '#0f172a' : '#ffffff',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: isTransparent ? '#f8fafc' : '#1565C0',
              boxShadow: 'none',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Get Started
        </Button>
      </Box>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: isTransparent
            ? 'transparent'
            : 'rgba(255,255,255,0.98)',
          backdropFilter: isTransparent ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isTransparent ? 'none' : 'blur(20px)',
          borderBottom: `1px solid ${isTransparent ? 'transparent' : 'rgba(15,23,42,0.08)'}`,
          boxShadow: isTransparent ? 'none' : '0 2px 8px rgba(15,23,42,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 1200,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 3 } }}>
          <Toolbar sx={{ px: 0, minHeight: { xs: 64, md: 70 } }}>

            {/* Logo */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center',
                flexGrow: 1, cursor: 'pointer', gap: 1.5,
              }}
              onClick={() => navigate(user ? '/admin/dashboard' : '/')}
            >
              <DinoLogo size={isMobile ? 32 : 36} animated />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    color: isTransparent ? '#ffffff' : '#0f172a',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {COMPANY_INFO.name}
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: isTransparent ? alpha('#ffffff', 0.7) : '#64748b',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      display: 'block',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {COMPANY_INFO.tagline}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Desktop nav + actions */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {renderDesktopNavigation()}
                {renderUserActions()}
              </Box>
            )}

            {/* Animated hamburger */}
            {isMobile && (
              <Box
                component="button"
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                sx={{
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center',
                  gap: '5px',
                  width: 40, height: 40,
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0,
                  borderRadius: 1, flexShrink: 0,
                }}
              >
                {/* Bar 1 — rotates to top arm of X */}
                <Box
                  sx={{
                    width: 22, height: 2, borderRadius: 1,
                    backgroundColor: isTransparent ? '#ffffff' : '#475569',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    transformOrigin: 'center',
                    transform: mobileMenuOpen
                      ? 'translateY(7px) rotate(45deg)'
                      : 'none',
                  }}
                />
                {/* Bar 2 — fades out */}
                <Box
                  sx={{
                    width: 22, height: 2, borderRadius: 1,
                    backgroundColor: isTransparent ? '#ffffff' : '#475569',
                    transition: 'opacity 0.2s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    opacity: mobileMenuOpen ? 0 : 1,
                    transform: mobileMenuOpen ? 'scaleX(0)' : 'scaleX(1)',
                  }}
                />
                {/* Bar 3 — rotates to bottom arm of X */}
                <Box
                  sx={{
                    width: 22, height: 2, borderRadius: 1,
                    backgroundColor: isTransparent ? '#ffffff' : '#475569',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    transformOrigin: 'center',
                    transform: mobileMenuOpen
                      ? 'translateY(-7px) rotate(-45deg)'
                      : 'none',
                  }}
                />
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <AppMobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        homeNavItems={homeNavItems}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        user={user}
        onLogout={handleLogout}
        onNavigate={(path) => { navigate(path); setMobileMenuOpen(false); }}
        isHomePage={isHomePage}
        isAdminRoute={isAdminRoute}
      />

      <ConfirmationDialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message={`Are you sure you want to logout${user ? `, ${getUserFirstName(user) || user.email}` : ''}?`}
        confirmText="Logout"
      />
    </>
  );
};

export default AppHeader;
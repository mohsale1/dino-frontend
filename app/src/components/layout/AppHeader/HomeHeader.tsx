import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Container,
  alpha,
  useScrollTrigger,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { APP_CONFIG } from '../../../constants/app';
import DinoLogo from '../../ui/DinoLogo';
import AppMobileMenu from '../AppMobileMenu';

// ── Constants ──────────────────────────────────────────────────────────────────
const HOME_NAV = [
  { id: 'features',     label: 'Features'     },
  { id: 'how-it-works', label: 'How It Works'  },
  { id: 'use-cases',    label: 'Use Cases'     },
  { id: 'testimonials', label: 'Reviews'       },
  { id: 'faq',          label: 'FAQ'           },
];

const HomeHeader: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const isLg      = useMediaQuery(theme.breakpoints.up('lg'));

  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection,  setActiveSection]  = useState('hero');

  // Scroll trigger — once user scrolls past 20px the header becomes opaque
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  // Transparent when at the very top of the homepage
  const isTransparent = !trigger;

  // ── Track active section on scroll ───────────────────────────────────────────
  useEffect(() => {
    const sectionIds = ['hero', ...HOME_NAV.map((n) => n.id)];

    const handleScroll = () => {
      const scrollY = window.scrollY + 200;
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && scrollY >= el.offsetTop) current = id;
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // ── Smooth scroll ─────────────────────────────────────────────────────────────
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        setActiveSection(id);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // ── Desktop nav ───────────────────────────────────────────────────────────────
  const renderDesktopNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 0, lg: 0.5 } }}>
      {HOME_NAV.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <Button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            sx={{
              color: isTransparent
                ? (isActive ? '#ffffff' : alpha('#ffffff', 0.8))
                : (isActive ? '#0f172a' : '#64748b'),
              fontWeight: isActive ? 600 : 500,
              textTransform: 'none',
              px: { md: 1.25, lg: 2 },
              py: { md: 0.75, lg: 1 },
              borderRadius: 2,
              fontSize: { md: '0.8125rem', lg: '0.9375rem' },
              minWidth: 0,
              backgroundColor: isActive && !isTransparent
                ? alpha('#0f172a', 0.06)
                : 'transparent',
              '&:hover': {
                backgroundColor: isTransparent
                  ? alpha('#ffffff', 0.12)
                  : alpha('#0f172a', 0.08),
                color: isTransparent ? '#ffffff' : '#0f172a',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );

  // ── Desktop right actions ─────────────────────────────────────────────────────
  const renderUserActions = () => {
    if (user) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 1, lg: 1.5 } }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/dashboard')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: { md: 1.75, lg: 2.5 },
              py: { md: 0.625, lg: 0.875 },
              borderRadius: 2,
              fontSize: { md: '0.8125rem', lg: '0.875rem' },
              borderColor: isTransparent ? alpha('#ffffff', 0.45) : '#e0e0e0',
              color: isTransparent ? '#ffffff' : '#475569',
              '&:hover': {
                borderColor: isTransparent ? '#ffffff' : '#1976D2',
                backgroundColor: isTransparent ? alpha('#ffffff', 0.1) : alpha('#1976D2', 0.04),
                color: isTransparent ? '#ffffff' : '#1976D2',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              px: { md: 1.5, lg: 2 },
              py: { md: 0.625, lg: 0.875 },
              borderRadius: 2,
              fontSize: { md: '0.8125rem', lg: '0.875rem' },
              borderColor: isTransparent ? alpha('#ffffff', 0.3) : '#e0e0e0',
              color: isTransparent ? alpha('#ffffff', 0.75) : '#64748b',
              '&:hover': {
                borderColor: isTransparent ? alpha('#ffffff', 0.6) : '#ef4444',
                color: isTransparent ? '#ffffff' : '#ef4444',
                backgroundColor: isTransparent ? alpha('#ffffff', 0.08) : alpha('#ef4444', 0.04),
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 1, lg: 1.5 } }}>
        {/* Sign In — hidden on md to save space, shown lg+ */}
        <Button
          variant="text"
          onClick={() => navigate('/login')}
          sx={{
            display: { md: isLg ? 'inline-flex' : 'none', lg: 'inline-flex' },
            textTransform: 'none',
            fontWeight: 500,
            px: { md: 1.75, lg: 2.5 },
            py: { md: 0.625, lg: 1 },
            borderRadius: 2,
            fontSize: { md: '0.8125rem', lg: '0.9375rem' },
            color: isTransparent ? alpha('#ffffff', 0.85) : '#64748b',
            '&:hover': {
              backgroundColor: isTransparent ? alpha('#ffffff', 0.1) : alpha('#0f172a', 0.06),
              color: isTransparent ? '#ffffff' : '#0f172a',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Sign In
        </Button>

        {/* Get Started */}
        <Button
          variant="contained"
          onClick={() => navigate('/register')}
          disableElevation
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: { md: 2, lg: 3 },
            py: { md: 0.625, lg: 1 },
            borderRadius: 2,
            fontSize: { md: '0.8125rem', lg: '0.9375rem' },
            backgroundColor: isTransparent ? '#ffffff' : '#1976D2',
            color: isTransparent ? '#0b1120' : '#ffffff',
            boxShadow: isTransparent
              ? '0 4px 12px rgba(255,255,255,0.25)'
              : '0 4px 12px rgba(25,118,210,0.25)',
            '&:hover': {
              backgroundColor: isTransparent ? alpha('#ffffff', 0.92) : '#1565C0',
              boxShadow: isTransparent
                ? '0 4px 16px rgba(255,255,255,0.35)'
                : '0 4px 16px rgba(25,118,210,0.35)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Get Started
        </Button>
      </Box>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
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
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1200,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 3 } }}>
          <Toolbar sx={{ px: 0, minHeight: { xs: 64, md: 70 } }}>

            {/* ── Logo ── */}
            <Box
              onClick={() => navigate('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                flexGrow: 1,
                userSelect: 'none',
                '&:hover .logo-wrap': { transform: 'scale(1.05)' },
                transition: 'all 0.2s ease',
              }}
            >
              <Box className="logo-wrap" sx={{ transition: 'transform 0.3s ease' }}>
                <DinoLogo size={isMobile ? 32 : 36} animated />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    color: isTransparent ? '#ffffff' : '#0f172a',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {APP_CONFIG.NAME}
                </Typography>
                {!isMobile && (
                  <Typography
                    sx={{
                      color: isTransparent ? alpha('#ffffff', 0.7) : '#64748b',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      display: 'block',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {APP_CONFIG.TAGLINE}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ── Desktop nav + actions ── */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 1, lg: 2 } }}>
                {renderDesktopNav()}
                {renderUserActions()}
              </Box>
            )}

            {/* ── Mobile hamburger ── */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                sx={{
                  color: isTransparent ? '#ffffff' : '#475569',
                  '&:hover': {
                    backgroundColor: isTransparent
                      ? alpha('#ffffff', 0.1)
                      : alpha('#0f172a', 0.06),
                    color: isTransparent ? '#ffffff' : '#0f172a',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Mobile drawer ── */}
      <AppMobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        homeNavItems={HOME_NAV}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        user={user}
        onLogout={handleLogout}
        onNavigate={(path) => { navigate(path); setMobileMenuOpen(false); }}
        isHomePage={true}
        isAdminRoute={false}
      />
    </>
  );
};


export default HomeHeader;
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  useScrollTrigger,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import DinoLogo from '../../ui/DinoLogo';
import { NotificationCenter } from '../../common';
import MobileMenu from '../MobileMenu';
import { getUserFirstName } from '../../../utils/data/userUtils';
import { ConfirmationDialog } from '../../dialogs';

// Company info (previously from data/info)
const COMPANY_INFO = {
  name: 'Dino',
  tagline: 'Smart Ordering Solutions',
};

interface AppHeaderProps {
  onSectionScroll?: (sectionId: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSectionScroll }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Scroll trigger for navbar background
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  });

  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Navigation items for home page
  const homeNavItems = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    // Close mobile menu first
    setMobileMenuOpen(false);
    
    // Small delay to allow menu to close before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      
      if (element) {
        // Set active section immediately for better UX
        setActiveSection(sectionId);
        
        // Use scrollIntoView for better mobile compatibility
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        
        if (onSectionScroll) {
          onSectionScroll(sectionId);
        }
      }
    }, 300);
  };

  // Track active section on scroll
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const sections = homeNavItems.map(item => item.id);
      const scrollPosition = window.scrollY + 200;

      // Find which section we're currently in
      let currentSection = sections[0];
      
      for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          // Check if scroll position is within this section
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = sections[i];
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setLogoutModalOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isTransparent = isHomePage && !trigger;

  const renderDesktopNavigation = () => {
    if (isHomePage) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {homeNavItems.map((item) => (
            <Button
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollToSection(item.id);
              }}
              sx={{
                cursor: 'pointer',
                pointerEvents: 'auto',
                color: isTransparent
                  ? (activeSection === item.id ? '#ffffff' : alpha('#ffffff', 0.8))
                  : (activeSection === item.id ? '#0f172a' : '#64748b'),
                fontWeight: activeSection === item.id ? 600 : 500,
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: 2,
                fontSize: '0.9375rem',
                position: 'relative',
                minHeight: 40,
                backgroundColor: activeSection === item.id && !isTransparent
                  ? alpha('#0f172a', 0.06)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isTransparent ? alpha('#ffffff', 0.12) : alpha('#0f172a', 0.08),
                  color: isTransparent ? '#ffffff' : '#0f172a',
                  cursor: 'pointer',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      );
    }

    return null;
  };

  const renderUserActions = () => {
    if (user) {
      const dinoAvatar = null; // TODO: Add user avatar support
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationCenter />
          
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/settings')}
            startIcon={
              dinoAvatar ? (
                <Avatar 
                  src={dinoAvatar} 
                  sx={{ 
                    width: 18, 
                    height: 18,
                  }}
                >
                  <DinoLogo size={12} animated={false} />
                </Avatar>
              ) : (
                <AccountCircle sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              fontSize: '0.875rem',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              color: '#475569',
              minHeight: 36,
              '&:hover': {
                borderWidth: 1,
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
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              fontSize: '0.875rem',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              color: '#475569',
              minHeight: 36,
              '&:hover': {
                borderWidth: 1,
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
            textTransform: 'none',
            fontWeight: 500,
            px: 2.5,
            py: 1,
            borderRadius: 1.5,
            fontSize: '0.9375rem',
            color: isTransparent ? alpha('#ffffff', 0.9) : '#475569',
            minHeight: 40,
            '&:hover': {
              backgroundColor: isTransparent ? alpha('#ffffff', 0.1) : alpha('#0f172a', 0.06),
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
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: 1.5,
            fontSize: '0.9375rem',
            minHeight: 40,
            backgroundColor: isTransparent ? '#ffffff' : '#0f172a',
            color: isTransparent ? '#0f172a' : '#ffffff',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: isTransparent ? '#f8fafc' : '#1e293b',
              boxShadow: isTransparent
                ? '0 4px 12px rgba(255, 255, 255, 0.25)'
                : '0 4px 12px rgba(37, 99, 235, 0.25)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Get Started
        </Button>
      </Box>
    );
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: isTransparent ? 'transparent' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: isTransparent ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isTransparent ? 'none' : 'blur(20px)',
          borderBottom: `1px solid ${isTransparent ? 'transparent' : 'rgba(15, 23, 42, 0.08)'}`,
          boxShadow: isTransparent ? 'none' : '0 2px 8px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1200,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 3 } }}>
          <Toolbar sx={{ px: 0, minHeight: { xs: 64, md: 70 } }}>
            {/* Logo and Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                cursor: 'pointer',
                gap: 1.5,
                '&:hover .logo': {
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
              onClick={() => {
                if (user) {
                  navigate('/admin/dashboard');
                } else {
                  navigate('/');
                }
              }}
            >
              <Box className="logo" sx={{ transition: 'transform 0.3s ease' }}>
                <DinoLogo size={isMobile ? 32 : 36} animated={true} />
              </Box>
              <Box>
                <Typography
                  className="company-name"
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
                      color: isTransparent ? alpha('#ffffff', 0.8) : '#64748b',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      mt: 0.25,
                      display: 'block',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {COMPANY_INFO.tagline}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {renderDesktopNavigation()}
                {renderUserActions()}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{
                  color: isTransparent ? '#ffffff' : '#475569',
                  '&:hover': {
                    backgroundColor: isTransparent ? alpha('#ffffff', 0.1) : alpha('#0f172a', 0.06),
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

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        homeNavItems={homeNavItems}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        user={user}
        onLogout={handleLogout}
        onNavigate={(path) => {
          navigate(path);
          setMobileMenuOpen(false);
        }}
        isHomePage={isHomePage}
        isAdminRoute={isAdminRoute}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationDialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message={`Are you sure you want to logout${user ? `, ${getUserFirstName(user) || user.email}` : ''}?`}
        confirmText="Logout"
        cancelLabel="Cancel"
        severity="info"
      />
    </>
  );
};

export default AppHeader;
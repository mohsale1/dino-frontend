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
  Login,
  PersonAdd,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useDinoAvatar } from '../../../contexts/DinoAvatarContext';
import DinoLogo from '../../ui/DinoLogo';
import { NotificationCenter } from '../../common';
import MobileMenu from '../MobileMenu';
import { COMPANY_INFO } from '../../../data/info';
import { getUserFirstName } from '../../../utils/userUtils';
import { isAdminLevel } from '../../../types/auth';
import { LogoutConfirmationModal } from '../../modals';

interface AppHeaderProps {
  onSectionScroll?: (sectionId: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSectionScroll }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { dinoAvatar } = useDinoAvatar();
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
                color: !trigger 
                  ? (activeSection === item.id ? '#ffffff' : alpha('#ffffff', 0.8))
                  : (activeSection === item.id ? '#0f172a' : '#64748b'),
                fontWeight: activeSection === item.id ? 600 : 500,
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: 1.5,
                fontSize: '0.9375rem',
                position: 'relative',
                minHeight: 40,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: !trigger ? alpha('#ffffff', 0.1) : alpha('#0f172a', 0.06),
                  color: !trigger ? '#ffffff' : '#0f172a',
                  cursor: 'pointer',
                },
                transition: 'all 0.2s ease',
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
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationCenter />
          
          <Button
            variant="outlined"
            onClick={() => navigate('/profile')}
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
            {getUserFirstName(user) || 'Profile'}
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
              borderColor: alpha('#ef4444', 0.3),
              color: '#ef4444',
              minHeight: 36,
              '&:hover': {
                borderWidth: 1,
                borderColor: '#ef4444',
                backgroundColor: alpha('#ef4444', 0.04),
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
            color: isHomePage && !trigger ? alpha('#ffffff', 0.9) : '#475569',
            minHeight: 40,
            '&:hover': {
              backgroundColor: isHomePage && !trigger ? alpha('#ffffff', 0.1) : alpha('#0f172a', 0.06),
              color: isHomePage && !trigger ? '#ffffff' : '#0f172a',
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
            backgroundColor: isHomePage && !trigger ? '#ffffff' : '#0f172a',
            color: isHomePage && !trigger ? '#0f172a' : '#ffffff',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: isHomePage && !trigger ? '#f8fafc' : '#1e293b',
              boxShadow: isHomePage && !trigger 
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
          backgroundColor: isHomePage && !trigger
            ? 'transparent'
            : trigger 
              ? 'rgba(255, 255, 255, 0.98)'
              : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: isHomePage && !trigger ? 'none' : 'blur(12px)',
          borderBottom: `1px solid ${trigger ? '#e2e8f0' : 'transparent'}`,
          transition: 'all 0.3s ease',
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
                  navigate('/admin');
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
                    color: isHomePage && !trigger ? '#ffffff' : '#0f172a',
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
                      color: isHomePage && !trigger ? alpha('#ffffff', 0.8) : '#64748b',
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
                  color: isHomePage && !trigger ? '#ffffff' : '#475569',
                  '&:hover': {
                    backgroundColor: isHomePage && !trigger ? alpha('#ffffff', 0.1) : alpha('#0f172a', 0.06),
                    color: isHomePage && !trigger ? '#ffffff' : '#0f172a',
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
      <LogoutConfirmationModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        userName={getUserFirstName(user) || user?.email}
      />
    </>
  );
};

export default AppHeader;

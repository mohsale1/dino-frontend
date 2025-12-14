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
import DinoLogo from '../../DinoLogo';
import { NotificationCenter } from '../../common';
import MobileMenu from '../MobileMenu';
import { COMPANY_INFO } from '../../../data/info';
import { getUserFirstName } from '../../../utils/userUtils';
import { isAdminLevel } from '../../../constants/roles';
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
    threshold: 50,
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
    // console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
    // console.log('Element found:', element);
    
    if (element) {
      // Use scrollIntoView for more reliable scrolling
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      // console.log('Current scroll position:', window.scrollY);
      // console.log('Element position from top:', elementPosition);
      // console.log('Target scroll position:', offsetPosition);
      
      // Try multiple scroll methods for compatibility
      try {
        // Method 1: Direct scrollTo
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Fallback: If smooth scroll doesn't work, use scrollIntoView
        setTimeout(() => {
          if (Math.abs(window.scrollY - offsetPosition) > 50) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
            // Adjust for header after scrollIntoView
            setTimeout(() => {
              window.scrollBy({
                top: -headerOffset,
                behavior: 'smooth'
              });
            }, 100);
          }
        }, 500);
      } catch (error) {
        console.error('Scroll error:', error);
        // Final fallback: instant scroll
        window.scrollTo(0, offsetPosition);
      }
      
      setActiveSection(sectionId);
      if (onSectionScroll) {
        onSectionScroll(sectionId);
      }
    } else {
      console.error('Section not found:', sectionId);
    }
    setMobileMenuOpen(false);
  };

  // Track active section on scroll
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const sections = homeNavItems.map(item => item.id);
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
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
                // console.log('Button clicked:', item.id);
                scrollToSection(item.id);
              }}
              sx={{
                cursor: 'pointer',
                pointerEvents: 'auto',
                color: activeSection === item.id ? 'primary.main' : 'text.primary',
                fontWeight: activeSection === item.id ? 700 : 500,
                textTransform: 'none',
                px: 1,
                py: 1,
                borderRadius: 1,
                fontSize: '0.9375rem',
                position: 'relative',
                minHeight: 40,
                backgroundColor: activeSection === item.id 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  cursor: 'pointer',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: activeSection === item.id ? '60%' : '0%',
                  height: 3,
                  backgroundColor: 'primary.main',
                  borderRadius: 1,
                  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  pointerEvents: 'none',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationCenter />
          
          <Button
            variant="outlined"
            onClick={() => navigate(isAdminLevel(user.role) ? '/admin' : '/profile')}
            startIcon={
              dinoAvatar ? (
                <Avatar 
                  src={dinoAvatar} 
                  sx={{ 
                    width: 24, 
                    height: 24,
                  }}
                >
                  <DinoLogo size={16} animated={false} />
                </Avatar>
              ) : (
                <AccountCircle sx={{ fontSize: 12 }} />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 1,
              py: 1,
              borderRadius: 1,
              fontSize: '0.9375rem',
              borderColor: 'divider',
              color: 'text.primary',
              minHeight: 40,
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {getUserFirstName(user) || 'Profile'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleLogout}
            startIcon={<ExitToApp sx={{ fontSize: 12 }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 1,
              py: 1,
              borderRadius: 1,
              fontSize: '0.9375rem',
              borderColor: alpha(theme.palette.error.main, 0.5),
              color: 'error.main',
              minHeight: 40,
              '&:hover': {
                borderColor: 'error.main',
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                color: 'error.main',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Logout
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/register')}
          startIcon={<PersonAdd sx={{ fontSize: 12 }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 1,
            py: 1,
            borderRadius: 1,
            fontSize: '0.9375rem',
            borderColor: 'divider',
            color: 'text.primary',
            minHeight: 40,
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Sign Up
        </Button>
        
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          startIcon={<Login sx={{ fontSize: 12 }} />}
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: 1,
            fontSize: '0.9375rem',
            minHeight: 40,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Sign In
        </Button>
      </Box>
    );
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          backgroundColor: 'background.paper',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha('#000', 0.08)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1200,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0, sm: 1 }, minHeight: { xs: 64, md: 72 } }}>
            {/* Logo and Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                cursor: 'pointer',
                gap: 1,
                '&:hover .logo': {
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
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
                <DinoLogo size={isMobile ? 40 : 48} animated={true} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '0.95rem', md: '1.375rem' },
                    color: 'text.primary',
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                  }}
                >
                  {COMPANY_INFO.name}
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {COMPANY_INFO.tagline}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {renderDesktopNavigation()}
                {renderUserActions()}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
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
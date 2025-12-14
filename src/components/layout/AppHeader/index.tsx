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
    const element = document.getElementById(sectionId);
    
    if (element) {
      // Calculate proper offset based on navbar height
      const navbarHeight = 100; // Adjust based on actual navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight;

      // Set active section immediately for better UX
      setActiveSection(sectionId);
      
      // Smooth scroll to position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
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
      const scrollPosition = window.scrollY + 200; // Increased offset for better detection

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                fontWeight: activeSection === item.id ? 700 : 600,
                textTransform: 'none',
                px: 3,
                py: 1.25,
                borderRadius: 2.5,
                fontSize: '1rem',
                position: 'relative',
                minHeight: 44,
                backgroundColor: activeSection === item.id 
                  ? alpha(theme.palette.primary.main, 0.12)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: 'primary.main',
                  cursor: 'pointer',
                  transform: 'translateY(-2px)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: activeSection === item.id ? '70%' : '0%',
                  height: 3,
                  backgroundColor: 'primary.main',
                  borderRadius: 2,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationCenter />
          
          <Button
            variant="outlined"
            onClick={() => navigate(isAdminLevel(user.role) ? '/admin' : '/profile')}
            startIcon={
              dinoAvatar ? (
                <Avatar 
                  src={dinoAvatar} 
                  sx={{ 
                    width: 20, 
                    height: 20,
                  }}
                >
                  <DinoLogo size={14} animated={false} />
                </Avatar>
              ) : (
                <AccountCircle sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              py: 0.75,
              borderRadius: 2,
              fontSize: '0.875rem',
              borderWidth: 1.5,
              borderColor: 'divider',
              color: 'text.primary',
              minHeight: 36,
              '&:hover': {
                borderWidth: 1.5,
                borderColor: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
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
              fontWeight: 600,
              px: 2,
              py: 0.75,
              borderRadius: 2,
              fontSize: '0.875rem',
              borderWidth: 1.5,
              borderColor: alpha(theme.palette.error.main, 0.5),
              color: 'error.main',
              minHeight: 36,
              '&:hover': {
                borderWidth: 1.5,
                borderColor: 'error.main',
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                color: 'error.main',
                transform: 'translateY(-1px)',
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/register')}
          startIcon={<PersonAdd sx={{ fontSize: 22 }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            py: 1.25,
            borderRadius: 2.5,
            fontSize: '1rem',
            borderWidth: 2,
            borderColor: 'divider',
            color: 'text.primary',
            minHeight: 44,
            '&:hover': {
              borderWidth: 2,
              borderColor: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Sign Up
        </Button>
        
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          startIcon={<Login sx={{ fontSize: 22 }} />}
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            px: 3.5,
            py: 1.25,
            borderRadius: 2.5,
            fontSize: '1rem',
            minHeight: 44,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
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
        elevation={trigger ? 4 : 0}
        sx={{
          backgroundColor: trigger 
            ? alpha(theme.palette.background.paper, 0.95)
            : alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha('#000', trigger ? 0.12 : 0.06)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1200,
          boxShadow: trigger 
            ? `0 4px 20px ${alpha('#000', 0.08)}`
            : 'none',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, sm: 2 }, minHeight: { xs: 60, md: 64 } }}>
            {/* Logo and Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                cursor: 'pointer',
                gap: 2,
                '&:hover .logo': {
                  transform: 'scale(1.08) rotate(5deg)',
                },
                '&:hover .company-name': {
                  color: 'primary.main',
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
              <Box className="logo" sx={{ transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <DinoLogo size={isMobile ? 36 : 40} animated={true} />
              </Box>
              <Box>
                <Typography
                  className="company-name"
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    color: 'text.primary',
                    letterSpacing: '-0.5px',
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
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      letterSpacing: '0.3px',
                      mt: 0.25,
                      display: 'block',
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
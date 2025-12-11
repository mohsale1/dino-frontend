import React, { useEffect } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useVenueTheme } from '../../contexts/VenueThemeContext';
import { useUserData } from '../../contexts/UserDataContext';

// This is a demo page showing theme-based menu rendering
// TODO: Replace with real menu data from menuService

/**
 * A customer-facing menu page that adapts its content based on the selected venue theme.
 */
const MenuPage: React.FC = () => {
  const { theme, setTheme } = useVenueTheme();
  const { userData, loading: userDataLoading } = useUserData();

  // When user data is available, set the theme based on the venue's setting.
  useEffect(() => {
    if (userData?.venue?.theme) {
      setTheme(userData.venue.theme);
    }
    // If no theme is in the backend, it will keep the default 'pet' theme from the context.
  }, [userData, setTheme]);

  if (userDataLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Menu...</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Menu Management
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Current Theme: <span style={{ textTransform: 'capitalize', color: '#1976d2' }}>{theme}</span>
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        This page is under development. Please use the Menu Management section in the admin dashboard.
      </Typography>
    </Container>
  );
};

export default MenuPage;
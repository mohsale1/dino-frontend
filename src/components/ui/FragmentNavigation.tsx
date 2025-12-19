import React from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Home,
  Restaurant,
  Receipt,
} from '@mui/icons-material';

export type FragmentType = 'home' | 'menu' | 'orders';

interface FragmentNavigationProps {
  activeFragment: FragmentType;
  onFragmentChange: (fragment: FragmentType) => void;
  orderCount?: number;
}

const FragmentNavigation: React.FC<FragmentNavigationProps> = ({
  activeFragment,
  onFragmentChange,
  orderCount = 0,
}) => {
  const theme = useTheme();

  const handleChange = (_event: React.SyntheticEvent, newValue: FragmentType) => {
    onFragmentChange(newValue);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid #E0E0E0',
        boxShadow: 'none',
        backgroundColor: 'white',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={activeFragment}
        onChange={handleChange}
        showLabels
        sx={{
          height: { xs: 64, sm: 70 },
          backgroundColor: 'white',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            color: '#6C757D',
            '&.Mui-selected': {
              color: '#1E3A5F',
              '& .MuiBottomNavigationAction-label': {
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 700,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: 600,
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          value="home"
          icon={<Home sx={{ fontSize: { xs: 24, sm: 26 } }} />}
        />
        <BottomNavigationAction
          label="Menu"
          value="menu"
          icon={<Restaurant sx={{ fontSize: { xs: 24, sm: 26 } }} />}
        />
        <BottomNavigationAction
          label="Orders"
          value="orders"
          icon={
            orderCount > 0 ? (
              <Badge
                badgeContent={orderCount}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 18,
                    minWidth: 18,
                    fontWeight: 700,
                  },
                }}
              >
                <Receipt sx={{ fontSize: { xs: 24, sm: 26 } }} />
              </Badge>
            ) : (
              <Receipt sx={{ fontSize: { xs: 24, sm: 26 } }} />
            )
          }
        />
      </BottomNavigation>
    </Paper>
  );
};

export default FragmentNavigation;
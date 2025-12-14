import React from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  alpha,
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
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 -4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={activeFragment}
        onChange={handleChange}
        showLabels
        sx={{
          height: { xs: 64, sm: 72 },
          backgroundColor: theme.palette.background.paper,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: { xs: '6px 12px 8px', sm: '8px 12px 10px' },
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              '& .MuiBottomNavigationAction-label': {
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 600,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: { xs: '0.7rem', sm: '0.8rem' },
              fontWeight: 500,
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          value="home"
          icon={
            <Home
              sx={{
                fontSize: { xs: 24, sm: 28 },
              }}
            />
          }
        />
        <BottomNavigationAction
          label="Menu"
          value="menu"
          icon={
            <Restaurant
              sx={{
                fontSize: { xs: 24, sm: 28 },
              }}
            />
          }
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
                <Receipt
                  sx={{
                    fontSize: { xs: 24, sm: 28 },
                  }}
                />
              </Badge>
            ) : (
              <Receipt
                sx={{
                  fontSize: { xs: 24, sm: 28 },
                }}
              />
            )
          }
        />
      </BottomNavigation>
    </Paper>
  );
};

export default FragmentNavigation;
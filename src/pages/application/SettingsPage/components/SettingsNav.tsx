/**
 * SettingsNav Component
 * 
 * Clean, professional navigation for settings sections
 */

import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person,
  Business,
  Notifications,
  Security,
  Palette,
} from '@mui/icons-material';

export interface SettingsSection {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface SettingsNavProps {
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  person: <Person />,
  business: <Business />,
  notifications: <Notifications />,
  security: <Security />,
  palette: <Palette />,
};

const SettingsNav: React.FC<SettingsNavProps> = ({
  sections,
  activeSection,
  onSectionChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          p: 1,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            minWidth: 'max-content',
          }}
        >
          {sections.map((section) => (
            <Box
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.5,
                borderRadius: 1.5,
                cursor: 'pointer',
                backgroundColor: activeSection === section.id ? '#f3f4f6' : 'transparent',
                color: activeSection === section.id ? '#1a1a1a' : '#6b7280',
                fontWeight: activeSection === section.id ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                border: activeSection === section.id ? '1px solid #e5e7eb' : '1px solid transparent',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  color: '#1a1a1a',
                },
              }}
            >
              <Box sx={{ display: 'flex', fontSize: 20 }}>{iconMap[section.icon]}</Box>
              <Typography variant="body2" sx={{ fontWeight: 'inherit', fontSize: 'inherit' }}>
                {section.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'sticky',
        top: 24,
      }}
    >
      <Box 
        sx={{ 
          p: 3, 
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            color: '#1a1a1a',
            mb: 0.5,
          }}
        >
          Settings
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6b7280',
            fontSize: '0.875rem',
          }}
        >
          Manage your preferences
        </Typography>
      </Box>

      <List sx={{ p: 2 }}>
        {sections.map((section) => (
          <ListItemButton
            key={section.id}
            selected={activeSection === section.id}
            onClick={() => onSectionChange(section.id)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                '&:hover': {
                  backgroundColor: '#e5e7eb',
                },
              },
              '&:hover': {
                backgroundColor: '#f9fafb',
              },
              transition: 'all 0.2s',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: activeSection === section.id ? '#1a1a1a' : '#6b7280',
                transition: 'color 0.2s',
              }}
            >
              {iconMap[section.icon]}
            </ListItemIcon>
            <ListItemText
              primary={section.label}
              secondary={section.description}
              primaryTypographyProps={{
                fontWeight: activeSection === section.id ? 600 : 500,
                fontSize: '0.9375rem',
                color: activeSection === section.id ? '#1a1a1a' : '#374151',
              }}
              secondaryTypographyProps={{
                fontSize: '0.8125rem',
                color: '#9ca3af',
                sx: { mt: 0.25 },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default SettingsNav;
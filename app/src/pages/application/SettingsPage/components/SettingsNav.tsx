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
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Person,
  Business,
  Security,
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
  security: <Security />,
};

const SettingsNav: React.FC<SettingsNavProps> = ({
  sections,
  activeSection,
  onSectionChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ── Mobile: horizontal scrollable tab strip ──────────────────────────────
  if (isMobile) {
    return (
      <Box sx={{
        display: 'flex',
        gap: 0.5,
        px: 2,
        py: 1.5,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}>
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <Box
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 1.5,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                bgcolor: isActive ? 'rgba(25,118,210,0.08)' : 'transparent',
                color: isActive ? '#1976d2' : '#64748b',
                border: isActive ? '1px solid rgba(25,118,210,0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: isActive ? 'rgba(25,118,210,0.1)' : '#f1f5f9' },
              }}
            >
              <Box sx={{ display: 'flex', fontSize: 18, color: 'inherit' }}>
                {iconMap[section.icon]}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 500, fontSize: '0.875rem', color: 'inherit' }}>
                {section.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  }

  // ── Desktop: vertical list filling the nav column ────────────────────────
  return (
    <List sx={{ p: 1.5 }}>
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <ListItemButton
            key={section.id}
            selected={isActive}
            onClick={() => onSectionChange(section.id)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              py: 1.25,
              px: 1.5,
              '&.Mui-selected': {
                bgcolor: 'rgba(25,118,210,0.08)',
                border: '1px solid rgba(25,118,210,0.15)',
                '&:hover': { bgcolor: 'rgba(25,118,210,0.12)' },
              },
              '&:not(.Mui-selected)': { border: '1px solid transparent' },
              '&:hover:not(.Mui-selected)': { bgcolor: '#f8fafc' },
              transition: 'all 0.15s',
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: isActive ? '#1976d2' : '#64748b' }}>
              {iconMap[section.icon]}
            </ListItemIcon>
            <ListItemText
              primary={section.label}
              secondary={section.description}
              primaryTypographyProps={{
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                color: isActive ? '#1976d2' : '#374151',
              }}
              secondaryTypographyProps={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                sx: { mt: 0.25 },
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
};


export default SettingsNav;

import React from 'react';
import { Tabs as MuiTabs, Tab, Box } from '@mui/material';

export interface TabItem {
  label: React.ReactNode;
  value: string;
  icon?: React.ReactElement;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  children?: (value: string) => React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, value, onChange, children }) => {
  return (
    <Box>
      <MuiTabs
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon || undefined}
            iconPosition="start"
          />
        ))}
      </MuiTabs>
      {children && children(value)}
    </Box>
  );
};

export default Tabs;
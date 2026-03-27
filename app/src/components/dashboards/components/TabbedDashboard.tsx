import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  Restaurant,
  Assessment,
} from '@mui/icons-material';

// Import tab content components
import SalesTab from './tabs/SalesTab';
import ItemsTab from './tabs/ItemsTab';
import WorkspaceTab from './tabs/WorkspaceTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface TabbedDashboardProps {
  stats: any;
  dashboardData: any;
  analyticsData: any;
  menuPerformance: any[];
  tableStatuses: any[];
}

const TabbedDashboard: React.FC<TabbedDashboardProps> = ({
  stats,
  dashboardData,
  analyticsData,
  menuPerformance,
  tableStatuses,
}) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const tabs = [
    {
      label: 'Sales Analytics',
      icon: <TrendingUp />,
      description: 'Revenue, orders, and financial metrics',
    },
    {
      label: 'Items & Performance',
      icon: <Restaurant />,
      description: 'Menu items, frequency, and popularity',
    },
    {
      label: 'Workspace Status',
      icon: <Assessment />,
      description: 'Tables, operations, and overall status',
    },
  ];

  return (
    <Box>
      {/* Tabs Navigation */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#ffffff',
          px: 4,
          pt: 2,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: currentTab === index ? 600 : 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    {tab.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: { xs: 'none', md: 'block' },
                      fontSize: '0.75rem',
                    }}
                  >
                    {tab.description}
                  </Typography>
                </Box>
              }
              sx={{
                textTransform: 'none',
                minHeight: 72,
                alignItems: 'flex-start',
                px: 3,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 20,
                  mb: 0.5,
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box
        sx={{
          backgroundColor: '#f8fafc',
          minHeight: 600,
          px: 4,
        }}
      >
        <TabPanel value={currentTab} index={0}>
          <SalesTab
            stats={stats}
            dashboardData={dashboardData}
            analyticsData={analyticsData}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <ItemsTab
            stats={stats}
            menuPerformance={menuPerformance}
            analyticsData={analyticsData}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <WorkspaceTab
            stats={stats}
            tableStatuses={tableStatuses}
            dashboardData={dashboardData}
          />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default TabbedDashboard;
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Dashboard,
  TrendingUp,
  Restaurant,
  TableRestaurant,
} from '@mui/icons-material';

import OverviewTab from './tabs/OverviewTab';
import SalesTab from './tabs/SalesTab';
import ItemsTab from './tabs/ItemsTab';
import TablesOrdersTab from './tabs/TablesOrdersTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3, px: { xs: 1.5, sm: 2.5, md: 4 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface TabbedDashboardProps {
  dashboardData: any;
  loading: boolean;
  lastUpdated: Date | null;
}

const TAB_DEFINITIONS = [
  {
    label: 'Overview',
    icon: <Dashboard sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Sales & Revenue',
    icon: <TrendingUp sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Menu & Items',
    icon: <Restaurant sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Tables',
    icon: <TableRestaurant sx={{ fontSize: 18 }} />,
  },
];

const TabbedDashboard: React.FC<TabbedDashboardProps> = ({
  dashboardData,
  loading,
}) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Tab Navigation Bar */}
      <Paper
        elevation={0}
        square
        sx={{
          borderRadius: 0,
          bgcolor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 44,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
              px: 2.5,
              gap: 0.75,
              transition: 'color 0.2s, background-color 0.2s',
              '&.Mui-selected': {
                fontWeight: 600,
              },
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
            },
          }}
        >
          {TAB_DEFINITIONS.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              id={`dashboard-tab-${index}`}
              aria-controls={`dashboard-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Box sx={{ bgcolor: '#f8fafc' }}>
        <TabPanel value={currentTab} index={0}>
          {loading ? <OverviewSkeleton /> : <OverviewTab dashboardData={dashboardData} />}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <SalesTab dashboardData={dashboardData} />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <ItemsTab dashboardData={dashboardData} />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <TablesOrdersTab dashboardData={dashboardData} />
        </TabPanel>
      </Box>
    </Box>
  );
};

function OverviewSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" width={220} height={110} sx={{ borderRadius: 2, flex: '1 1 180px' }} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2, flex: '2 1 400px' }} />
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2, flex: '1 1 260px' }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2, flex: '1 1 300px' }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2, flex: '1 1 300px' }} />
      </Box>
    </Box>
  );
}

export default TabbedDashboard;